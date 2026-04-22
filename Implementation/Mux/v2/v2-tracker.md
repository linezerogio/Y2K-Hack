# Mux V2 — Implementation Tracker

**Proposal:** [IMPLEMENTATION-PROPOSAL.md](./IMPLEMENTATION-PROPOSAL.md)
**Builds on:** [v1 tracker](../v1/) (shipped 2026-04-22 — shared demo clip live, `MUX_DEMO_PLAYBACK_ID` populated on every snapshot)
**Goal:** "Fix / Regenerate" button on `/s/[id]` triggers a fresh agent cycle, captures it as a per-cycle MP4, uploads to Mux, swaps the player when done.
**Legend:** `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked · `[—]` deferred

---

## Phase 0 — Prereqs

Nothing user-visible. Get the platform pieces in place before touching the cycle path.

### 0.1 Secrets & env wiring
- [ ] `WORKER_ADMIN_TOKEN` added to `geostumble-web` worker (`wrangler secret put WORKER_ADMIN_TOKEN` — must mirror the agent worker's `ADMIN_TOKEN`)
- [ ] `WORKER_ADMIN_TOKEN` added to `apps/web/.env.example` (server-side only, **never** prefixed `NEXT_PUBLIC_`)
- [ ] Local `apps/web/.env.local` updated for `npm run preview`

### 0.2 Container image — ffmpeg
- [ ] `apt-get install -y ffmpeg` added to [`apps/worker/Dockerfile`](../../../apps/worker/Dockerfile)
- [ ] Local container rebuild: `cd apps/worker && npx wrangler deploy --dry-run` succeeds without busting the size budget
- [ ] Smoke `ffmpeg -version` inside the sandbox via `/admin/smoke/sandbox` (extend the smoke route or add `?cmd=ffmpeg` query param)
- [ ] Decision logged: target output is `~30s, 480p, h264, no audio` (~1-2 MB per cycle, well under Mux upload limits)

### 0.3 Frontend dependency
- [ ] Verify `@mux/mux-player-react` is actually installed (it's listed in `apps/web/package.json` from v1 scaffold but never imported)
- [ ] Tree-shake check: bundle stays under the OpenNext 1MB worker entry budget after import

### 0.4 Exit gate
- [ ] `wrangler deploy` of agent worker with new ffmpeg layer succeeds
- [ ] `wrangler deploy` of `geostumble-web` with new env var succeeds
- [ ] No regression: `curl https://geostumble-web.eliothfraijo.workers.dev/api/stumble` still returns a personaId

---

## Phase 1 — Backend: real recorder

Backend before frontend so old snapshots keep working. New cycles automatically start carrying real per-cycle playback ids; the demo id becomes the fallback path, not the happy path.

### 1.1 `recorder.ts` ffmpeg implementation
- [ ] Replace [`apps/worker/src/recorder.ts`](../../../apps/worker/src/recorder.ts) no-op with real implementation
- [ ] `logStep(name, payload)` accumulates `{ at_ms, name, payload }` (already does — keep)
- [ ] `stop(env)`:
  - [ ] Render timeline as SRT subtitles (one cue per status step, ~2s display each)
  - [ ] Pick a static bg image (R2 asset key — reuse a Y2K tile)
  - [ ] `ffmpeg -loop 1 -i bg.png -vf "subtitles=timeline.srt" -t {dur} -c:v libx264 -y /workspace/clip.mp4`
  - [ ] Read MP4 bytes, call `uploadRecordingToMux(env, mp4)`
  - [ ] Return `{ playbackId: real ?? env.MUX_DEMO_PLAYBACK_ID ?? null, durationSec, transcript }`
  - [ ] On any throw → fall through to demo id, log warn, never propagate (Mux is best-effort)

### 1.2 Sandbox API extension
- [ ] Add `readFileBytes(path: string): Promise<Uint8Array>` to [`apps/worker/src/sandbox.ts`](../../../apps/worker/src/sandbox.ts)
- [ ] Underlying `@cloudflare/sandbox` exposes binary read — confirm API or shell out to `base64` and decode

### 1.3 `runTinkerCycle` integration
- [ ] [`apps/worker/src/persona-do.ts:119`](../../../apps/worker/src/persona-do.ts#L119): instantiate `recorder = startRecorder()` after `setStatus('editing')`
- [ ] Tee `setStatus(s)` so each call also fires `recorder.logStep(s)` (one-line change inside `setStatus()`)
- [ ] Replace [persona-do.ts:189-196](../../../apps/worker/src/persona-do.ts#L189) `recordSnapshot` block:
  - [ ] `const rec = await recorder.stop(this.env);`
  - [ ] Pass `muxPlaybackId: rec.playbackId` (was `this.env.MUX_DEMO_PLAYBACK_ID`)
  - [ ] If `rec.playbackId` is real (not the demo fallback id), call `logCost(env, persona.id, 'mux', estimateMuxCostUsd(rec.durationSec))`

### 1.4 Cost-cap interaction
- [ ] Verify `costCapHit()` accounts for newly-logged mux rows (no code change — `totalSpendUsd` already sums all `cost_ledger` kinds)
- [ ] Sanity check: 5 personas × 4 regenerates × $0.015 = $0.30; well under the $50 cap

### 1.5 Exit gate — backend live
- [ ] `wrangler deploy` lands without error
- [ ] `POST /admin/nudge/dave-001` produces a snapshot whose `mux_playback_id` is **different from** `MUX_DEMO_PLAYBACK_ID`
- [ ] `curl /p/dave-001/meta` returns the new playback id
- [ ] Old snapshots still resolve to demo id via `applyMuxFallback` (regression check)
- [ ] Tail watch: zero errors, ffmpeg adds <8s to cycle time

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
