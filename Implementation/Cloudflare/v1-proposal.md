# Cloudflare Edge — Implementation Proposal

**Date:** 2026-04-22
**Version:** 1.0
**Event:** Frontier Tech Week Y2K Hackathon (6 hours)
**Stack:** Cloudflare Workers · Durable Objects · Sandbox SDK · KV · R2
**Source of truth:** [project.md](../../project.md)
**Companion proposals:** [Database](../Database/v1-proposal.md) · [Jazz](../Jazz/v1-proposal.md) · [Frontend](../Frontend/v1-proposal.md)

---

## Executive Summary

Cloudflare is the load-bearing platform for Geostumble. Every persona is a Durable Object with a brain (DO storage + alarms), a body (KV-served HTML), and hands (Sandbox SDK running an LLM-driven coding agent). The Worker is the single public surface; Vercel only renders chrome around an iframe pointed at `p.geostumble.xyz`.

Five Cloudflare primitives are used, each doing real work (not just hosting):

| Primitive | Role | Why this and not X |
|-----------|------|--------------------|
| **Worker** | Router, admin surface, Jazz bridge | One public endpoint, global edge, zero cold-start |
| **Durable Object** | Per-persona actor, memory, alarm-driven tinker cycle | Only way to get one-instance-per-entity with persistent state + scheduled wakeups |
| **Sandbox SDK** | Filesystem + shell for the coding agent | Agent must `write_file` / `run_shell` against real tidy; mocking kills the demo story |
| **KV** | Hot HTML + ready-pool + asset manifest | Millisecond reads at the edge, eventually consistent is fine for a homepage |
| **R2** | Asset library, page archives, session recordings | No egress fees; assets loaded by iframe HTML directly |

**Out of scope (v1):** Workers AI, Queues, D1, Workers for Platforms, Hyperdrive, Images. Keep the surface small.

---

## Scope

