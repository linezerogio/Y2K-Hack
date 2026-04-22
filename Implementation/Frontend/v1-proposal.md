# Geostumble Frontend — v1 Implementation Proposal

**Target:** Next.js 15 App Router on Vercel. 6-hour hackathon build.
**Scope:** `apps/web/` — the landing page, stumble flow, result page with iframe + Jazz realtime + Mux clip.
**Non-goals:** mobile responsive, auth, SSR of persona HTML (that's the Worker's job), analytics.

---

## 1. Stack decisions (locked)

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 App Router | In spec. `/s/[id]` is a dynamic route; everything else is static. |
| Language | TypeScript strict | Shared types with Worker via `packages/shared`. |
| Styling | Tailwind + one `retro.css` | Tailwind for chrome; raw CSS for CRT/scanlines/bevel. No shadcn, no framer-motion — off-brand for Y2K. |
| Realtime | `jazz-react` + `jazz-browser` | Guestbook, presence, status — all three ride the same `PersonaRoom` CoValue. |
| Video | `@mux/mux-player-react` | Lazy-loaded on `/s/[id]` only. |
| Data fetch | `fetch` direct to Worker, no React Query | One endpoint, one call. Don't install a client. |
| State | React local state + Jazz subscriptions | No Zustand, no context beyond `<JazzProvider>`. |

**Celavii design-system rules (framer-motion, `#0066FF`, gradient text) do NOT apply here.** This is intentionally anti-modern — acknowledge in PR description to avoid reviewer confusion.

---

## 2. Routes

```
/                     Server component. Static. Landing + <StumbleButton/>.
/s/[id]               Server component shell. Loads persona meta from Worker, renders client chrome.
/api/stumble          Edge route. Proxies GET to Worker /stumble, returns { personaId }.
/api/personas         (optional, admin debug) Lists from Worker; gated by ADMIN_TOKEN cookie.
```

No middleware. No auth. `/admin` is deferred to Worker-side (simpler — spec §8).

---

## 3. File layout (delta from current scaffold)

```
apps/web/
├── app/
│   ├── layout.tsx              # already exists — add <JazzProvider>
│   ├── page.tsx                # landing
│   ├── s/[id]/page.tsx         # result page (server) → <ResultShell/> (client)
│   └── api/
│       └── stumble/route.ts    # NEW — proxy to Worker
├── components/
│   ├── StumbleButton.tsx       # exists — wire to /api/stumble + router.push
│   ├── ResultShell.tsx         # NEW — client component, owns layout + Jazz subs
│   ├── Guestbook.tsx           # exists — Jazz CoList sub + add
│   ├── PresencePill.tsx        # exists — Jazz PresenceMap count + heartbeat
│   ├── StatusBanner.tsx        # exists — Jazz status field
│   ├── RealPlayerClip.tsx      # exists — <mux-player> in table-chrome
│   └── CrtFrame.tsx            # NEW — 1024px fixed-width wrapper + scanlines
├── lib/
│   ├── jazz.ts                 # exists — configure peer + anonymous account
│   ├── stumbler.ts             # NEW — localStorage stumblerId + color
│   └── worker.ts               # NEW — typed fetch helpers to Worker
├── styles/retro.css            # exists — CRT, bevel buttons, marquee fallback
└── package.json
```

---

## 4. Implementation order (matches spec §16)

**Hour 0 (09:30–10:30) — scaffolds, green path**
1. `app/page.tsx`: hardcoded landing, black bg, lime mono text, big beveled STUMBLE button. No Jazz yet.
2. `app/api/stumble/route.ts`: `GET` → `fetch(WORKER_URL + '/stumble', { redirect: 'manual' })`, return `{ personaId }` parsed from `Location`.
3. `StumbleButton.tsx`: `onClick` → hit `/api/stumble` → `router.push('/s/' + personaId)`.
4. `app/s/[id]/page.tsx`: server component, renders `<ResultShell personaId={params.id}/>` — passes nothing else.
5. `ResultShell.tsx` v1: just `<iframe src={WORKER_URL + '/p/' + id}/>` + "stumble again" link. Ship this. It's the demo skeleton.

**Deliverable at H1:** click STUMBLE on Vercel → lands on `/s/dave-001` → iframe shows hardcoded Worker HTML.

**Hour 3 (12:30–13:30) — realtime**
6. Install `jazz-react jazz-browser jazz-tools`. Wire `<JazzProvider peer={NEXT_PUBLIC_JAZZ_PEER}>` in root layout using an anonymous browser account.
7. Publish `RoomRegistry` CoMap ID as a build-time env var (`NEXT_PUBLIC_JAZZ_REGISTRY_ID`) — the seed script (spec §16 night-before) creates it and echoes the ID.
8. `lib/stumbler.ts`: on first load, generate `stumblerId = nanoid(8)` + random hex color, persist to `localStorage`. Used by Guestbook authorship + Presence entry.
9. `Guestbook.tsx`: `useCoState(PersonaRoom, roomId).guestbook` → render last 50 entries. `onSubmit` → `guestbook.push(GuestbookEntry.create({...}))`.
10. `PresencePill.tsx`: on mount, upsert `PresenceEntry` into `PresenceMap` with `lastSeen = now()`. Heartbeat every 10s. Count = entries with `lastSeen > now - 30s`.
11. `StatusBanner.tsx`: read `room.status`. If not `"idle"`, render blinking "🚧 UNDER CONSTRUCTION — {persona} is {status.split(':')[1]}…".

