# Mux V2 — Implementation Tracker

**Proposal:** [IMPLEMENTATION-PROPOSAL.md](./IMPLEMENTATION-PROPOSAL.md)
**Builds on:** [v1 tracker](../v1/) (shipped 2026-04-22 — shared demo clip live, `MUX_DEMO_PLAYBACK_ID` populated on every snapshot)
**Goal:** "Fix / Regenerate" button on `/s/[id]` triggers a fresh agent cycle, captures it as a per-cycle MP4, uploads to Mux, swaps the player when done.
**Legend:** `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked · `[—]` deferred

---

## Phase 0 — Prereqs ✅ **complete 2026-04-22**

Nothing user-visible. Got the platform pieces in place before touching the cycle path.

### 0.1 Secrets & env wiring
- [x] `WORKER_ADMIN_TOKEN` added to `apps/web/.env.example` (server-side only, never prefixed `NEXT_PUBLIC_`)
- [x] Local `apps/web/.env.local` updated, mirrors agent worker's `ADMIN_TOKEN`
- [ ] `WORKER_ADMIN_TOKEN` pushed to `geostumble-web` worker (`wrangler secret put WORKER_ADMIN_TOKEN`) — **deferred to Phase 2.1**, only needed once `/api/regenerate` ships

### 0.2 Container image — ffmpeg
- [x] `apt-get install -y ffmpeg` added to [`apps/worker/Dockerfile`](../../../apps/worker/Dockerfile) **as a separate RUN layer** (combining with the tidy line silently dropped ffmpeg in the build cache — kept ffmpeg in its own layer so failures are loud)
- [x] Smoke `ffmpeg -version` wired into `/admin/smoke/sandbox` ([`apps/worker/src/index.ts:200`](../../../apps/worker/src/index.ts#L200)). Verified: `ffmpegHead: "ffmpeg version 4.4.2-0ubuntu0.22.04.1"` in production
- [x] Image deployed — `:63f149ba` is current, holds tidy + ffmpeg
- [—] Decision logged: target output is `~30s, 480p, h264, no audio` (Phase 1 will lock the actual ffmpeg invocation)

### 0.3 Frontend dependency
- [x] `@mux/mux-player-react ^3.11.8` confirmed installed and importable (`Object.keys()` returns expected exports)
- [—] Tree-shake check deferred to Phase 3 (when the player actually mounts)

### 0.4 Exit gate ✅
- [x] Agent worker deployed with new ffmpeg layer — version `b3542b96-8de9-4743-bacf-5541065e8103`
- [x] `geostumble-web` regression check: `/api/stumble` returns persona, `/s/dave-001` returns 200
- [x] No worker typecheck errors after smoke route additions
- [—] `wrangler secret put WORKER_ADMIN_TOKEN` on `geostumble-web` — moved to Phase 2.1 (no consumer yet)

### Gotchas captured
- **Wrangler containers won't update the application image when only the Dockerfile changes.** It builds + pushes a new tag (`Image already exists remotely, skipping push` even when content differs), but the `[[containers]]` application config keeps pointing at the old tag. Fix: pin `image = "registry.cloudflare.com/.../geostumble-worker-sandbox:<tag>"` explicitly in `wrangler.toml`. To rebuild → flip back to `image = "./Dockerfile"`, deploy, grab new tag from `wrangler containers images list`, then re-pin. Documented inline in [`apps/worker/wrangler.toml`](../../../apps/worker/wrangler.toml#L36).
- **Combining `apt-get install tidy ffmpeg` in one RUN layer silently dropped ffmpeg** in the cached build path. Splitting into separate RUN instructions made the failure loud and the install visible. ffmpeg in Ubuntu jammy is in `universe` — it works fine, but only if the layer actually rebuilds.
- **Container rollout is not instant** even with `--containers-rollout immediate`. Took ~75 seconds for `provisioning → ready` plus another ~60s for new sandbox DOs to start pulling the new image. Plan for ~2 min of "old image still serving" after every container deploy.

---

## Phase 1 — Backend: real recorder ✅ **complete 2026-04-22**

Backend before frontend so old snapshots keep working. New cycles automatically carry real per-cycle playback ids; the demo id is the fallback, not the happy path.

### 1.1 `recorder.ts` ffmpeg implementation
- [x] [`apps/worker/src/recorder.ts`](../../../apps/worker/src/recorder.ts) rewritten with real ffmpeg path
- [x] `logStep` accumulates `{ name, at_ms, payload }`
- [x] `stop(env, sandbox)`:
  - [x] Render SRT cues — each status step displays from its `at_ms` until the next step's `at_ms` (or until `durationSec` for the last)
  - [x] Generate Y2K-blue background via `ffmpeg lavfi color` filter — no R2 fetch needed
  - [x] `ffmpeg -f lavfi -i color=c=#000080:s=480x270 -vf "subtitles=…:force_style=…" -c:v libx264 -preset ultrafast`
  - [x] `readFileBytes('/workspace/clip.mp4')` then `uploadRecordingToMux(env, mp4)`
  - [x] Returns `{ playbackId, freshUpload, durationSec, transcript }` — `freshUpload: true` only when the upload actually succeeded
  - [x] All failure paths (ffmpeg exit, tiny mp4, upload null, throw) fall through to `env.MUX_DEMO_PLAYBACK_ID` — Mux is best-effort, never blocks