### In
- Worker router with public + admin routes ([§8](../../project.md#L270))
- `PersonaDO` class with `alarm()` tinker cycle, `fetch()` serve path, admin nudge ([§9](../../project.md#L302))
- One Sandbox per tinker cycle; destroyed in `finally` ([§9:337](../../project.md#L337))
- KV layout: `page:{id}:current`, `page:{id}:v{n}`, `ready_pool`, `asset:manifest` ([§7:257](../../project.md#L257))
- R2 buckets: `assets/`, `pages_archive/`, `sessions/` ([§7:262](../../project.md#L262))
- Cost-cap kill-switch reading `cost_ledger` → freezing alarms ([§14:573](../../project.md#L573))
- **Hosting:** Worker on `*.workers.dev` (auto-provisioned), R2 assets on `pub-*.r2.dev` (public dev URL). Custom `geostumble.xyz` DNS deferred — not required for the demo.

### Out (v1)
- Worker auth beyond `ADMIN_TOKEN` bearer
- Rate limiting, WAF rules, bot management
- Worker-level caching (KV is already the cache)
- Multi-region DO placement tuning
- Observability beyond `console.log` + `wrangler tail`

---

## Architecture

```
                  geostumble.xyz (Vercel)
                           │
                           │ iframe src=
                           ▼
                  p.geostumble.xyz (Worker)
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    GET /stumble      GET /p/{id}     POST /admin/*
        │                  │                  │
        ▼                  ▼                  ▼
     KV read         DO.fetch()          DO.nudge()
    ready_pool            │                  │
                          ▼                  ▼
                   KV read page:{id}:current
                          │
                          │ (on alarm or nudge)
                          ▼
                   PersonaDO.runTinkerCycle()
                          │
                ┌─────────┼─────────┐
                ▼         ▼         ▼
            Sandbox   Gemini     Recorder
              │          │          │
              ▼          │          ▼
         index.html ◄────┘     .cast file
              │                      │
              ▼                      ▼
        KV page:{id}:v{n}     R2 sessions/
              │                      │
              ▼                      ▼
         R2 pages_archive/     Mux upload
```

---

## Deliverables

### 1. Worker router (`apps/worker/src/index.ts`)

Responsibilities:
- Parse URL, dispatch to DO by persona ID
- Public routes: `/stumble`, `/p/:id`, `/p/:id/stream`, `/p/:id/meta`, `/health`
- Admin routes: `/admin/nudge/:id`, `/admin/freeze`, `/admin/thaw`, `/admin/cost` — all bearer-token gated
- Return correct `Content-Type` (`text/html` for pages, SSE for streams, JSON for admin/meta)

**`/p/:id/meta`** returns JSON for the Frontend sidebar — combines persona identity + latest snapshot in one call to avoid a chatty N+1 (see [Frontend §5 `lib/worker.ts`](../Frontend/v1-proposal.md)):
```ts
{ personaId, name, era, version, muxPlaybackId: string | null, status: string }
```
Pulled from Neon (`personas` + `page_snapshots` latest) with a 5s in-memory cache per persona — demo doesn't need fresh-every-hit on the sidebar.

> **`status` here is a seed/snapshot value only.** Consumers must rebind to Jazz `PersonaRoom.status` (see [Jazz §6](../Jazz/v1-proposal.md)) after hydration for live updates — otherwise cycle-completion will not clear an "editing" banner.

DO binding lookup:
```ts
const id = env.PERSONA.idFromName(personaId)
const stub = env.PERSONA.get(id)
return stub.fetch(req)
```

### 2. `PersonaDO` class (`apps/worker/src/persona-do.ts`)

Per [§9:302](../../project.md#L302). Key behaviors:

| Method | Purpose |
|--------|---------|
| `constructor` | `blockConcurrencyWhile` loads persona from Neon on first hit, seeds initial alarm with jitter `[60s, 300s]` |
| `fetch(req)` | Dispatches to `adminNudge` / `statusStream` / `serveCurrentPage` based on path |
| `alarm()` | `EDIT_PROBABILITY` (default `0.3`) chance of `runTinkerCycle`; always reschedules next alarm |
| `runTinkerCycle()` | Cost-cap check → set status `editing` → Sandbox → coding agent → KV write → Mux upload → Neon snapshot → destroy sandbox → set `idle` |
| `setStatus(s)` | Fans out: (a) writes to Jazz CoValue via worker-account client, (b) dispatches to DO-local `EventTarget` for SSE subscribers |
| `adminNudge()` | Auth-checked wrapper around `runTinkerCycle`; returns `{version, estimatedSeconds}` |
| `serveCurrentPage()` | Reads `page:{id}:current` from KV, returns `text/html`; 404 if unset |
| `statusStream()` | Returns an SSE `Response` whose body is piped from the DO-local `EventTarget` seeded by `setStatus` |

**Critical invariants:**
- `sandbox.destroy()` in a `finally` block — orphaned sandboxes burn $
- Alarms always reschedule, even on exception
- Jitter prevents thundering-herd when all DOs deployed simultaneously
- `EDIT_PROBABILITY` is env-configurable (crank to `1.0` during rehearsal so every alarm produces a cycle)
- **Sandbox concurrency guard:** a module-level counter (or DO-storage-backed semaphore) caps in-flight sandboxes at `MAX_CONCURRENT_SANDBOXES` (default `5`). `runTinkerCycle` early-returns when saturated so admin-nudge-all storms degrade gracefully instead of tripping Cloudflare account limits.
- **SSE plumbing lives in-DO.** Each DO instance owns an `EventTarget`; `setStatus` dispatches a `StatusEvent` to it before writing Jazz. `statusStream()` attaches a listener and pipes events to the client. This is the Jazz-outage fallback path per [§17 risk row](../../project.md#L660) — it must work independently of Jazz.

### 3. Sandbox integration (`apps/worker/src/sandbox.ts`)

Per [§10:382](../../project.md#L382). Thin wrapper exposing:
- `createSandbox(env)` → returns handle
- `sandbox.writeFile(path, content)`
- `sandbox.readFile(path)`
- `sandbox.exec(cmd)` — used for `tidy -errors /workspace/index.html`
- `sandbox.destroy()`

Agent tool loop lives in `coding-agent.ts`, not here. This file is just the SDK adapter — keeps the agent testable against a mock sandbox if Sandbox SDK eats an hour ([§17 risk](../../project.md#L659)).

### 4. Storage layout

**KV namespace: `PAGES`**
```
page:{personaId}:current     → HTML string (served by /p/{id})
page:{personaId}:v{n}        → HTML string (history)
ready:{personaId}            → "1" (sentinel; presence = eligible for /stumble)
asset:manifest               → JSON: AssetManifestEntry[]
jazz:registry_id             → RoomRegistry CoValue id (seed-script output)
```

> **Why per-persona `ready:*` keys, not a single `ready_pool` JSON array?** KV has no CAS and 20 DOs can add themselves concurrently — a single JSON doc would drop writes. With per-persona keys, each DO writes its own sentinel (no contention), and `/stumble` picks a random persona via `PAGES.list({ prefix: "ready:", limit: 1000 })`.
>
> **Read-back before pooling:** KV is eventually consistent, so `runTinkerCycle` must re-read `page:{id}:current` and confirm it returns the new HTML *before* writing `ready:{id}`. Otherwise `/stumble` can 302 to a persona whose page hasn't replicated, yielding a 404.

**KV namespace: `ADMIN`**
```
frozen                       → "1" | absent (read by alarm() to skip cycle)
```

**R2 bucket: `geostumble-assets`**
```
assets/tiles/{slug}.gif
assets/gifs/{slug}.gif
assets/badges/{slug}.png
assets/wordart/{slug}.png
pages_archive/{personaId}/v{n}.html
sessions/{personaId}/v{n}.cast
```

R2 public dev URL (`https://pub-<hash>.r2.dev`) is enabled on the bucket and injected into the Worker via `ASSETS_PUBLIC_URL`. Agent-written HTML references assets as `<img src="${ASSETS_PUBLIC_URL}/assets/tiles/stars.gif">`. Custom domain (`assets.geostumble.xyz`) is an optional future upgrade — swap `ASSETS_PUBLIC_URL` and add an R2 custom domain binding in the dashboard, no code changes.

### 5. Kill-switch

Two layers:
1. **Per-cycle cost cap** — `costCapHit()` sums `cost_ledger` from Neon before each tinker; early-return if ≥ `COST_CAP_USD` ([§14:573](../../project.md#L573)). **Cached in DO storage with a 30s TTL** (`costCap:checkedAt`, `costCap:sumUsd`) so admin-nudge-all doesn't stampede Neon with 20 simultaneous `SELECT SUM()` queries. Cache is blown on `POST /admin/cost/refresh` for the demo.
2. **Global freeze** — `POST /admin/freeze` sets `ADMIN.frozen = "1"`; `alarm()` checks this before doing work, but always reschedules so `/admin/thaw` resumes cleanly.

> **Deviation from [project.md §8:286](../../project.md#L286).** The spec says freeze "clears all DO alarms". We instead keep alarms scheduled and gate work on the KV flag, because Workers cannot enumerate DO instances — there's no path to re-arm alarms on thaw for DOs that never re-entered their `alarm()` handler. The KV-flag approach is the only design where thaw actually resumes the fleet.

### 6. Environment variables

Worker `.dev.vars` (and `wrangler secret put` for deployed Worker):

| Var | Purpose | Source |
|-----|---------|--------|
| `NEON_DATABASE_URL` | Postgres connection (pooled) | [Database §1](../Database/v1-proposal.md) |
| `GEMINI_API_KEY` | Primary LLM for coding agent | Google AI Studio |
| `ANTHROPIC_API_KEY` | Claude Haiku fallback | Anthropic |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | VOD upload after tinker cycles | Mux dev env |
| `JAZZ_SYNC_URL` | `wss://cloud.jazz.tools/sync` | [Jazz §8](../Jazz/v1-proposal.md) |
| `JAZZ_WORKER_ACCOUNT` | Worker Jazz identity | `npx jazz-run account create` |
| `JAZZ_WORKER_SECRET` | Paired secret | same |
| `JAZZ_REGISTRY_ID` | `RoomRegistry` CoValue id (override only; boot path reads from KV `jazz:registry_id`) | Seed-script output |
| `ADMIN_TOKEN` | Bearer for `/admin/*` | Generated locally, long random |
| `EDIT_PROBABILITY` | Alarm tinker-cycle probability | `0.3` (set `1.0` for rehearsal) |
| `MAX_CONCURRENT_SANDBOXES` | Sandbox concurrency cap | `5` |
| `COST_CAP_USD` | Kill-switch threshold | `50` |

The Worker is the only service holding secrets; Vercel has only `NEXT_PUBLIC_*` (see [Frontend §6](../Frontend/v1-proposal.md)).

> **`JAZZ_REGISTRY_ID` lookup order:** (1) KV `jazz:registry_id` (written by `seed-jazz-rooms.ts`), (2) `env.JAZZ_REGISTRY_ID` secret as override. Single source of truth is the seed script; the secret exists only so local dev can point at a different registry without re-running the seed.
>
> **`ADMIN_TOKEN` reachability:** The Vercel admin panel calls `/admin/*` *from Next.js route handlers (server-side)* — never from the browser. The token lives in Vercel server env (`ADMIN_TOKEN`, no `NEXT_PUBLIC_` prefix), and the browser hits `/api/admin/*` proxies that add the bearer header. A leaked token gives fleet-wide freeze/thaw/nudge, so keep it server-only.

### 7. `wrangler.toml`

Required bindings:
```toml
name = "geostumble-worker"
main = "src/index.ts"
compatibility_date = "2026-04-01"

[[durable_objects.bindings]]
name = "PERSONA"
class_name = "PersonaDO"

[[migrations]]
tag = "v1"
new_classes = ["PersonaDO"]

[[kv_namespaces]]
binding = "PAGES"
id = "<created via wrangler kv namespace create>"

[[kv_namespaces]]
binding = "ADMIN"
id = "<created via wrangler kv namespace create>"

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "geostumble-assets"

# Sandbox SDK binding — exact shape must be pinned during the
# night-before smoke test ([§16:597](../../project.md#L597)). Committing a
# stub here is fine, but leaving the shape unresolved into Hour 0 is the
# top-ranked project risk ([§17:659](../../project.md#L659)) — do not ship
# Hour-0 without this section filled in from a verified `wrangler dev` run.
[[containers]]
# ...

[routes]
pattern = "p.geostumble.xyz/*"
zone_name = "geostumble.xyz"
```

---

## Milestones (maps to §16 ship order)

| Hour | Milestone | Done when |
|------|-----------|-----------|
| Night before | Sandbox SDK smoke test: one HTML generated end-to-end, no UI ([§16:597](../../project.md#L597)) | `wrangler dev` + curl returns agent-written HTML |
| Hour 0 | Worker routes + DO stub; `/p/{id}` serves hardcoded HTML from KV ([§16:601](../../project.md#L601)) | `curl p.geostumble.xyz/p/dave-001` returns 200 HTML |
| Hour 1 | DO loads persona from Neon; `/admin/nudge/dave-001` triggers full cycle ([§16:609](../../project.md#L609)) | Dave's page visible, stored at `page:dave-001:v1` |
| Hour 2 | 20 DOs seeded, alarms staggered, `/stumble` picks from ready pool ([§16:618](../../project.md#L618)) | 10+ entries in `ready_pool`, random redirect works |
| Hour 5 | Cost cap armed, freeze/thaw tested, prewarm script run ([§16:643](../../project.md#L643)) | `/admin/cost` shows < $50, freeze halts new cycles |

---

## Risks

| Risk | From | Mitigation |
|------|------|-----------|
| Sandbox SDK unfamiliar, eats an hour | [§17:659](../../project.md#L659) | Smoke test night-before is gating. Fallback: E2B/Daytona adapter behind `sandbox.ts` interface |
| DO init slow on first Neon query | [§17:667](../../project.md#L667) | `blockConcurrencyWhile` on constructor + Neon connection reuse; accept first-hit latency for non-demo personas |
| Alarm thundering herd on deploy | inherent | Jitter `[60s, 300s]` on initial alarm set in constructor |
| KV eventual consistency → `/stumble` 302s to a persona whose `page:{id}:current` hasn't replicated | inherent | Read-back the `current` key inside `runTinkerCycle` before writing the `ready:{id}` sentinel (see §4). Stale reads on `current` itself are tolerated — refreshes are rare and each write overwrites, never appends |
| Orphaned sandboxes from exceptions | inherent | `try/finally` around every `createSandbox` call; review in hour 5 |
| R2 public URL changes under us | low — `pub-*.r2.dev` is stable per-bucket | Custom domain path is documented if we need it later; the current URL is persisted in `ASSETS_PUBLIC_URL` var |

---

## Open questions

1. **Sandbox SDK pricing model** — per-invocation or per-minute? Affects cost-ledger calc in `runTinkerCycle`.
2. **DO alarm precision** — jitter window assumes ± seconds, not ± minutes. Verify with a stopwatch in hour 0.
3. **Worker bundle size** — agent loop + SDK clients may push past 1MB compressed. If so, lazy-import Mux + Neon clients inside `runTinkerCycle`.
4. **R2 → iframe CORS** — agent-written HTML loads images from `${ASSETS_PUBLIC_URL}` (currently `pub-7313ad06136f4e89bec6f10ac19488c8.r2.dev`). R2 public dev URLs serve with permissive CORS by default; verify during smoke test.
5. **Seed-script bootstrap for `JAZZ_REGISTRY_ID`** — [Frontend §4 step 7](../Frontend/v1-proposal.md) expects `seed-personas.ts` to emit it; [Jazz §7 step 7](../Jazz/v1-proposal.md) defines a separate `seed-jazz-rooms.ts`. Worker needs the ID in `.dev.vars` either way. Recommended resolution: run the seed in two scripts (personas → Neon first, then rooms → Jazz), and have `seed-jazz-rooms.ts` write the registry id to both KV (`jazz:registry_id`) and stdout for copy-paste into `.env.local`.
6. **`/stumble` response shape — RESOLVED: JSON.** Switching from 302 to `200 { personaId }`. Rationale: Vercel's `fetch()` follows redirects by default, so the `/api/stumble` proxy would need `redirect: 'manual'` to read `Location` — easy footgun. JSON has no such hazard, and edge caching of a 302 was never going to matter for a pool that churns on every tinker cycle. Project.md §8:272 must be updated in lockstep; Frontend `/api/stumble` proxy returns `{ personaId, personaMeta }` unchanged from its POV.

---

## File manifest

```
apps/worker/
├── src/
│   ├── index.ts               # router
│   ├── persona-do.ts          # DO class
│   ├── coding-agent.ts        # tool loop (see Gemini proposal)
│   ├── sandbox.ts             # SDK adapter
│   ├── recorder.ts            # (see Mux proposal)
│   ├── mux.ts                 # (see Mux proposal)
│   ├── neon.ts                # (see Database proposal)
│   └── jazz-writer.ts         # (see Jazz proposal)
└── wrangler.toml
```

**Note on Jazz schemas.** The scaffolded `apps/worker/src/schemas/jazz-coValues.ts` will be deleted — Jazz CoValue schemas live in `packages/shared/src/jazz-schema.ts` per [Jazz §6](../Jazz/v1-proposal.md), shared between web + worker.

This proposal owns: `index.ts`, `persona-do.ts`, `sandbox.ts`, `wrangler.toml`, KV namespaces, R2 bucket, DNS.
