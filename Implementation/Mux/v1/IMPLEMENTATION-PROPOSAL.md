# Mux Video — Implementation Proposal

**Date:** 2026-04-22
**Version:** 1.0
**Event:** Frontier Tech Week Y2K Hackathon (6 hours)
**Stack:** Mux Video (VOD) · `@mux/mux-node` (Worker) · `@mux/mux-player-react` (Web)
**Source of truth:** [project.md](../../../project.md)

---

## Executive Summary

Mux turns every coding-agent run into a replayable "making of" clip embedded on the persona page. This is the single most narratively valuable sponsor integration: without it, the claim "the AI wrote this page" is invisible; with it, judges see the agent type.

Flow: the Worker's `recorder.ts` captures the agent's sandbox session (asciinema `.cast` → rendered to MP4), uploads to Mux via direct-upload URL, persists the returned `playback_id` on `page_snapshots`, and the Vercel UI renders `<mux-player playback-id={id} />` inside a Y2K RealPlayer-styled frame.

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

Responsibilities:
- Wrap the sandbox so every agent tool call (`write_file`, `list_assets`, `run_shell`, etc.) is emitted as a timestamped asciinema frame
- On `stop()`, return the `.cast` contents as a string
- Render the `.cast` to MP4 by shelling out to `asciinema-agg` (or `ffmpeg` with a typewriter overlay) inside the sandbox before it's destroyed

Interface:
```ts
export interface Recorder {
  logStep(name: string, payload?: unknown): void
  stop(): Promise<{ cast: string; mp4: Uint8Array; durationSec: number }>
}
export function startRecorder(sandbox: Sandbox): Recorder
```

**Critical invariants:**
- Rendering MP4 must happen *before* `sandbox.destroy()` — the binary lives in the sandbox FS
- If MP4 rendering fails, return `{ cast, mp4: null }` and let `mux.ts` skip — the page is more important than the clip
- Cap recording at 60s of wall-clock agent time; truncate if exceeded

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

`.dev.vars` (Wrangler):
```
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
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

Write path in `runTinkerCycle` ([§9:359](../../../project.md#L359)):
```ts
const muxId = await uploadRecordingToMux(env, recorder.output.mp4)
await recordSnapshot(env, {
  personaId,
  version,
  htmlKvKey,
  muxPlaybackId: muxId,   // nullable
  sandboxLog: transcript,
  tokenCostUsd: cost,
})
```

Read path on Vercel: `/s/[id]/page.tsx` queries Neon for the latest `page_snapshots` row by `persona_id` ordered by `version DESC`, passes `mux_playback_id` to `<RealPlayerClip />`.

---

## Milestones (maps to §16 ship order)

| Hour | Milestone | Done when |
|------|-----------|-----------|
| Night before | Manual `curl` against Mux direct-upload with a static MP4; verify `playback_id` plays in browser | Asset URL plays in Safari + Chrome |
| Hour 1 | `mux.ts` wired into `runTinkerCycle`; still using a canned MP4 | `page_snapshots.mux_playback_id` non-null for dave-001 |
| Hour 4 | `recorder.ts` produces a real `.cast` + MP4 from the live agent session ([§16:634](../../../project.md#L634)) | Mux asset for tyler shows actual agent typing |
| Hour 4 | `<RealPlayerClip />` embedded on `/s/[id]`; plays inline ([§16:638](../../../project.md#L638)) | Hitting `/s/dave-001` shows clip in RealPlayer frame |
| Hour 5 | Prewarm run populates `mux_playback_id` for all 10 demo personas | All 10 `/s/` pages have playable clips |

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

1. **Cast → MP4 renderer**: `asciinema-agg` vs. a custom `ffmpeg drawtext` overlay. Former is prettier, latter is guaranteed-present. Decide during night-before smoke test.
2. **Recording duration cap**: 60s feels right for demo but agent cycles may stretch to 90s. Confirm typical wall-clock from Gemini proposal before freezing the cap.
3. **Playback policy**: public is simplest; signed would let us expire demo clips after 7 days automatically. Deferred to post-event — manual deletion per [§18:673](../../../project.md#L673) is fine.
4. **Poster frame**: rely on Mux auto-poster, or grab a specific frame (e.g., the final "done" screen)? Auto is cheaper; revisit only if posters look bad.
5. **Bundle strategy for the player**: dynamic import vs. static. Likely dynamic — verify with `next build` in hour 4.

---

## File manifest

```
apps/worker/src/
├── recorder.ts          # asciinema capture + MP4 render (this proposal)
└── mux.ts               # direct-upload helper (this proposal)

apps/web/components/
└── RealPlayerClip.tsx   # player chrome (this proposal)

apps/web/styles/
└── retro.css            # RealPlayer chrome styles (shared; additions only)
```

This proposal owns: `recorder.ts`, `mux.ts`, `RealPlayerClip.tsx`, the `mux_playback_id` read/write path, Mux credentials, and the `cost_ledger` entries tagged `kind = 'mux'`.