### 1.2 Sandbox API extension
- [x] `readFileBytes(path)` added to [`apps/worker/src/sandbox.ts`](../../../apps/worker/src/sandbox.ts) via `base64 -w 0` + `atob` decode (33% inflation acceptable for sub-5MB clips)

### 1.3 `runTinkerCycle` integration
- [x] `recorder = startRecorder()` instantiated at top of cycle (`PersonaDO.recorder` field so `setStatus` can tee into it)
- [x] `setStatus(s)` tees into `recorder?.logStep(s)` — every status transition gets timestamped
- [x] `editing:recording` status added between agent done and snapshot write
- [x] `recordSnapshot` now receives `muxPlaybackId: rec.playbackId` (was hardcoded `env.MUX_DEMO_PLAYBACK_ID`)
- [x] `logCost(persona, 'mux', estimateMuxCostUsd(durationSec))` only when `rec.freshUpload` is true (no double-billing for fallback path)

### 1.4 Mux env handling
- [x] `MuxEnv.MUX_TOKEN_ID/SECRET` made optional in [`apps/worker/src/mux.ts`](../../../apps/worker/src/mux.ts) so `Env`-as-`MuxEnv` typechecks (matches the rest of the optional secrets in `Env`)
- [x] `uploadRecordingToMux` short-circuits when either credential is missing — clean fallback, no malformed auth header
- [x] `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` pushed to prod via `wrangler secret put` (were `.dev.vars`-only before this phase)

