# Cloudflare Edge — Implementation Tracker

**Proposal:** [v1-proposal.md](./v1-proposal.md)
**Spec:** [../../project.md](../../project.md)
**Event:** Frontier Tech Week Y2K Hackathon (6 hours) — 2026-04-22
**Legend:** `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Night-before (accounts, smoke test, seeds)

Maps to [project.md §16 "Night before"](../../project.md#L587). Nothing else can start until these are green.

### 0.1 Accounts & credentials
- [x] Cloudflare account ID captured (`b84db7db3369258b9b30a8d8741377d0`, `eliothfraijo@gmail.com`)
- [x] `wrangler login` confirmed via OAuth (`npx wrangler whoami`)
- [x] `ADMIN_TOKEN` generated (`openssl rand -hex 32`) and written to `apps/worker/.dev.vars`
- [ ] Containers/Sandbox SDK enabled on account — **verified only when first `wrangler dev` with `[[containers]]` uncommented succeeds** (Phase 0.4)

### 0.2 DNS — **RESOLVED: custom domain skipped for v1**
- [x] Decision: serve Worker from `*.workers.dev`, R2 from `pub-*.r2.dev`. Custom `geostumble.xyz` is a post-event upgrade, not a demo blocker.
- [x] R2 public access enabled: `https://pub-7313ad06136f4e89bec6f10ac19488c8.r2.dev`
- [x] `ASSETS_PUBLIC_URL` wired into `wrangler.toml [vars]` + `Env` (injected into coding-agent prompt)
- [ ] Worker `.workers.dev` URL — provisioned on first `wrangler deploy` (deferred until Phase 1 exit gate)

### 0.3 KV & R2 bootstrap
- [x] KV `PAGES` created → `75cd531f5bcd42628127d69643b1de47`
- [x] KV `ADMIN` created → `b3e3d18ec2cb4d5e9cfb7a3ab4082bd2`
- [x] R2 bucket `geostumble-assets` created + `[[r2_buckets]]` binding wired
- [ ] Asset scrape script (`scripts/scrape-assets.ts`) — **execution deferred**; plan lives at [`docs/openclaw-asset-harvest.md`](../../docs/openclaw-asset-harvest.md), stub at `scripts/scrape-assets.ts` is empty; run overnight per project.md §12
- [ ] `asset:manifest` key populated in `PAGES` — follows from the scrape

### 0.4 Sandbox SDK smoke test — **PASSED in production** 🎉
- [x] `@cloudflare/sandbox@0.8.11` installed; `sandbox.ts` adapter with `SandboxHandle` interface
- [x] Smoke route at `POST /admin/smoke/sandbox` (bearer-gated)
- [x] `[[durable_objects.bindings]]` + `new_sqlite_classes` migration for `Sandbox` (free-plan compat)
- [x] Local 2-line Dockerfile pulling prebuilt `docker.io/cloudflare/sandbox:0.8.11` (no source build)
- [x] `[[containers]]` binding wired: `instance_type = "standard-1"`, `max_instances = 5`
- [x] OrbStack installed (Docker alternative) — required for `wrangler deploy` image build
- [x] Workers Paid plan activated — Containers require paid (free plan gives 401 on container registry push)
- [x] Worker deployed to `https://geostumble-worker.eliothfraijo.workers.dev`
- [x] `ADMIN_TOKEN` pushed via `wrangler secret put` (use `printf`, not `echo` — trailing newline breaks auth)
- [x] End-to-end verified: `{ ok: true, readBackBytes: 44, elapsedMs: 3414 }` — sandbox writeFile → readFile → exec → destroy in **3.4s** (first), ~2.2s warm
- [x] Open Q §1 partially answered — per-cycle runtime is ~2-3s; cost signal is small, Workers Paid base plan absorbs this volume
- [x] `tidy` installed in container image via `Dockerfile` (v5.6.0 from Ubuntu jammy). Agent's `validate_html` tool can shell out to `/usr/bin/tidy`. Verified: `tidyTail: "line 1 column 1 - Warning: missing <!DOCTYPE>..."`
- [x] **Multi-arch gotcha documented:** `FROM --platform=linux/amd64` is required in the Dockerfile — OrbStack on Apple Silicon defaults to arm64, but Cloudflare Containers runs amd64. Without the `--platform` pin, layer caching served an incomplete amd64 image.
- [ ] Fallback adapter (E2B/Daytona) — deferred indefinitely; `SandboxHandle` interface already provides the seam if needed

### 0.5 Dependency seeds — **BLOCKED on sibling proposals**
- [x] Neon schema migrated + 5 personas seeded ([Database §4](../Database/v1-proposal.md)) — scope reduced from 20
- [ ] Jazz worker account + `RoomRegistry` seeded; `jazz:registry_id` written to KV ([Jazz §7](../Jazz/v1-proposal.md)) — run `npx jazz-run account create` then the seed script
- [x] `.dev.vars` scaffolded with full env var set (Neon / Gemini / Anthropic / Mux / Jazz / ADMIN_TOKEN / COST_CAP_USD); values still blank for third-party services