**Hour 4 (13:30–14:30) — polish + Mux**
12. Fetch `muxPlaybackId` for current version via `lib/worker.ts` → `GET /p/:id/meta` (add this route to Worker if missing — coordinate w/ worker-side lead).
13. `RealPlayerClip.tsx`: `<MuxPlayer streamType="on-demand" playbackId={...} />` wrapped in a `<table>` styled to look like RealPlayer 8. Conditional render — hide if null.
14. `CrtFrame.tsx`: wraps everything on `/s/[id]` in a 1024px-wide centered box with `retro.css` scanlines + flicker. Don't apply to `/` — landing already has its own flicker banner.

---

## 5. Key component contracts

### `StumbleButton`
```ts
// props: none
// behavior: POST-style click → fetch('/api/stumble') → router.push('/s/' + personaId)
// error: show "the internet is having a moment" in Comic Sans, retry button
```

### `ResultShell`
```ts
type Props = { personaId: string; personaMeta: { name: string; era: string } }
// owns: layout (iframe left, sidebar right), passes personaId to Jazz children
// does NOT reach into the iframe. Worker-served HTML is a black box.
```

### `Guestbook` / `PresencePill` / `StatusBanner`
```ts
type Props = { roomId: ID<PersonaRoom> }  // resolved by ResultShell from registry
```
All three use `useCoState` — no prop drilling of Jazz state. Each component's loading state = "…" in Courier.

### `lib/worker.ts`
```ts
export async function stumble(): Promise<{ personaId: string }>
export async function getPersonaMeta(id: string): Promise<PersonaMeta>   // uses /p/:id/meta
export async function getLatestSnapshot(id: string): Promise<{ muxPlaybackId: string|null, version: number }>
```
All return typed from `packages/shared`. No retries — fail loud, hackathon.

---

## 6. Env vars

```bash
# apps/web/.env.local
NEXT_PUBLIC_WORKER_URL=https://p.geostumble.xyz
NEXT_PUBLIC_JAZZ_PEER=wss://cloud.jazz.tools/sync
NEXT_PUBLIC_JAZZ_REGISTRY_ID=co_z...     # emitted by seed-personas.ts
NEXT_PUBLIC_MUX_ENV_KEY=env_xxx
```

No secrets in the web app. The Worker owns all keys.

---

## 7. Styling approach

**`retro.css` — one file, ~150 lines, hand-written.** Contains:
- `.crt-flicker` keyframe (opacity 0.97→1.0, 0.15s)
- `.scanlines` ::after overlay
- `.bevel` — `border: 3px outset #c0c0c0; background: #silver;` + active state inset
- `.marquee-fallback` for browsers that killed `<marquee>` (most have not — we use the tag directly on the landing page; this is backup)
- `@font-face` for "Comic Sans MS" fallback stack

Tailwind for everything else (spacing, flex on the sidebar — yes, flex is fine **in the chrome**; the *persona pages* served by the Worker are the ones that must be table-only).

---

## 8. What we explicitly punt on

- **No `/admin` in Next.js** — spec §14 routes admin to the Worker. One less auth surface.
- **No `/api/guestbook`** — Jazz handles writes directly (spec §8 marks this endpoint as "unused, demo-break fallback only"). Skip it; if Jazz dies, we already lost.
- **No SSR'd persona HTML.** The iframe is non-negotiable — persona pages must run their own `<script>` tags without Next.js CSP interference.
- **No error boundaries.** One top-level `error.tsx` per route. Hackathon.
- **No SEO, no OG tags, no sitemap.** The landing page title is enough.

---

## 9. Risks specific to the frontend

| Risk | Likelihood | Mitigation |
|---|---|---|
| Jazz client-side auth account setup takes >30min | Medium | Pair with a `jazz-react` example repo open in another tab. Timebox to 15min, fall back to SSE+REST for status (spec §17). |
| Iframe blocks Mux player via CSP | Low | Mux player sits *outside* the iframe, in the sidebar. Confirmed in layout diagram §13. |
| Presence heartbeat thrashes Jazz | Low | 10s interval, not per-mousemove. Cursor positions explicitly punted to V2. |
| `NEXT_PUBLIC_JAZZ_REGISTRY_ID` missing at build time | Medium | Build fails loud. Add a `preinstall` check or a runtime assertion in `lib/jazz.ts`. |
| Worker not ready when web deploys first | High | `/` must render with no Worker dependency. Stumble button shows "warming up the tubes…" on 502. |

---

## 10. Definition of done (frontend only, by 14:30)

- [ ] `/` deployed, beveled STUMBLE button works, lands on `/s/[id]`.
- [ ] `/s/[id]` iframes the Worker page at 1024px.
- [ ] Guestbook: type → submit → appears on a second browser within 1s.
- [ ] Presence pill shows ≥1 and increments on second tab.
- [ ] Status banner flips to "UNDER CONSTRUCTION" when Worker writes `editing:*` to Jazz.
- [ ] Mux clip plays when a `muxPlaybackId` is available; hidden otherwise.
- [ ] Full CRT retro styling on both routes; no Tailwind default look visible.

---

## 11. Open questions for the team

1. **Jazz registry bootstrap** — who runs the seed script, and when is `NEXT_PUBLIC_JAZZ_REGISTRY_ID` frozen? Blocks Hour 3.
2. **`/p/:id/meta`** — does the Worker expose persona name + latest Mux ID in one call, or two? Cheapest is one.
3. **Stumble randomness** — is `/stumble` a 302 (spec §8) or JSON? `/api/stumble` needs to know. Proposal: Worker returns JSON `{ personaId }`, we drop the redirect — easier for Next.js to consume and keeps the URL clean.
