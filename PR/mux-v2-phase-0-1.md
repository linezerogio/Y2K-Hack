# Mux V2 Phase 0 + 1 — every agent cycle records itself to a fresh Mux clip

Closes Phase 0 + 1 of [`Implementation/Mux/v2/v2-tracker.md`](../Implementation/Mux/v2/v2-tracker.md). Every `runTinkerCycle` now generates a per-cycle MP4 inside the sandbox via ffmpeg, uploads it to Mux, and stores the new playback id on the snapshot row. The v1 shared demo clip is now the fallback path, not the happy path.

**Live verified:** `dave-001` v23 carries playback id `U02MRjjRCHG02U02n4mJUxqsB4GIzsqEE5jH7aVLVNlUvA` (different from the v1 demo id), Mux HLS manifest returns 200.
**Base commit:** `5e63fd4` (main)
**Tip:** see commit list below

---

## Summary

- **Phase 0 (prereqs)**: ffmpeg in the sandbox container, `WORKER_ADMIN_TOKEN` scaffold in `apps/web/.env.example`, `@mux/mux-player-react` confirmed importable.
- **Phase 1 (real recorder)**: `recorder.ts` rewritten with real ffmpeg path (Y2K-blue lavfi bg + burned-in SRT subtitles of the status timeline), `sandbox.ts` extended with `readFileBytes()` (base64 over stdout), `runTinkerCycle` instantiates a recorder and tees `setStatus` into `recorder.logStep`, then calls `recorder.stop()` before the snapshot write.
- **Failure-safe**: every recorder failure path (ffmpeg exit, tiny mp4, missing Mux creds, upload null, throw) falls through to the v1 `MUX_DEMO_PLAYBACK_ID`. Mux is never load-bearing.
- **Cost-tracked**: `logCost(persona, 'mux', estimateMuxCostUsd(durationSec))` only fires when the upload actually succeeded — no double-billing for fallback runs.

---

## What's in it

### Phase 0 — Prereqs
- `apps/worker/Dockerfile` — `apt-get install -y ffmpeg` as a **separate RUN layer** (combining with the tidy line silently dropped ffmpeg in the build cache; splitting made the install loud and visible)
- `apps/worker/wrangler.toml` — `[[containers]] image` pinned to an explicit registry tag because wrangler's auto-build path doesn't reliably update the application's image reference when only the Dockerfile changes (it builds + pushes a new tag but skips the application config update). Workaround documented inline.
- `apps/worker/src/index.ts` — extended `/admin/smoke/sandbox` with `ffmpeg -version` so future deploys surface missing ffmpeg loudly
- `apps/web/.env.example` + `apps/web/.env.local` — added `WORKER_ADMIN_TOKEN` (server-side only, never `NEXT_PUBLIC_`) for the upcoming Phase 2 `/api/regenerate` proxy