### 1.5 Exit gate — backend live ✅
- [x] `wrangler deploy` succeeded — version `71ce8d40-9d78-425b-8ae3-34f9a681f497`
- [x] **`POST /admin/nudge/dave-001` produced fresh playback id** `U02MRjjRCHG02U02n4mJUxqsB4GIzsqEE5jH7aVLVNlUvA` (different from demo id `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE`)
- [x] `curl /p/dave-001/meta` returns the new id (cache TTL 5s, picks up immediately on the next request)
- [x] Old snapshots still resolve to demo id via `applyMuxFallback` in [`apps/worker/src/index.ts:44`](../../../apps/worker/src/index.ts#L44) — regression-clean
- [x] Mux manifest live: `https://stream.mux.com/U02MRjjRCHG02U02n4mJUxqsB4GIzsqEE5jH7aVLVNlUvA.m3u8` returns 200
- [x] Tail watch: zero exceptions; `sandbox.exec ffmpeg ... d=28 (1355ms)` — ffmpeg added ~1.3s, total cycle 27s → 34s (within +5-8s budget)

### Gotchas captured
- **Mux secrets must be pushed via `wrangler secret put`, not just left in `.dev.vars`.** Initial deploy passed typecheck and ran ffmpeg fine but `uploadRecordingToMux` short-circuited with `"mux: credentials missing, skipping upload"`, masking as a successful "fallback to demo id" path. The fallback chain is doing its job; this is the V1 lesson restated — always push secrets.
- **`MuxEnv` interface had `MUX_TOKEN_ID/SECRET` as required `string`**, while `Env` declares them `string | undefined`. Made them optional everywhere and the upload short-circuit covers the missing case. Better than asserting non-null at the call site.

---

## Phase 2 — Frontend: regenerate flow

Token never touches the browser. Server-side proxy holds `WORKER_ADMIN_TOKEN`; client just hits a same-origin Next route.

### 2.1 Next API route
- [ ] Create [`apps/web/app/api/regenerate/[id]/route.ts`](../../../apps/web/app/api/regenerate/[id]/route.ts)
- [ ] `POST` handler reads `WORKER_ADMIN_TOKEN` from `process.env`, forwards to `${WORKER_URL}/admin/nudge/{id}` with `Authorization: Bearer …`
- [ ] Forward 4xx/5xx as `{ error, detail }` JSON
- [ ] On 200 from worker: return `{ ok: true, queued: true }` with status 202
- [ ] No `runtime = 'edge'` flag (OpenNext rejects it; see [PR/cloudflare-web-hosting.md](../../../PR/cloudflare-web-hosting.md))

### 2.2 Typed client + hook
- [ ] Add `regeneratePersona(personaId)` to [`apps/web/lib/worker.ts`](../../../apps/web/lib/worker.ts) — calls `/api/regenerate/:id`, NOT the agent worker directly
- [ ] Create `apps/web/hooks/useRegenerate.ts`:
  - [ ] `regenerate()` → POSTs, sets `isRunning = true`
  - [ ] Subscribes to `/p/:id/stream` (reuse `personaStatusStreamUrl`)
  - [ ] On `status === 'idle'` after at least one non-idle event, refetches `/p/:id/meta` and exposes the new `version`
  - [ ] Reconnects on SSE error; falls back to 5s meta poll after 3 failed reconnects
  - [ ] Returns `{ regenerate, status, isRunning, version, error }`

### 2.3 Button component
- [ ] Create `apps/web/components/RegenerateButton.tsx`
- [ ] Y2K-styled: Comic Sans, table chrome, blink animation while `isRunning`
- [ ] `disabled={status !== 'idle'}` + 1s optimistic disable after click
- [ ] Toast on `error` (use simple inline `<div>` — no toast library needed for the demo)

### 2.4 Page wiring
- [ ] [`apps/web/app/s/[id]/page.tsx`](../../../apps/web/app/s/[id]/page.tsx): mount `<RegenerateButton personaId={id} />`
- [ ] Key the iframe and `<RealPlayerClip>` on `meta.version` so they remount when a new cycle commits
- [ ] Verify SSR + client-side hydration plays nicely with the version-bump query string in `personaIframeSrc`

### 2.5 Exit gate — button works against demo clip
- [ ] Click button on `/s/dave-001` (against backend without Phase 1 deployed if needed) → cycle runs → iframe reloads with new content
- [ ] `<RealPlayerClip>` still shows the demo id (Phase 3 swaps in real player)
- [ ] No `WORKER_ADMIN_TOKEN` value in Network tab or page source

---

## Phase 3 — Frontend: real Mux player

### 3.1 RealPlayerClip wiring
- [ ] Replace placeholder text in [`apps/web/components/RealPlayerClip.tsx`](../../../apps/web/components/RealPlayerClip.tsx) with `<MuxPlayer>` mount
- [ ] Props: `playbackId={muxPlaybackId} muted autoPlay loop streamType="on-demand"`
- [ ] Keep RealPlayer 8 table chrome around it (preserve the v1 visual design)
- [ ] `muxPlaybackId === null` still returns null (preserve v1 behavior)

### 3.2 Player remount on regenerate
- [ ] Confirm key-on-version (Phase 2.4) actually causes Mux player to reload and pull the new manifest
- [ ] If Mux player caches internally, force a `key={`${personaId}-${version}`}` on the player element itself

### 3.3 Exit gate — full demo loop
- [ ] Click "Fix / Regenerate" on `/s/dave-001`
- [ ] StatusBanner walks `editing:agent → editing:iteration-N → editing:saving → idle` within 60s
- [ ] Iframe reloads with new HTML version
- [ ] Mux player swaps to a new playback id (or sticks with demo id if Phase 1.5 didn't ship)
- [ ] Total wall-clock: <40s from click to swap

---

## Phase 4 — Ship

### 4.1 Smoke pass
- [ ] All 5 personas: click button, watch cycle, see new content
- [ ] Hammer test: click button repeatedly while cycle runs — button stays disabled, no double-fire
- [ ] Drop SSE mid-cycle (kill network briefly): hook reconnects, status resumes
- [ ] `wrangler tail` shows zero exceptions across a 10-cycle batch

### 4.2 Cost & quota check
- [ ] `/admin/cost` shows mux line items appearing per cycle
- [ ] Mux dashboard: assets are accumulating with sane durations (~30s each)
- [ ] Total demo-night Mux spend projected under $0.50

### 4.3 Documentation
- [ ] Update `docs/frontend-worker-integration.md` with `/api/regenerate/:id` contract
- [ ] Add v2 note to [v1 tracker](../v1/) marking Phase 5B (per-cycle recording) as **shipped under v2**
- [ ] PR doc at `PR/mux-v2-regenerate.md`

### 4.4 Deferred / V2.1
- [—] Per-iteration progress bar (deferred — status text is enough)
- [—] Rate limiting on `/api/regenerate` (server cost cap is sufficient guard)
- [—] Mux Data analytics dashboard (out of scope)
- [—] Real screen-record of agent typing (chromium too heavy for sandbox)
- [—] Pause RealPlayerClip when regenerate is clicked (nice-to-have, not blocking)

---

## Open questions answered along the way

| # | Question | Resolution |
|---|---|---|
| 1 | Button on `/s/[id]` only, or persona page too? | Pending — proposal lean is `/s/[id]` only |
| 2 | Per-iteration progress bar? | Pending — proposal lean is no |
| 3 | RealPlayerClip autoplay-loop or click-to-play? | Pending — proposal lean is autoplay-muted |
| 4 | Feature-flag the button? | Pending — proposal lean is no |

---

## Effort estimate (re-stated from proposal)

| Phase | Owner | Estimate |
|---|---|---|
| 0 — Prereqs | Worker + Frontend | ~30 min |
| 1 — Backend recorder | Worker | ~90 min |
| 2 — Frontend regenerate | Frontend | ~45 min |
| 3 — Real player | Frontend | ~15 min |
| 4 — Ship | Either | ~30 min |
| **Total** | | **~3.5 hours** |

If time-boxed, ship Phase 0 + 2 + 3 only — that's the demo button against the existing v1 demo clip (~90 min). Phase 1 (real per-cycle recording) is icing.
