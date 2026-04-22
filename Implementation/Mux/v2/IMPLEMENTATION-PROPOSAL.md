# Mux Video — V2 Implementation Proposal

**Date:** 2026-04-22
**Version:** 2.0 (target: post-event polish)
**Builds on:** [v1 Option A](../v1/IMPLEMENTATION-PROPOSAL.md) — shared demo clip is shipped and working
**Stack:** Mux Video VOD · existing `apps/worker/src/mux.ts` · `@mux/mux-player-react` · ffmpeg in sandbox

---

## Executive Summary

V1 proves the integration: every snapshot row has a Mux playback id, the "Making Of" panel reserves space for it. The honest gap is that the clip is the **same canned MP4 for every cycle**, and there's **no way for a viewer to trigger a new cycle and watch it happen**. V2 closes both gaps with one cohesive feature:

> **A "Fix / Regenerate" button on `/s/[id]` that kicks off a fresh agent cycle, streams the agent's status events live, captures those events into a per-cycle MP4 uploaded to Mux, and reloads the iframe + Mux player when it lands.**

This is the demo moment v1 is missing. The button is what judges click. The Mux clip is the proof of what just happened.

| Primitive | Role | Why this and not X |
|-----------|------|--------------------|
| **`/api/regenerate/[id]` (Next route)** | Proxies the existing `/admin/nudge/:id` worker route, holding `ADMIN_TOKEN` server-side | Keeps the worker auth surface unchanged; never leaks the token to the browser |
| **`useRegenerate` hook** | Fires the POST, listens to existing SSE `/p/:id/stream`, force-reloads iframe + meta on `idle` | Reuses Phase 4 SSE plumbing — no new realtime channel |
| **`recorder.ts` ffmpeg path** | Renders agent status timeline + final HTML preview as an MP4 inside the sandbox | Sandbox already has tidy; adding `ffmpeg` keeps us inside the existing container, no new infra |
| **`uploadRecordingToMux`** | Already implemented in v1 | Drop-in once `recorder.stop()` returns real bytes |

**Out of scope (V2):**
- Real screen-record of the agent typing (would require chromium in container — pushes us over the 1MB worker limit and 5-min cold-start budget).
- Multiple-take comparisons.
- Per-iteration thumbnails (Mux auto-poster is enough).
- Cost-cap UI on the regenerate button — server enforces it; client shows a 503 toast if hit.

---

## Scope

### In
- Frontend: `RegenerateButton` component on `/s/[id]`, `useRegenerate` hook, iframe + meta refetch on `idle`.
- Frontend: `RealPlayerClip` actually mounts `@mux/mux-player-react` (currently a placeholder string).
- Backend: `POST /api/regenerate/[id]` Next route that calls worker `/admin/nudge/:id` with the server-side `WORKER_ADMIN_TOKEN`.
- Backend: `recorder.ts` becomes a real implementation that builds an MP4 from the status timeline + final HTML render.
- Backend: `runTinkerCycle` consumes `recorder.stop()` and falls back to `MUX_DEMO_PLAYBACK_ID` only on upload failure (the v1 default path becomes the fallback path, not the happy path).
- Cost: log mux upload cost via `logCost(env, personaId, 'mux', estimateMuxCostUsd(durationSec))`.

