# Frontend ↔ Worker Integration Guide

Everything the Vercel Next.js app needs to light up the Cloudflare Worker. Last updated 2026-04-22 against Worker version `bf29b689`.

---

## TL;DR

- **Worker base URL:** `https://geostumble-worker.eliothfraijo.workers.dev`
- **No custom domain in v1** — use the `.workers.dev` URL everywhere (`geostumble.xyz` deferred post-event).
- **Iframe src** points directly at `…/p/:id` — do NOT proxy HTML through Next.js.
- **Sidebar JSON** comes from `…/p/:id/meta` — cached 5s worker-side.
- **Stumble randomness** comes from `…/stumble` — returns JSON `{ personaId }`, not a 302.
- **Realtime updates** come from two places: Jazz (guestbook, presence, live status) and Worker SSE as a Jazz fallback.
- All routes under `/admin/*` are **bearer-gated and server-only** — never call them from the browser.

---

## 1. Environment variables

Put these in Vercel:

```bash
# Public — exposed to the browser, safe to render
NEXT_PUBLIC_WORKER_URL=https://geostumble-worker.eliothfraijo.workers.dev
NEXT_PUBLIC_JAZZ_PEER=wss://cloud.jazz.tools/sync
NEXT_PUBLIC_JAZZ_REGISTRY_ID=                # filled after seed-jazz-rooms.ts runs
NEXT_PUBLIC_MUX_ENV_KEY=                     # Mux public env key for the player

# Server-only — never NEXT_PUBLIC_, only read in API route handlers
ADMIN_TOKEN=                                 # grab from #geostumble-secrets
```

Local dev: same values in `apps/web/.env.local`.

---

## 2. Public routes (use freely from browser + server)

### `GET /health`

```json
{ "ok": true, "personaCount": 5, "poolSize": 5 }
```

Cheap call. Useful for `_middleware.ts` warmup or a `/status` page.

### `GET /stumble`

```json
{ "personaId": "dave-001" }
```

Random pick from personas with a `ready:{id}` sentinel in KV. Returns `503 { error: "ready pool is empty" }` when nothing is prewarmed — propagate a user-friendly "no stumbles available, try again in a moment" message.

**Frontend flow** (per project.md §8):

```ts
// app/api/stumble/route.ts — server-side
export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/stumble`, {
    cache: 'no-store',
  });
  if (!res.ok) return Response.json({ error: 'no stumbles' }, { status: 503 });
  return Response.json(await res.json());
}
```

Then on the client, `<StumbleButton/>` calls `/api/stumble` and navigates to `/s/${personaId}`.

### `GET /p/:personaId`

Returns `text/html` — the agent-written page. Use as iframe source. No auth.

```tsx
// app/s/[id]/page.tsx
<iframe
  src={`${process.env.NEXT_PUBLIC_WORKER_URL}/p/${params.id}`}
  className="w-[760px] h-[600px] border-0"
  sandbox="allow-scripts allow-same-origin"  // agent pages do not use JS but CSS animations need same-origin
/>
```

Returns `404` for unknown persona IDs or personas that have never tinkered. The frontend should render a "page is being built, stumble again" fallback card if the iframe 404s.

### `GET /p/:personaId/meta`

Sidebar metadata. 5-second worker-side cache.

```json
{
  "personaId": "dave-001",
  "name": "Dave",
  "era": "1999-Q3",
  "version": 8,
  "muxPlaybackId": null,
  "status": "idle"
}
```

> **`status` here is a snapshot/seed value only.** Use it for first paint. The live value comes from Jazz `PersonaRoom.status` (see §3) — rebind there after hydration. `muxPlaybackId` is `null` until Phase 5 lands the Mux pipeline.

Returns `404` for unknown persona IDs.

### `GET /p/:personaId/stream` — Server-Sent Events

Live status transitions straight from the Durable Object, with no Jazz dependency. Event format:

```
event: status
data: idle

event: status
data: editing:iteration-1

event: status
data: editing:agent

event: status
data: editing:saving

event: status
data: idle
```

```ts
// components/StatusBanner.tsx
'use client';
import { useEffect, useState } from 'react';

