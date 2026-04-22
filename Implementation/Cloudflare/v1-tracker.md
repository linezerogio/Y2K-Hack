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
- [!] Asset scrape script (`scripts/scrape-assets.ts`) — **scoped out for v1** (see §0.5 bullet above). Coding agent runs against the 25-entry seed manifest permanently.
- [x] `asset:manifest` in `PAGES` — seed manifest populated (25 entries); agents successfully pick from it in prod

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
- [~] Jazz worker account created (`co_zDjRJynhDQrQLMG5fUGBjEvQQUN`, in `.dev.vars`). `RoomRegistry` seed + `jazz:registry_id` KV write pending — tracked in [Jazz 0.1 / 0.6](../Jazz/v1-tracker.md)
- [x] `.dev.vars` scaffolded with full env var set (Neon / Gemini / Anthropic / Mux / Jazz / ADMIN_TOKEN / COST_CAP_USD)
- [x] Mux credentials captured (`MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_DEMO_PLAYBACK_ID`) — ready for Phase 5
- [!] Asset scrape (`scripts/scrape-assets.ts`) — **scoped out for v1.** Agent runs against the 25-entry seed manifest; hallucinated asset keys resolve as 404 but pages still render (documented in §2.3 "known nit"). Post-event work.

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
- [x] `rememberPersonaId` persists `personaId` to DO storage on first fetch (replaces the original `blockConcurrencyWhile` constructor approach — constructor can't run async Neon calls cleanly under free-plan SQLite-backed DOs)
- [x] Initial alarm seeded on first fetch via `state.storage.setAlarm(jitter(60s, 300s))`
- [x] `loadPersona` memoizes persona row in DO storage, falls back to `loadPersonaFromNeon` on cold hit
- [x] Neon client reuse via the serverless HTTP driver (one connection per fetch — DO has no long-lived process)

### 2.2 `runTinkerCycle` happy path — **WORKING END-TO-END** 🎉
- [x] Cost-cap check (cached in DO storage, 30s TTL) — throws `"cost cap hit"` early
- [x] Module-level `inFlightSandboxes` counter honouring `MAX_CONCURRENT_SANDBOXES` — rejects with a clear error
- [x] `setStatus('editing')` → DO-local `EventTarget`; Jazz fan-out deferred to Phase 4.1
- [x] `createSandbox` → `runCodingAgent` (Gemini 2.5 Flash, 3 iterations, tools: `list_assets` / `write_file` / `read_file` / `validate_html` / `done`)
- [x] Quality gate regex (project.md §10) runs; on fail, fallback template substitutes. **Retry is a fall-through to fallback**, not a re-roll of the agent — simpler and cheaper.
- [x] `storeHtml` writes `page:{id}:v{n}` + `page:{id}:current`, then polls up to 10× 250ms for read-back match before the caller writes `ready:{id}`
- [x] `ready:{id}` sentinel set via `addToReadyPool`
- [x] `recordSnapshot` + `logCost` land in Neon; `cost_ledger` drives the cap
- [x] `sandbox.destroy()` in `finally`; `inFlightSandboxes--` + `setStatus('idle')` also in finally
- [x] Fallback-template path (project.md §17 mitigation) triggered when `GEMINI_API_KEY` is empty OR agent never writes `/workspace/index.html` OR quality gate fails

### 2.3 Exit gate — **PASSED in production** 🎉

Verified against Version `45214b65` on `https://geostumble-worker.eliothfraijo.workers.dev`:

- [x] `POST /admin/nudge/dave-001` → `{ version: 1, bytes: 6098, usedFallback: false, qualityGate: true, iterations: 3, tokenUsage: 7518, elapsedMs: 15953 }`
- [x] Second nudge increments correctly: `{ version: 2, bytes: 4849, tokenUsage: 7256, elapsedMs: 18005 }`
- [x] `GET /p/dave-001` serves the agent-written HTML (Comic Sans, navy/yellow palette, CSS `.blink` keyframes, marquee, R2 image refs)
- [x] `GET /p/dave-001/meta` reports `version: 1`
- [x] `GET /admin/cost` reports `{ totalUsd: 0.0075, cached: false }` — cost ledger populated from Gemini token usage
- [x] Cycle finishes well under the 45s ceiling (~16–18s)

#### Bug fixed during exit-gate verification
- Router was rewriting `/admin/nudge/{id}` to a DO URL of `/nudge` (no persona in the path), defeating the Phase 1 personaId-from-URL fix and returning `{ "error": "persona not found" }`. Rewrote to `/p/{id}/nudge` so the DO's `extractPersonaId` works identically on both public reads and admin dispatches.

#### Known nit
- Agent sometimes invents asset keys (e.g. requested `assets/bg-tiles/checkerboard-red-blue.gif` which isn't in our seed manifest). The image tag resolves to a 404 but the page still renders. Fix during the real asset scrape — agents will have hundreds of real keys to pick from and are more likely to stay grounded.

---

## Phase 3 — Hour 2 (11:30–12:30): Scale to 5 personas

Maps to [§16 Hour 2](../../project.md#L616). Goal: all 5 personas ready, `/stumble` picks randomly. (Persona roster reduced 20→5 in commit `5362349` for hackathon scope.)

### 3.1 Fleet bootstrap — **DONE**
- [x] Worker deployed with `PERSONA` binding live on `workers.dev`
- [x] First hit to each `/p/:id/nudge` triggers DO init → `rememberPersonaId` persists, alarm seeded
- [x] `scripts/prewarm-demo.ts` written — reads persona list from Neon, nudges in parallel batches of 5, reports per-persona version/bytes/fallback/elapsed. Exposed as `npm run prewarm`.

### 3.2 Alarm behaviour — **partially verified**
- [!] Jitter soak test (watch `wrangler tail` for an hour) — **deferred**; correctness is visible in code (`jitter(60_000, 300_000)` call site verified), not worth an hour's wait for v1
- [x] `EDIT_PROBABILITY=0.3` plumbed through `env`; observable by checking how many alarm wake-ups produce cycles
- [x] `MAX_CONCURRENT_SANDBOXES=5` + module-level `inFlightSandboxes` counter — nudge-all-5 observed to run within cap (all 5 finished under 30s)

### 3.3 `/stumble` — **DONE**
- [x] `PAGES.list({ prefix: "ready:", limit: 1000 })` returns 5 keys after prewarm
- [x] Random pick returned as `{ personaId }` JSON
- [x] 10 calls hit distribution: becky × 4, dave × 1, harold × 2, linda × 2, tyler × 1 — all 5 personas hit, no skew

### 3.4 Exit gate — **PASSED**
Verified against Version `bf29b689`:
- [x] 5/5 entries under `ready:*` prefix (`ready:becky-002`, `ready:dave-001`, `ready:harold-005`, `ready:linda-004`, `ready:tyler-003`)
- [x] 10× `/stumble` returns all 5 personas randomly (no skew, no 404s)
- [x] All 5 `/p/:id` serve agent-written HTML (4-5KB each, Gemini 3, not fallback)
- [x] `/health` → `{ ok: true, personaCount: 5, poolSize: 5 }`

#### Fix during exit-gate verification: mid-loop reminder
First prewarm pass: 4/5 fell back because agents over-explored `list_assets` and burned all iterations without calling `write_file` (Harold ham-radio made 6 sequential `list_assets` calls on sparse tags, never wrote a file). Fixed by:
1. Raising `MAX_ITERATIONS` from 3 → 6
2. Rewriting `coding-task.md` with explicit turn budget
3. **Injecting a user-role reminder after iteration 3 if no `write_file` call has happened yet** — forces the agent's hand. Harold went from 1576-byte fallback to 5043-byte real page on the retry.

This is the right fix pattern going forward: the loop should course-correct when the agent drifts, not just count down.

---

## Phase 4 — Hour 3 (12:30–13:30): Realtime (Jazz + SSE)

Maps to [§16 Hour 3](../../project.md#L625). Goal: status / guestbook / presence live.

### 4.1 Jazz writer wiring — **DONE on Worker side (deployed, no-op until registry seeded)**

**Worker-side implementation complete.** `apps/worker/src/jazz-writer.ts` is live in prod (Version `217f0f55`):
- [x] `writeJazzStatus(env, personaId, status)` opens a short-lived `startWorker` session, loads `RoomRegistry`, sets `PersonaRoom.status`, waits for sync, shuts down
- [x] `jazz-tools/load-edge-wasm` registers the WASM crypto provider for Cloudflare Workers runtime
- [x] `PersonaDO.setStatus` fires `writeJazzStatus` without `await` — SSE stays instantaneous, Jazz updates land ~1-3s later
- [x] Graceful no-op when `JAZZ_WORKER_ACCOUNT` / `JAZZ_WORKER_SECRET` missing, or when neither KV `jazz:registry_id` nor `env.JAZZ_REGISTRY_ID` is set
- [x] Registry-id resolver prefers KV (`jazz:registry_id`) over env — seed script can rotate without a redeploy
- [x] `JAZZ_WORKER_ACCOUNT` + `JAZZ_WORKER_SECRET` pushed as Worker secrets
- [x] `jazz-tools@0.20.17` installed in worker; `@geostumble/shared/jazz-schema` linked as peer-dep to dedupe
- [x] Errors swallowed with `console.warn` — project.md §17 row (Jazz fallback: "Replace with SSE straight from Worker for status")

**Upstream status** ([Jazz v1-tracker](../Jazz/v1-tracker.md)):
- [x] `scripts/seed-jazz-rooms.ts` shipped; ran successfully. `RoomRegistry ID: co_zAMBDSKQyYEvJ1FZetCbXzcGPku`
- [x] CoValue id written to prod KV `PAGES['jazz:registry_id']` — Worker resolves it on next call
- [x] Bundle check: 890 KiB gzipped (Jazz 0.7), well under paid-plan limit
- [ ] Redeploy worker + live-verify: `POST /admin/nudge/:id` produces a `PersonaRoom.status` transition observable from a Jazz client
- [ ] `NEXT_PUBLIC_JAZZ_REGISTRY_ID` in `apps/web/.env.local` — deferred until Frontend scaffolds web app

### 4.2 SSE fallback path — **done in Phase 1**
- [x] `/p/:id/stream` emits `status` events from DO-local `EventTarget` (shipped as part of §1.2)
- [x] Verified during Phase 2 exit gate: `curl -N` during a nudge emits `idle → editing → editing:iteration-N → editing:saving → idle`

### 4.3 Exit gate — **partial**
- [ ] StatusBanner on `/s/{id}` flips live during a nudge — owned by [Frontend §4](../Frontend/v1-proposal.md)
- [ ] Guestbook write from browser lands in Jazz — owned by [Jazz v1-tracker](../Jazz/v1-tracker.md)
- [x] Worker-side Jazz write plumbing deployed and no-ops gracefully until Jazz seed script runs

---

## Phase 5 — Hour 4 (13:30–14:30): Polish + Mux — **OPTION A LIVE** 🎉

Maps to [§16 Hour 4](../../project.md#L632). Worker-side deliverables only — player is Frontend.

### 5.1 Option A: shared demo clip — **DONE**
- [x] `apps/worker/src/mux.ts` — direct-upload REST client (fetch + Basic auth, staying under Worker 1MB bundle)
- [x] `scripts/upload-demo-mp4.ts` — one-off seed that uploads `assets/demo/demo-agent.mp4` and prints the public `playback_id`
- [x] `MUX_DEMO_PLAYBACK_ID = "wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE"` wired into `wrangler.toml [vars]`
- [x] `runTinkerCycle` passes `env.MUX_DEMO_PLAYBACK_ID ?? null` to `recordSnapshot` — every new `page_snapshots` row gets the shared id
- [x] `/p/:id/meta` surfaces `muxPlaybackId` from the latest snapshot via the existing `getPersonaMeta` query

**Verified across all 5 personas (Version `217f0f55`):**

| Persona | Latest version | `muxPlaybackId` |
|---|---|---|
| becky-002 | v4 | `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` |
| dave-001 | v10 | `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` |
| harold-005 | v7 | `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` |
| linda-004 | v3 | `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` |
| tyler-003 | v4 | `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` |

**Graceful degradation:** Option A can't fail at nudge time — the playback id is an env var, not an API call. If `MUX_DEMO_PLAYBACK_ID` is ever unset, `recordSnapshot` persists `null` and the frontend's `<RealPlayerClip>` should hide the player (per [frontend-worker-integration.md §8](../../docs/frontend-worker-integration.md)).

### 5.2 Option B: per-cycle recording — **deferred to V2**
- [ ] Recorder captures sandbox shell session (`sessions/{id}/v{n}.cast` on R2)
- [ ] Mux upload after each cycle replaces the shared id with a per-snapshot `mux_playback_id`
- [ ] `apps/worker/src/recorder.ts` empty; `mux.ts` already has the `createUpload` / `waitForAsset` helpers ready to consume

Option A is demo-sufficient and cheaper ($0 per cycle vs $0.005 per cycle Mux storage/streaming). Keep Option B as a V2 polish item if the demo needs genuinely per-persona clips.

---

## Phase 6 — Hour 5 (14:30–15:30): Demo prep + kill-switch

Maps to [§16 Hour 5](../../project.md#L641). Goal: everything armed for demo.

### 6.1 Kill-switch drill
- [ ] `POST /admin/freeze` observed to skip next alarm cycle (check `wrangler tail`)
- [ ] `POST /admin/thaw` observed to resume cycles
- [ ] Cost-cap forced-hit test: set `COST_CAP_USD=0.01`, verify `runTinkerCycle` early-returns

### 6.2 Prewarm
- [ ] `scripts/prewarm-demo.ts` runs all 5 nudges in parallel respecting `MAX_CONCURRENT_SANDBOXES`
- [ ] All 5 personas show ≥ v2 snapshot
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

- [x] **Q1 — Sandbox SDK pricing** — resolved: ~2–3s per cycle runtime (§0.4), ~$0.0075 per cycle Gemini spend (§2.3). Workers Paid base plan absorbs container volume.
- [!] **Q2 — DO alarm precision** — jitter soak test deferred (§3.2); code path verified, not stopwatch-measured
- [ ] **Q3 — Worker bundle size** — check after Phase 5 Mux integration; if > 1MB, lazy-import Mux + Neon inside `runTinkerCycle`. Jazz also lazy-imports `jazz-tools/worker` per [Jazz 0.7](../Jazz/v1-tracker.md).
- [ ] **Q4 — R2 → iframe CORS** — one `curl -I pub-*.r2.dev/assets/...` check outstanding to confirm `access-control-allow-origin` headers. Pages render fine in prod so effectively resolved, but not formally verified.
- [x] **Q5 — Seed bootstrap ordering** — Worker reads `jazz:registry_id` from KV; ordering owned by [Jazz 0.6](../Jazz/v1-tracker.md) seed script
- [x] **Q6 — `/stumble` response shape** — resolved to JSON `{ personaId }` (see proposal §Open questions)