### Out
- Anything touching the agent loop itself (this is purely about capturing it and exposing it to the user).
- Live thumbnail streaming during the cycle (we wait for `idle` and swap the player).
- Per-user rate limiting on regenerate (server has the cost cap + sandbox concurrency cap; that's enough for the demo).

---

## Architecture

```
    Browser (/s/dave-001)
        │
        │ click "Fix / Regenerate"
        ▼
    POST /api/regenerate/dave-001          (Next route, server-side)
        │
        │ Authorization: Bearer ADMIN_TOKEN
        ▼
    POST /admin/nudge/dave-001             (existing Worker route)
        │
        │ stub.fetch
        ▼
    PersonaDO.runTinkerCycle()
        │
        │ recorder = startRecorder()
        │ setStatus → recorder.logStep + SSE event + Jazz fan-out
        ▼
    Gemini agent loop runs                 (unchanged)
        │
        │ recorder.logStep('iteration-1') ... 'editing:saving'
        ▼
    recorder.stop(env)
        │   ├─ render timeline.txt → ffmpeg → mp4 (in sandbox)
        │   └─ uploadRecordingToMux(env, mp4) → playback_id
        ▼
    recordSnapshot(... muxPlaybackId: real OR demo fallback)
        │
        │ setStatus('idle')                (SSE 'event: status' fires)
        ▼
    Browser: useRegenerate
        ├─ iframe key bumps → reload
        └─ getPersonaMeta() refetch → Mux player remounts with new playback id
```

---

## Files & changes

### New
- [`apps/web/app/api/regenerate/[id]/route.ts`](../../../apps/web/app/api/regenerate/[id]/route.ts) — POST handler, ~30 lines.
- [`apps/web/hooks/useRegenerate.ts`](../../../apps/web/hooks/useRegenerate.ts) — wraps the POST + SSE wait + meta refetch, returns `{ regenerate, status, isRunning }`.
- [`apps/web/components/RegenerateButton.tsx`](../../../apps/web/components/RegenerateButton.tsx) — Y2K-styled button with Comic Sans + table chrome, disabled while `status !== 'idle'`.

### Modified
- [`apps/web/components/RealPlayerClip.tsx`](../../../apps/web/components/RealPlayerClip.tsx) — replace placeholder text with `<MuxPlayer playbackId={id} muted autoPlay loop />`.
- [`apps/web/app/s/[id]/page.tsx`](../../../apps/web/app/s/[id]/page.tsx) — wire `RegenerateButton` and key the iframe + RealPlayerClip on `meta.version` so they remount when a new cycle commits.
- [`apps/web/lib/worker.ts`](../../../apps/web/lib/worker.ts) — add `regeneratePersona(personaId)` typed helper (calls `/api/regenerate/:id`, not the worker directly).
- [`apps/worker/src/recorder.ts`](../../../apps/worker/src/recorder.ts) — replace no-op with real ffmpeg renderer:
  ```ts
  // Pseudocode
  async stop(env) {
    const timelineSrt = renderTimelineAsSrt(steps);
    await sandbox.writeFile('/workspace/timeline.srt', timelineSrt);
    await sandbox.exec(`ffmpeg -loop 1 -i bg.png -vf "subtitles=timeline.srt" -t ${durationSec} -y /workspace/clip.mp4`);
    const mp4 = await sandbox.readFileBytes('/workspace/clip.mp4');
    const playbackId = await uploadRecordingToMux(env, mp4);
    return { playbackId: playbackId ?? env.MUX_DEMO_PLAYBACK_ID ?? null, durationSec, transcript };
  }
  ```
- [`apps/worker/src/persona-do.ts`](../../../apps/worker/src/persona-do.ts) — `runTinkerCycle` instantiates `startRecorder()` at the top, threads `recorder.logStep` into `setStatus`, calls `recorder.stop(env)` before `recordSnapshot`, uses the returned `playbackId` instead of `env.MUX_DEMO_PLAYBACK_ID`.
- [`apps/worker/src/sandbox.ts`](../../../apps/worker/src/sandbox.ts) — add `readFileBytes()` (current API only exposes `readFile` → string).
- [`apps/worker/Dockerfile`](../../../apps/worker/Dockerfile) — `apt-get install -y ffmpeg` (~50 MB layer; well under the 2 GB container limit).
- [`apps/web/package.json`](../../../apps/web/package.json) — add `@mux/mux-player-react`. (Already in apps/web/package.json from v1 scaffold; verify it's actually imported.)
- [`apps/web/.env.example`](../../../apps/web/.env.example) — add `WORKER_ADMIN_TOKEN=` (server-side only, never `NEXT_PUBLIC_`).

### Cloudflare resources
- New env var on `geostumble-web` worker: `WORKER_ADMIN_TOKEN` (mirror of the agent-worker's `ADMIN_TOKEN`). Push via `wrangler secret put WORKER_ADMIN_TOKEN`.
- No new R2/KV bindings.

---

## Contract additions

| Endpoint | Method | Auth | Returns |
|---|---|---|---|
| `/api/regenerate/[id]` | POST | none (Cloudflare zone) | `{ ok: true, queued: true }` (202) on success, `{ error, detail }` (4xx/5xx) otherwise |

The `/p/:id/meta`, `/p/:id`, `/p/:id/stream` contracts stay frozen. `meta.muxPlaybackId` may now change between cycles (was effectively constant in v1) — `useRegenerate` already keys on `meta.version` so the player remounts cleanly.

---

## Failure modes & fallbacks

| Failure | Behavior | User-visible |
|---|---|---|
| ffmpeg missing or crashes | `recorder.stop()` returns `playbackId: env.MUX_DEMO_PLAYBACK_ID` | Same v1 experience — no broken player |
| Mux upload times out (>30s) | Same as above | Same |
| Worker `/admin/nudge` returns 429 (concurrency cap) or `cost cap hit` | Next route forwards 503/500 → `useRegenerate` shows a Y2K-styled toast | "Server is busy — try again in a sec" |
| SSE drops mid-cycle | `useRegenerate` reconnects (StatusBanner already does this); polls `/p/:id/meta` every 5s as backup | Status pill flips to `○ link`, then back to `● live` |
| User mashes the button | Button is `disabled` while `status !== 'idle'` and during the optimistic 1s delay after click | Cannot double-fire |

---

## Cost guardrails

- Per-cycle Mux upload: ~$0.0005 per second of clip × ~30s = ~$0.015. With 5 personas × 4 user-triggered regenerates each, demo-night Mux spend is bounded under $0.50.
- Worker still respects `COST_CAP_USD` via `costCapHit()` — the regenerate proxy can't bypass it because it goes through the same `runTinkerCycle` path.
- ffmpeg adds ~3-5s to each cycle. With 6 max iterations × 4-5s each, total cycle time goes from ~30s to ~35s. Acceptable for the demo.

---

## Migration / rollout

1. **Backend first** (no UI change yet): wire `recorder.ts` ffmpeg path + `runTinkerCycle` consumption. Snapshots start carrying real per-cycle playback ids automatically; old snapshots keep the demo id via `applyMuxFallback` in [`apps/worker/src/index.ts:44`](../../../apps/worker/src/index.ts#L44). **No frontend change observable.**
2. **Frontend second:** add `RealPlayerClip` real player, then `RegenerateButton`. Each lands independently — the player works against existing snapshots even if the button isn't shipped yet.
3. **Smoke:** click button on dave-001, watch StatusBanner walk `editing:agent → editing:iteration-N → editing:saving → idle`, see iframe reload, see Mux player swap to a new playback id. ~30s end-to-end.

---

## Open questions

1. **Should the button live on `/s/[id]` only, or also on the iframe-embedded persona page itself?** Lean: `/s/[id]` only. The persona page is "the website the agent built" — putting controls on it breaks the conceit.
2. **Do we surface a per-iteration progress bar (1/6 .. 6/6) or just the status text?** v1 just shows status text. Lean: same. Progress bars imply determinism the agent doesn't have.
3. **Should `RealPlayerClip` autoplay-loop or wait for a click?** Lean: autoplay muted on `/s/[id]` page load (matches the v1 placeholder's "rewinding tape" framing); pause when the regenerate button is clicked so attention goes to the StatusBanner.
4. **Hold the regenerate button behind a feature flag for the demo?** No — if it's in, it's in. The fallback chain already handles every failure cleanly.

---

## Effort estimate

| Slice | Owner | Time |
|---|---|---|
| Next API route + `useRegenerate` hook + button | Frontend | ~45 min |
| `RealPlayerClip` real player wiring | Frontend | ~15 min |
| `recorder.ts` ffmpeg path + `runTinkerCycle` integration | Worker | ~90 min |
| `Dockerfile` ffmpeg + container rebuild + smoke | Worker | ~30 min |
| End-to-end smoke + tail watch | Either | ~30 min |
| **Total** | | **~3.5 hours** |

Deferrable if time-boxed: the ffmpeg path. Shipping just the regenerate button against the existing v1 demo clip already gives the demo moment — the per-cycle Mux upload is icing.

---

## Acceptance criteria

- [ ] Clicking "Fix / Regenerate" on `https://geostumble-web.eliothfraijo.workers.dev/s/dave-001` returns 202 within 1s.
- [ ] StatusBanner walks through `editing:agent → editing:iteration-1` ... `editing:saving → idle` within 60s.
- [ ] When status flips to `idle`, the iframe reloads and shows a new page version (verify via `meta.version` increment).
- [ ] `RealPlayerClip` mounts a real `mux-player` element and plays the demo (or per-cycle, post-V2.1) clip muted.
- [ ] If `recorder.stop()` returns the demo fallback playback id, the panel still renders correctly — no broken state.
- [ ] `/admin/cost` shows mux line items appearing after each cycle (V2.1 only).
- [ ] No `ADMIN_TOKEN` value appears in browser DevTools network tab or page source.