export function StatusBanner({ personaId }: { personaId: string }) {
  const [status, setStatus] = useState('idle');
  useEffect(() => {
    const es = new EventSource(
      `${process.env.NEXT_PUBLIC_WORKER_URL}/p/${personaId}/stream`,
    );
    es.addEventListener('status', (e) => setStatus((e as MessageEvent).data));
    return () => es.close();
  }, [personaId]);
  return <div>{status === 'idle' ? null : `🚧 ${status}`}</div>;
}
```

**When to use this vs Jazz:** once the Jazz wiring lands (Phase 4), Jazz is the primary source of truth for `status`. SSE is the fallback when `jazz:sync` is unavailable or when you want a simple subscription that doesn't require a Jazz account client. For the demo, prefer Jazz for status + guestbook + presence; SSE is the "it always works even if Jazz is down" path per project.md §17.

---

## 3. Jazz (Phase 4, landing next)

Schemas already live at `packages/shared/src/jazz-schema.ts`. Exports include `PersonaRoom`, `GuestbookList`, `PresenceMap`, `RoomRegistry`.

**Registry discovery:**

```ts
import { RoomRegistry } from '@geostumble/shared';

const registry = await RoomRegistry.load(
  process.env.NEXT_PUBLIC_JAZZ_REGISTRY_ID!,
  browserAccount,
  {},
);
const roomId = registry?.[personaId];
const room = await PersonaRoom.load(roomId, browserAccount, {
  guestbook: [{}],
  presence: {},
});
```

- **Read `room.status` for live banner updates** — replaces the SSE subscription for most cases.
- **Write to `room.guestbook` via `CoList.push`** — no Worker roundtrip needed.
- **Presence tracking:** upsert `room.presence[stumblerId]` on page hover/mouse.

Worker is the sole writer to `status`. Browser accounts have `writer` role on `guestbook` + `presence` only.

**Not yet live:** `NEXT_PUBLIC_JAZZ_REGISTRY_ID` is blank until `scripts/seed-jazz-rooms.ts` runs. Until then, fall back to SSE for status and stub out the guestbook panel.

---

## 4. R2 assets served from `pub-*.r2.dev`

Agent pages reference images as:

```html
<img src="https://pub-7313ad06136f4e89bec6f10ac19488c8.r2.dev/assets/tiles/stars-blue.gif">
```

Frontend doesn't normally load these directly — they're embedded inside the iframe. If you need them outside the iframe (e.g., preview cards, thumbnails), they're publicly fetchable with permissive CORS. No auth needed.

---

## 5. Typed client (recommended)

Drop-in `lib/worker.ts` for the frontend:

```ts
const BASE = process.env.NEXT_PUBLIC_WORKER_URL!;

export interface PersonaMeta {
  personaId: string;
  name: string;
  era: string;
  version: number;
  muxPlaybackId: string | null;
  status: string; // seed only — rebind to Jazz after hydration
}

export async function stumble(): Promise<{ personaId: string } | null> {
  const res = await fetch(`${BASE}/stumble`, { cache: 'no-store' });
  return res.ok ? res.json() : null;
}