### Phase 1 — Backend recorder
- `apps/worker/src/recorder.ts` — full rewrite:
  - `startRecorder()` returns `{ logStep, stop }`. `logStep(name)` accumulates `{ name, at_ms, payload }`.
  - `stop(env, sandbox)` builds an SRT file from the timeline (each cue runs from its own `at_ms` until the next step's), runs ffmpeg with `lavfi color=#000080:480x270`, burns the SRT in via `subtitles=… force_style=Courier+yellow+box`, reads the MP4 bytes via `sandbox.readFileBytes`, uploads to Mux.
  - Returns `{ playbackId, freshUpload, durationSec, transcript }`. `freshUpload === true` only on a real upload, so the cost ledger doesn't get double-charged for fallback paths.
- `apps/worker/src/sandbox.ts` — added `readFileBytes(path): Promise<Uint8Array>` via `base64 -w 0` over stdout + `atob` decode. 33% inflation is fine for the sub-5MB clips we're producing (480x270 / 30s lands well under).
- `apps/worker/src/persona-do.ts` — instantiates `recorder = startRecorder()` at the top of `runTinkerCycle`, tees `setStatus` into `recorder?.logStep`, adds an `editing:recording` status, calls `recorder.stop(env, sb)` before `recordSnapshot`, passes the returned `playbackId` (was hardcoded `env.MUX_DEMO_PLAYBACK_ID`).
- `apps/worker/src/mux.ts` — `MuxEnv.MUX_TOKEN_ID/SECRET` made optional (matches the rest of `Env`'s optional secrets) and `uploadRecordingToMux` short-circuits with a warn when either is missing — clean fallback, no malformed `Basic ` header on the wire.

### Secrets pushed to prod
- `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` — were previously `.dev.vars`-only. Pushed via `wrangler secret put`.

---

## How to test

### 1. Verify ffmpeg is in the container
```bash
TOKEN=<ADMIN_TOKEN>
BASE=https://geostumble-worker.eliothfraijo.workers.dev

curl -s -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/smoke/sandbox | jq .ffmpegHead
# "ffmpeg version 4.4.2-0ubuntu0.22.04.1"
```

### 2. Fire a cycle and watch a fresh playback id land
```bash
echo "BEFORE:"; curl -s $BASE/p/dave-001/meta | jq '.version, .muxPlaybackId'
curl -s -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/nudge/dave-001 | jq .
sleep 8
echo "AFTER:"; curl -s $BASE/p/dave-001/meta | jq '.version, .muxPlaybackId'
```
Expected: `version` increments, `muxPlaybackId` changes to a brand-new id (not `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE`).

### 3. Verify the new clip plays
```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://stream.mux.com/<NEW_PLAYBACK_ID>.m3u8"
# 200
```

### 4. Verify the fallback chain still works
- Old snapshots (pre-Phase-1) still resolve to the demo id via `applyMuxFallback` in `apps/worker/src/index.ts:44`
- Tail watch during nudge shows `sandbox.exec ffmpeg ... d=N (~1300ms)` — recorder adds ~1.3s
- If Mux secrets vanish, tail shows `mux: credentials missing, skipping upload` and the snapshot still writes with the demo id (no error returned to the caller)

---

## Deployment state

| Resource | Value | Status |
|---|---|---|
| Worker | `geostumble-worker` version `71ce8d40-9d78-425b-8ae3-34f9a681f497` | ✅ live |
| Container image | `:63f149ba` (tidy + ffmpeg 4.4.2) | ✅ pinned |
| Secrets pushed | `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` | ✅ |
| Cycle time impact | 27s → 34s (recorder adds ~7s, ffmpeg ~1.3s of that) | ✅ within budget |
| Per-cycle Mux cost | ~$0.015 (30s × $0.0005/s) | ✅ tracked in `cost_ledger` |
| Fallback chain | demo id on every failure mode | ✅ tested by Phase 0 (creds missing) |

---

## Known issues & follow-ups

- **`WORKER_ADMIN_TOKEN` not yet pushed to `geostumble-web` worker.** Deferred to Phase 2.1 when `/api/regenerate` ships — pushing a dangling secret would just sit unused.
- **No auto-cleanup of Mux assets.** Each cycle creates a new asset; demo-night spend is bounded (~$0.50 for 5 personas × 4 regenerates × $0.015 + autonomous cycles) but post-event we should configure Mux's 7-day retention or manually purge.
- **Container rollout is slow.** Even with `--containers-rollout immediate` it took ~2 min for new image instances to fully replace old ones (Phase 0 gotcha). Plan accordingly if iterating on the Dockerfile.
- **Wrangler container image diff is broken.** When only the Dockerfile changes, wrangler builds + pushes a new tag but doesn't update the application's image reference. Workaround: pin the image to an explicit registry tag in `wrangler.toml`. Documented inline in the file.

---

## Contract stability

No changes to the v1-frozen Worker contract in [`docs/frontend-worker-integration.md`](../docs/frontend-worker-integration.md). The behavior change is invisible to the frontend:
- `/p/:id/meta.muxPlaybackId` may now change between cycles (was effectively constant under v1 Option A)
- The shared demo id is no longer baked into every snapshot — it's the fallback when ffmpeg or Mux misbehave

---

## Commits (3 net)

```
3a85511 Add Mux V2 implementation proposal + tracker
de10502 Mux V2 Phase 0: ffmpeg in sandbox + WORKER_ADMIN_TOKEN env scaffold
<TBD>   Mux V2 Phase 1: per-cycle ffmpeg recorder + Mux upload
```

---

## Scoreboard against [v2-tracker.md](../Implementation/Mux/v2/v2-tracker.md)

| Phase | Status |
|---|---|
| 0 — Prereqs | ✅ this PR |
| **1 — Backend recorder** | ✅ **this PR** |
| 2 — Frontend regenerate flow | ⏸ next PR |
| 3 — Real Mux player | ⏸ next PR |
| 4 — Ship | ⏸ blocked on 2 + 3 |
