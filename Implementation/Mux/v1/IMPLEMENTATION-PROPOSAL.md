# Mux Video — Implementation Proposal

**Date:** 2026-04-22
**Version:** 1.0
**Event:** Frontier Tech Week Y2K Hackathon (6 hours)
**Stack:** Mux Video (VOD) · `@mux/mux-node` (Worker) · `@mux/mux-player-react` (Web)
**Source of truth:** [project.md](../../../project.md)

---

## Executive Summary

Mux turns every coding-agent run into a replayable "making of" clip embedded on the persona page. This is the single most narratively valuable sponsor integration: without it, the claim "the AI wrote this page" is invisible; with it, judges see the agent type.

**v1 ships Option A** (see [§Open questions](#open-questions)): one shared demo clip uploaded ahead of time, reused across every persona snapshot via `MUX_DEMO_PLAYBACK_ID`. The `recorder.ts` → `asciinema-agg` → per-cycle upload path described below is the **V2 target**; we kept the interface shape so the upgrade drops in without API churn.

Flow (v1 Option A): seed script uploads `assets/demo/demo-agent.mp4` to Mux once → paste returned `playback_id` into `.dev.vars` → every `runTinkerCycle` writes that same id into `page_snapshots.mux_playback_id` → Vercel renders `<mux-player playback-id={id} />` inside a Y2K RealPlayer-styled frame. Real per-cycle capture (V2) would swap the recorder to produce a fresh MP4 per run.

| Primitive | Role | Why this and not X |
|-----------|------|--------------------|
| **Mux VOD asset** | One asset per coding cycle | Signed playback URLs, global CDN, instant readiness — no self-hosted FFmpeg pipeline in 6 hours |
| **Direct Upload** | Worker → Mux without streaming through us | One POST to a signed URL; no multipart logic in the Worker |
| **`mux-player-react`** | Drop-in player for Vercel UI | Handles HLS, poster, autoplay-muted; styleable with CSS inside our RealPlayer table chrome |

**Out of scope (v1):** Mux Live, Mux Data (analytics), signed playback policies, subtitles, thumbnails API beyond the auto-poster, custom domains for playback. Public playback policy only.

---

## Scope

### In
- `recorder.ts`: capture agent session as `.cast`, render to MP4 ([§9:356](../../../project.md#L356))
- `mux.ts`: direct-upload helper, returns `playback_id` ([§9:359](../../../project.md#L359))
- Persist `mux_playback_id` on `page_snapshots` row ([§7:200](../../../project.md#L200))
- `<RealPlayerClip playbackId={...} />` component with RealPlayer 8 chrome ([§13:560](../../../project.md#L560))
- Graceful null-handling: if `mux_playback_id` is null, hide the clip panel ([§17 risk](../../../project.md#L663))
- 7-day asset retention note in post-event checklist ([§18:673](../../../project.md#L673))

### Out (v1)
- Live streaming / simulcast
- Signed JWT playback policy (public only — these are demo artifacts)
- Mux Data dashboards / QoE metrics
- Custom thumbnails (use Mux auto-generated poster)
- Captions / transcripts
- Multiple renditions beyond Mux defaults
- Webhook-driven ready signaling — we poll once, accept "preparing" state in UI

---

## Architecture

```
    PersonaDO.runTinkerCycle()
            │
            │ starts
            ▼
    recorder = startRecorder(sandbox)
            │
            │ agent emits tool calls → recorder logs each step
            ▼
    agent completes (§10)
            │
            ▼
    recorder.stop() → .cast file
            │
            ▼
    render .cast → .mp4 (asciinema-agg or ffmpeg in sandbox)
            │
            ▼
    R2: sessions/{personaId}/v{n}.cast      (archive)
            │
            ▼
    uploadRecordingToMux(mp4Buffer)
            │
            │ 1. POST /video/v1/uploads  → { url, id }
            │ 2. PUT  url  (mp4 body)
            │ 3. poll GET /video/v1/uploads/{id} until asset_id present
            │ 4. GET  /video/v1/assets/{asset_id} → playback_ids[0].id
            ▼
    mux_playback_id → Neon page_snapshots
            │
            ▼
    Vercel /s/{id} reads snapshot → <mux-player playback-id={...} />
            │
            ▼
    Mux CDN (HLS) → browser
```

---

## Deliverables

### 1. Recorder (`apps/worker/src/recorder.ts`)

**v1 (Option A) — no-op recorder.** Collects step labels for the transcript, returns the shared `MUX_DEMO_PLAYBACK_ID` from env. No sandbox interaction, no MP4 rendering. Ships today.

```ts
export interface RecorderOutput {
  playbackId: string | null;
  durationSec: number;
  transcript: string;    // newline-joined step log, empty OK
}
export interface Recorder {
  logStep(name: string, payload?: unknown): void;
  stop(env: { MUX_DEMO_PLAYBACK_ID?: string }): Promise<RecorderOutput>;
}
export function startRecorder(): Recorder;
```

**V2 (deferred) — real recorder.** Wraps the sandbox so every agent tool call is emitted as a timestamped asciinema frame; renders `.cast` → MP4 via `asciinema-agg` (or `ffmpeg` with a typewriter overlay) inside the sandbox *before* `sandbox.destroy()` runs. V2 invariants will be:
- MP4 rendering must happen *before* `sandbox.destroy()`
- If rendering fails, return `playbackId: null` and let `mux.ts` skip
- Cap recording at 60s wall-clock; truncate if exceeded

The upgrade is a drop-in: `stop()` returns the same shape, just with a freshly uploaded `playbackId` per cycle instead of the env fallback.

### 2. Mux uploader (`apps/worker/src/mux.ts`)

```ts
export async function uploadRecordingToMux(
  env: Env,
  mp4: Uint8Array,
): Promise<string | null>
```

Algorithm:
1. `POST https://api.mux.com/video/v1/uploads` with Basic auth (`MUX_TOKEN_ID:MUX_TOKEN_SECRET`), body:
   ```json
   {
     "new_asset_settings": {
       "playback_policy": ["public"],
       "video_quality": "basic"
     },
     "cors_origin": "*"
   }
   ```
   → returns `{ data: { url, id } }`
2. `PUT {url}` with `Content-Type: video/mp4`, body = `mp4`
3. Poll `GET /video/v1/uploads/{id}` every 2s (max 30s) until `data.asset_id` is non-null
4. `GET /video/v1/assets/{asset_id}` → read `data.playback_ids[0].id`
5. Return the playback ID; on any failure, log and return `null`

**Why `video_quality: "basic"`:** cheapest tier, fast processing, good enough for 240p-styled playback behind a RealPlayer frame.

**Cost accounting:** insert a row into `cost_ledger` with estimated cost (`duration_sec * $0.0005` for basic VOD encoding + storage). Surfaced in `/admin/cost`.

### 3. UI component (`apps/web/components/RealPlayerClip.tsx`)

Per [§13:560](../../../project.md#L560). Renders Mux Player inside a Y2K RealPlayer table:

```tsx
'use client'
import MuxPlayer from '@mux/mux-player-react'

export function RealPlayerClip({ playbackId }: { playbackId: string | null }) {
  if (!playbackId) return null
  return (
    <table className="realplayer-chrome" cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr><td className="realplayer-titlebar">📡 RealPlayer G2 — making-of.rm</td></tr>
        <tr>
          <td>
            <MuxPlayer
              playbackId={playbackId}
              streamType="on-demand"
              autoPlay={false}
              muted
              style={{ width: 320, height: 240, imageRendering: 'pixelated' }}
              metadata={{ video_title: `agent-session-${playbackId}` }}
            />
          </td>
        </tr>
      </tbody>
    </table>
  )
}
```

**Styling:** `retro.css` adds the RealPlayer titlebar, beveled borders, "Buffering…" idle text. `image-rendering: pixelated` keeps the CRT feel even at 240p.

**Fallback:** when `playbackId` is `null` (asset still processing, or Mux upload failed), the component returns `null` — the page lays out without the panel. No loading spinner, no error state in v1.

### 4. Env + bindings

`.dev.vars` (Wrangler) — all three pushed via `wrangler secret put` for the deployed Worker:
```
MUX_TOKEN_ID=...                 # Video API token (Read + Write)
MUX_TOKEN_SECRET=...              # Paired secret
MUX_DEMO_PLAYBACK_ID=...          # Option A shared clip, emitted by scripts/upload-demo-mp4.ts
```

`.env.local` (Vercel):
```
NEXT_PUBLIC_MUX_ENV_KEY=env_xxx    # optional — only if we enable Mux Data later
```

Worker `wrangler.toml` — no binding needed; Mux is a plain HTTPS API.

Web package additions:
```
"@mux/mux-player-react": "^3"
```

### 5. Data persistence

**v1 (Option A) write path** in `runTinkerCycle`:
```ts
await recordSnapshot(env, {
  personaId,
  version,
  htmlKvKey,
  muxPlaybackId: env.MUX_DEMO_PLAYBACK_ID ?? null,
  sandboxLog: transcript,
  tokenCostUsd: cost,
})
```

**V2 (real per-cycle) write path** — what we'd swap to if the recorder is upgraded:
```ts
const muxId = await uploadRecordingToMux(env, recorder.output.mp4)
await recordSnapshot(env, {
  personaId,
  version,
  htmlKvKey,
  muxPlaybackId: muxId,   // nullable — falls back to demo id if null
  sandboxLog: transcript,
  tokenCostUsd: cost,
})
```

Read path on Vercel: `/s/[id]/page.tsx` calls the Worker's `GET /p/:id/meta` endpoint ([Cloudflare §1](../../Cloudflare/v1-proposal.md)), which runs `getPersonaMeta` ([Database §3](../../Database/v1-proposal.md)) to return `{ personaId, name, era, version, muxPlaybackId }` in one round-trip. Vercel does **not** hold Neon credentials — the Worker is the only DB client. The `muxPlaybackId` is passed to `<RealPlayerClip />`.

---

## Milestones (maps to §16 ship order)

| Hour | Milestone | Done when |
|------|-----------|-----------|
| Hour N/A | Demo MP4 uploaded to Mux; playback URL returns 200 | **✅ Done** — `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` |
| Hour 2 | `runTinkerCycle` writes `env.MUX_DEMO_PLAYBACK_ID` into `page_snapshots.mux_playback_id` | **✅ Done** — persona-do.ts line updated |
| Hour 4 | `<RealPlayerClip />` embedded on `/s/[id]`; plays inline ([§16:638](../../../project.md#L638)) | Hitting `/s/dave-001` shows clip in RealPlayer frame |
| Hour 5 | All 5 demo personas (scope reduced from 20) render the clip via `/p/:id/meta` | `curl /p/dave-001/meta` returns non-null `muxPlaybackId` |
| V2 / post-event | Recorder captures real agent sessions, uploads per-cycle MP4s | Different playback_id per snapshot; transcripts visible in clip |

---

## Risks

| Risk | From | Mitigation |
|------|------|-----------|
| Mux upload flaky mid-demo | [§17:663](../../../project.md#L663) | Null-safe UI: missing `playback_id` just hides the panel. Page is not blocked. |
| Asset not "ready" when UI requests it | inherent to VOD pipelines | Mux Player handles "preparing" state itself — it shows a poster and retries. No special UI needed. |
| `asciinema-agg` not available in Sandbox SDK container | deploy-time | Pre-bake base image with `asciinema-agg`; fallback: render cast to MP4 via `ffmpeg` with `drawtext` typewriter effect |
| 1MB Worker bundle limit breached by Mux Node SDK | [Cloudflare §17](../Cloudflare/v1/IMPLEMENTATION-PROPOSAL.md) | Don't use `@mux/mux-node` in the Worker; call the REST API directly with `fetch` + Basic auth. ~30 lines, no dep |
| Cost runaway if tinker loop spins | [§17:664](../../../project.md#L664) | Log each Mux upload in `cost_ledger`; `costCapHit()` freezes the DO before a runaway develops |
| `mux-player-react` pulls in large client bundle on Vercel | inherent | Dynamically import the component so only `/s/[id]` pays the cost; the landing page stays light |
| Playback blocked by iframe CSP | deploy-time | Player is on the *outer* Vercel page, not inside `/p/{id}` iframe — no CSP interaction |

---

## Open questions

1. **Cast → MP4 renderer — RESOLVED: deferred to V2.** Neither `asciinema-agg` nor `ffmpeg` was present in the Sandbox image, and the local macOS `ffmpeg` build was freetype-less, making `drawtext` unavailable. Shipping **Option A** in v1: one pre-rendered "AI computing" clip (ffmpeg `life` filter, 10s, 3.3 MB, uploaded manually to Mux) reused across all persona snapshots. Real per-cycle capture is a V2 item — the `Recorder` interface shape is preserved so the upgrade is a drop-in.
2. ~~**Recording duration cap**~~ — moot in Option A (the demo clip is 10s fixed). V2 revisit.
3. **Playback policy**: public is simplest; signed would let us expire demo clips after 7 days automatically. Deferred to post-event — manual deletion per [§18:673](../../../project.md#L673) is fine.
4. ~~**Poster frame**~~ — relying on Mux auto-poster for the demo clip. Verified: `https://image.mux.com/<playback_id>/thumbnail.png` returns 200.
5. **Bundle strategy for the player**: dynamic import vs. static. Likely dynamic — verify with `next build` in hour 4.

---

## File manifest

```
apps/worker/src/
├── recorder.ts          # v1 no-op, V2 asciinema capture (this proposal)
└── mux.ts               # direct-upload helper — used by seed script today,
                         #   by runTinkerCycle in V2 (this proposal)

scripts/
└── upload-demo-mp4.ts   # one-off Option A seed — uploads assets/demo/demo-agent.mp4
                         #   and prints the playback_id for .dev.vars

assets/demo/
└── demo-agent.mp4       # 10s ffmpeg-synthesised "AI computing" clip (3.3 MB)

apps/web/components/
└── RealPlayerClip.tsx   # player chrome (this proposal; pending)

apps/web/styles/
└── retro.css            # RealPlayer chrome styles (shared; additions only)
```

This proposal owns: `recorder.ts`, `mux.ts`, `upload-demo-mp4.ts`, `assets/demo/demo-agent.mp4`, `RealPlayerClip.tsx`, the `mux_playback_id` read/write path, Mux credentials + `MUX_DEMO_PLAYBACK_ID`, and the `cost_ledger` entries tagged `kind = 'mux'` (V2 only — Option A incurs no per-cycle Mux charges).