export async function getPersonaMeta(
  personaId: string,
  init?: { signal?: AbortSignal },
): Promise<PersonaMeta | null> {
  const res = await fetch(`${BASE}/p/${personaId}/meta`, {
    ...init,
    next: { revalidate: 5 }, // matches worker-side cache
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`meta ${res.status}`);
  return res.json();
}

export function personaIframeSrc(personaId: string): string {
  return `${BASE}/p/${personaId}`;
}

export function personaStatusStreamUrl(personaId: string): string {
  return `${BASE}/p/${personaId}/stream`;
}
```

---

## 6. Admin surface (server-side only)

Everything under `/admin/*` requires `Authorization: Bearer ${ADMIN_TOKEN}`. Never expose the token to the browser. Wrap these in Next.js route handlers when the admin panel needs them:

| Route | Method | Returns |
|---|---|---|
| `/admin/nudge/:id` | POST | `{ version, bytes, usedFallback, qualityGate, iterations, tokenUsage, elapsedMs }` — triggers a fresh tinker cycle (~15–30s) |
| `/admin/freeze` | POST | `{ frozen: true }` — kill-switch, pauses all alarms |
| `/admin/thaw` | POST | `{ frozen: false }` — resumes |
| `/admin/cost` | GET | `{ totalUsd, cached }` — current spend vs `COST_CAP_USD` |
| `/admin/debug/transcript/:id` | GET | `text/plain` — last agent transcript for debugging |
| `/admin/smoke/sandbox` | POST | `{ ok, tidyExitCode, elapsedMs, ... }` — sandbox health check |

Admin panel pattern:

```ts
// app/api/admin/nudge/[id]/route.ts
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/admin/nudge/${params.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
  });
  return Response.json(await res.json(), { status: res.status });
}
```

The browser calls `/api/admin/nudge/:id` (no token in the request), and Vercel's server adds the bearer header before forwarding. `ADMIN_TOKEN` stays server-side.

---

## 7. The full user journey

```
Browser                       Vercel                       Worker                 Jazz Cloud
   │                            │                            │                         │
   │ click STUMBLE              │                            │                         │
   ├──────────────────────────► │                            │                         │
   │                            │ GET /api/stumble           │                         │
   │                            ├──────────────────────────► │ GET /stumble            │
   │                            │                            │ (KV list ready:*)       │
   │                            │ ◄────────────────────────── │ { personaId }           │
   │ 302 /s/{id}                │                            │                         │
   │ ◄────────────────────────── │                            │                         │
   │                            │                            │                         │
   │ GET /s/{id}                │                            │                         │
   ├──────────────────────────► │ renders layout             │                         │
   │                            │ SSR preload /p/{id}/meta   │                         │
   │                            ├──────────────────────────► │                         │
   │                            │ ◄────────────────────────── │                         │
   │ HTML with iframe,          │                            │                         │
   │ <StumbleHUD/>, <Guestbook/>│                            │                         │
   │ ◄────────────────────────── │                            │                         │
   │                            │                            │                         │
   │ iframe loads /p/{id}       │                            │                         │
   ├────────────────────────────┼──────────────────────────► │ GET /p/{id}             │
   │ ◄──────────────────────────┼────────────────────────────│ text/html (DO/KV)       │
   │                            │                            │                         │
   │ Jazz subscribes to room    │                            │                         │
   ├────────────────────────────┼────────────────────────────┼───────────────────────► │
   │ ◄──────────────────────────┼────────────────────────────┼────────────────────────── │ status, guestbook
   │                            │                            │                         │
   │ write guestbook entry      │                            │                         │
   ├────────────────────────────┼────────────────────────────┼───────────────────────► │
```

---

## 8. What happens during a tinker cycle (so the UI can narrate)

1. User (or admin nudge) triggers `POST /admin/nudge/:id` → DO spins up
2. DO writes `status = 'editing'` → Jazz CoValue updates + SSE emits `editing`
3. DO calls `createSandbox` → container boots (~1-2s)
4. Coding agent tool loop (Gemini 2.5 Flash → Gemini 3 flash preview):
   - `editing:iteration-1` (list_assets)
   - `editing:iteration-2` (list_assets)
   - `editing:iteration-3` (write_file) + possible mid-loop reminder
   - `editing:iteration-4` (validate_html)
   - `editing:iteration-5` (done)
5. `editing:saving` → KV `page:{id}:v{n}` + `page:{id}:current` + read-back
6. Neon `page_snapshots` insert + `cost_ledger` insert
7. `sandbox.destroy()`
8. `status = 'idle'` + new `ready:{id}` sentinel

Total: 16-30 seconds. The UI should:
- Show "🚧 UNDER CONSTRUCTION" banner while `status !== 'idle'`
- Optionally animate the current `editing:X` substep
- Refresh the iframe `src` after hitting `idle` (append `?v=${version}` from meta to bust the browser cache)

---

## 9. Gotchas

- **Iframe cache:** browser caches `/p/:id`. After a nudge, refresh by mutating the iframe src: `src={`${BASE}/p/${id}?v=${meta.version}`}`. The query string is ignored by the Worker but busts browser cache.
- **`/stumble` empty:** if you deploy before running `npm run prewarm`, the pool is empty. Handle 503 gracefully — "pages are warming up".
- **Meta status staleness:** meta's `status` field is a 5s-cached snapshot. Use Jazz or SSE for live updates; meta is only for first paint of the sidebar.
- **No CORS headers on iframe content:** this is intentional — the iframe content has `same-origin` from its own perspective (served from `workers.dev`). If you need to read iframe DOM from the parent, you can't (different origins). Use `postMessage` if needed, but for v1 nothing reads across the boundary.
- **Kill-switch visual:** if the cost cap hits (`totalUsd >= capUsd`), `/admin/nudge` returns `500 { error: "cost cap hit" }`. Serving and stumbling keep working from the pool — only new writes are blocked.

---

## 10. Contract stability

Endpoints in §2 are **frozen for v1**. If the Worker contract changes, bump the version in the tracker and post in `#geostumble-frontend`. The Vercel app should never need to know about Neon, R2 keys, or DO IDs — all that lives behind the Worker.

If you need something not in §2 (e.g. batch meta, persona list, gallery index), open an issue against `apps/worker/` and we'll ship it.

---

## Contacts

- **Worker + DO:** Elioth / Cloudflare agent owner
- **Jazz schema:** `packages/shared/src/jazz-schema.ts` — Jazz proposal owner
- **Neon (behind Worker):** Database agent owner
- **Spec:** `project.md`, `Implementation/Cloudflare/v1-proposal.md`, `Implementation/Cloudflare/v1-tracker.md`