---

## Phase 1 — Hour 0 (09:30–10:30): Router + DO stub

Maps to [§16 Hour 0](../../project.md#L600). Goal: `curl p.geostumble.xyz/p/dave-001` returns 200 HTML from KV.

### 1.1 Worker router (`apps/worker/src/index.ts`)
- [x] `GET /health` → `{ ok, personaCount, poolSize }`
- [x] `GET /stumble` → **JSON `{ personaId }`** (resolved Open Q #6; was 302)
- [x] `GET /p/:id` → `text/html` from KV `page:{id}:current`, 404 on miss (via DO `serveCurrentPage`)
- [x] `GET /p/:id/stream` → delegates to DO `statusStream`
- [x] `GET /p/:id/meta` → JSON from Neon `getPersonaMeta` + 5s in-memory `metaCache`
- [x] `POST /admin/nudge/:id` — bearer-gated, delegates to DO
- [x] `POST /admin/freeze` / `POST /admin/thaw` — bearer-gated, toggles `ADMIN.frozen`
- [x] `GET /admin/cost` — bearer-gated, reads via `totalSpendUsd` with 2s `costCache`

### 1.2 `PersonaDO` stub (`apps/worker/src/persona-do.ts`)
- [x] Class registered in `wrangler.toml` under `[[migrations]] tag = "v1"` (`new_sqlite_classes`)
- [x] `fetch(req)` dispatches to `adminNudge` / `statusStream` / `serveCurrentPage`
- [x] `serveCurrentPage()` reads `page:{id}:current` from KV
- [x] `statusStream()` returns SSE piped from a DO-local `EventTarget`
- [x] Hardcoded HTML pre-populated at `page:dave-001:current` via `wrangler kv key put --remote`
- [x] `ready:dave-001` sentinel also written so `/stumble` returns a non-empty pool

### 1.3 Exit gate — **PASSED in production** 🎉

Verified against `https://geostumble-worker.eliothfraijo.workers.dev` (Version `833338e6`):

- [x] `GET /p/dave-001` → 200, 1130 bytes of placeholder HTML
- [x] `GET /health` → `{ ok: true, personaCount: 5, poolSize: 1 }`
- [x] `GET /stumble` → `{ personaId: "dave-001" }`
- [x] `GET /p/dave-001/meta` → `{ personaId, name: "Dave", era: "1999-Q3", version: 0, muxPlaybackId: null, status: "idle" }`
- [x] `GET /admin/cost` (bearer) → `{ totalUsd: 0, cached: false }`
- [x] `GET /p/unknown-999` → 404
- [x] `GET /p/unknown-999/meta` → 404
- [x] `GET /admin/freeze` without bearer → 401

#### Bug fixed during exit-gate verification
- `PersonaDO.serveCurrentPage` was reading `page:${this.state.id.toString()}:current`, but `state.id` is the opaque DO hash (not the persona name passed to `idFromName`). Patched to parse `personaId` from the request URL path and pass into `serveCurrentPage`. Same pattern will be needed in Phase 2 for `runTinkerCycle` — store personaId in DO storage on first hit.

---

## Phase 2 — Hour 1 (10:30–11:30): One persona end-to-end

Maps to [§16 Hour 1](../../project.md#L607). Goal: Dave's page visible, stored at `page:dave-001:v1`.

### 2.1 DO cold-start
- [ ] `constructor` uses `blockConcurrencyWhile` to load persona from Neon on first hit
- [ ] Initial alarm set with jitter `[60s, 300s]` via `state.storage.setAlarm`
- [ ] Neon client (serverless fetch-based driver) shared via connection reuse

### 2.2 `runTinkerCycle` happy path
- [ ] Cost-cap check (cached in DO storage, 30s TTL) — early-return if hit
- [ ] `setStatus('editing')` — fans to Jazz **and** DO-local `EventTarget`
- [ ] `createSandbox` → `runCodingAgent` → HTML bytes returned
- [ ] Quality gate runs; one retry on fail
- [ ] `storeHtml(persona.id, version, result.html)` writes `page:{id}:v{n}` and `page:{id}:current`
- [ ] **Read-back `page:{id}:current`** before writing `ready:{id}` sentinel (KV eventual-consistency guard)
- [ ] `sandbox.destroy()` in `finally` block — verified by forced-throw test
- [ ] `setStatus('idle')` in `finally`

### 2.3 Exit gate
- [ ] `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" /admin/nudge/dave-001` triggers full cycle
- [ ] `page:dave-001:v1` and `page:dave-001:current` populated in KV
- [ ] `ready:dave-001` sentinel present
- [ ] Cycle finishes in < 45s

---

## Phase 3 — Hour 2 (11:30–12:30): Scale to 5 personas

Maps to [§16 Hour 2](../../project.md#L616). Goal: 10+ ready personas, `/stumble` picks randomly.

### 3.1 Fleet bootstrap
- [ ] Deploy Worker with `PERSONA` binding live
- [ ] First hit to each `/p/:id` triggers DO init (warms Neon load + seeds alarm)
- [ ] Prewarm loop in `scripts/prewarm-demo.ts` hits all 5 personas once

### 3.2 Alarm behaviour
- [ ] Jitter confirmed by tailing `wrangler tail` — no thundering herd (answers Open Q #2)
- [ ] `EDIT_PROBABILITY=0.3` observed: ~30% of alarm wake-ups produce cycles
- [ ] Concurrency cap holds: with `MAX_CONCURRENT_SANDBOXES=5`, nudge-all-20 enqueues without tripping account limits

### 3.3 `/stumble`
- [ ] `PAGES.list({ prefix: "ready:", limit: 1000 })` returns ≥ 10 keys
- [ ] Random pick returned as `{ personaId }` JSON
- [ ] Frontend `/api/stumble` proxy consumes JSON (no manual-redirect hack needed)

### 3.4 Exit gate
- [ ] 10+ entries under `ready:*` prefix
- [ ] `curl /stumble` five times returns five different (or repeating) persona IDs

---

## Phase 4 — Hour 3 (12:30–13:30): Realtime (Jazz + SSE)

Maps to [§16 Hour 3](../../project.md#L625). Goal: status / guestbook / presence live.

### 4.1 Jazz writer (worker side)
- [ ] `jazz-writer.ts` loads `RoomRegistry` via KV `jazz:registry_id`
- [ ] `setStatus` writes to `PersonaRoom.status` CoValue
- [ ] Verified in browser: nudge flips `status` to `editing` → `idle` live

### 4.2 SSE fallback path
- [ ] `/p/:id/stream` emits `status` events from DO-local `EventTarget`
- [ ] Manual test with `curl -N`: status events arrive without Jazz (simulate Jazz outage)

### 4.3 Exit gate
- [ ] StatusBanner on `/s/{id}` flips live during a nudge
- [ ] Guestbook write from browser lands in Jazz (owned by Jazz proposal)

---

## Phase 5 — Hour 4 (13:30–14:30): Polish + Mux

Maps to [§16 Hour 4](../../project.md#L632). Worker-side deliverables only — player is Frontend.

- [ ] Recorder captures sandbox shell session (`sessions/{id}/v{n}.cast` on R2)
- [ ] Mux upload after each cycle; `mux_playback_id` written to `page_snapshots`
- [ ] `/p/:id/meta` surfaces latest `muxPlaybackId`
- [ ] Graceful degradation: if Mux upload fails, snapshot is still written with `mux_playback_id = NULL`

---

## Phase 6 — Hour 5 (14:30–15:30): Demo prep + kill-switch

Maps to [§16 Hour 5](../../project.md#L641). Goal: everything armed for demo.

### 6.1 Kill-switch drill
- [ ] `POST /admin/freeze` observed to skip next alarm cycle (check `wrangler tail`)
- [ ] `POST /admin/thaw` observed to resume cycles
- [ ] Cost-cap forced-hit test: set `COST_CAP_USD=0.01`, verify `runTinkerCycle` early-returns

### 6.2 Prewarm
- [ ] `scripts/prewarm-demo.ts` runs 10 nudges in parallel respecting `MAX_CONCURRENT_SANDBOXES`
- [ ] All 10 personas show ≥ v2 snapshot
- [ ] `/admin/cost` shows spend < $50
- [ ] Rehearsal: nudge one persona live, narrate SSE status transitions

---

## Phase 7 — Hour 6 (15:30–16:00): Ship

- [ ] Worker deployed to prod route `p.geostumble.xyz/*`
- [ ] `wrangler tail` clean of errors for 5 consecutive minutes
- [ ] Backup demo recording captured
- [ ] Devpost submitted

---

## Post-event

- [ ] Rotate all API keys (per [§18](../../project.md#L667))
- [ ] Archive final HTML to R2 `pages_archive/`
- [ ] Export Neon snapshot branch
- [ ] Delete Mux assets after 7d to avoid charges

---

## Open questions still tracked

Copied from [proposal Open questions](./v1-proposal.md#open-questions); update here as they resolve.

- [ ] **Q1 — Sandbox SDK pricing** — resolved by Phase 0.4 smoke test (cost-per-cycle measurement)
- [ ] **Q2 — DO alarm precision** — resolved in Phase 3.2 (stopwatch check)
- [ ] **Q3 — Worker bundle size** — check after Phase 5 integration; if > 1MB, lazy-import Mux + Neon inside `runTinkerCycle`
- [ ] **Q4 — R2 → iframe CORS** — resolved during Phase 0.2 DNS verify; confirm `<img src="https://assets.geostumble.xyz/...">` loads cross-origin
- [ ] **Q5 — Seed bootstrap ordering** — owned by Jazz/Database proposals; Worker reads `jazz:registry_id` from KV (already resolved in proposal §6)
- [x] **Q6 — `/stumble` response shape** — resolved to JSON `{ personaId }` (see proposal §Open questions)
