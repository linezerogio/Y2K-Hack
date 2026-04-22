# Jazz Integration — Implementation Tracker

**Proposal:** [v1-proposal.md](./v1-proposal.md)
**Spec:** [../../project.md](../../project.md)
**Event:** Frontier Tech Week Y2K Hackathon (6 hours) — 2026-04-22
**Legend:** `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

**Strategy note.** The proposal's §7 time budget (~2h15m) blows the 60-min Hour-3 slot. This tracker front-loads plumbing (schema, worker writer, provider, seed) into Phase 0 so Hour 3 is UI-only.

---

## Phase 0 — Night-before (plumbing)

Maps to [project.md §16 "Night before"](../../project.md#L587) · "Jazz worker account created + sync server URL confirmed". Goal: every dependency for Hour 3 exists and compiles; only UI work remains.

### 0.1 Accounts & credentials
- [x] `npx jazz-run account create --name geostumble-worker` — account `co_zDjRJynhDQrQLMG5fUGBjEvQQUN`
- [x] `JAZZ_WORKER_ACCOUNT` + `JAZZ_WORKER_SECRET` written to `apps/worker/.dev.vars`
- [x] `JAZZ_SYNC_URL=wss://cloud.jazz.tools/sync` in `.dev.vars`
- [ ] `wrangler secret put JAZZ_WORKER_ACCOUNT` + `JAZZ_WORKER_SECRET` (prod; defer until first deploy that needs Jazz)
- [ ] `JAZZ_SYNC_URL` mirrored into `wrangler.toml [vars]`
- [ ] `NEXT_PUBLIC_JAZZ_PEER=wss://cloud.jazz.tools/sync` in `apps/web/.env.local`

### 0.2 Dependency install + version pin
- [x] `jazz-tools@0.20.17` installed in `apps/worker`
- [x] `packages/shared/package.json` created with `jazz-tools` as peerDependency
- [ ] `jazz-tools` + `jazz-react` installed in `apps/web` — **deferred** until Frontend scaffolds web (currently empty `package.json`)
- [x] **API drift confirmed.** Proposal §4 schema uses `class X extends CoMap` (pre-0.15 API). Current 0.20.17 uses factory pattern: `co.map({...})`, `co.list(...)`, `co.record(...)` with `z.string()` / `z.date()` primitives. Schema in 0.3 will use the new API.
- [x] `startWorker` confirmed exported from `jazz-tools/worker` subpath
- [ ] Versions pinned (no `^` ranges) before final deploy

### 0.3 Shared schema
- [x] `packages/shared/src/jazz-schema.ts` exports `GuestbookEntry`, `GuestbookList`, `PresenceEntry`, `PresenceMap`, `PersonaRoom`, `RoomRegistry` using current `co.map/list/record` + `z` API
- [x] `packages/shared/src/index.ts` re-exports schema + existing types
- [x] Schema loads + instantiates under `node --experimental-strip-types`
- [ ] **Permission model** (review finding #5): schema shape supports split groups, but actual `everyone: writer` group-binding happens at seed time (0.6) — the schema just declares the references. Don't forget to create guestbook/presence under child groups when seeding.
- [ ] `tsc --noEmit` clean across `apps/worker` + `packages/shared` once worker imports the schema

### 0.4 Worker-side writer (`apps/worker/src/jazz-writer.ts`)
- [ ] `getJazzWorker(env)` memoizes `startWorker(...)` at module scope
- [ ] `writeStatus(env, personaId, status)` loads `RoomRegistry` by id, resolves `PersonaRoom`, sets `status`
- [ ] All errors caught + logged (fire-and-forget safe; never throws into `runTinkerCycle`)
- [ ] Silent no-op when `RoomRegistry` key missing (seed not yet run)
- [ ] Lazy-import `jazz-tools/worker` inside `writeStatus` if Wrangler bundle nears size limit (review finding #9)

### 0.5 Browser provider (`apps/web/lib/jazz.ts`)
- [ ] `createJazzReactContext` (or current equivalent) with `auth="anonymous"`, `storage="indexedDB"`
- [ ] `apps/web/app/layout.tsx` wrapped in `<JazzProvider>`
- [ ] Anonymous account secret persists to `localStorage` — verify by reloading twice and confirming same account id
- [ ] `useCoState` exported for component use

### 0.6 Seed script (`scripts/seed-jazz-rooms.ts`)
- [ ] Boots worker Jazz client with the runtime account
- [ ] Reads personas from Neon — **5 personas** (not 20; post commit `5362349`)
- [ ] Creates one `RoomRegistry` CoValue; logs id to stdout
- [ ] Per persona: creates `GuestbookList`, `PresenceMap`, `PersonaRoom`; sets registry entry keyed by `personaId` (e.g. `dave-001`), not DO hex id
- [ ] Child CoValue groups set so `everyone: writer` applies to guestbook + presence only
- [ ] Idempotent: re-running reuses existing registry from KV; only seeds rooms missing from registry
- [ ] Output: `JAZZ_REGISTRY_ID` pasted into `apps/worker/.dev.vars` + `apps/web/.env.local` (`NEXT_PUBLIC_JAZZ_REGISTRY_ID`)
- [ ] Also written to KV `jazz:registry_id` (Cloudflare tracker 0.5 depends on this)

### 0.7 Bundle size check
- [ ] `wrangler deploy --dry-run` run after jazz-writer wired → bundle still under Worker limit
- [ ] If over: lazy-import `jazz-tools/worker` per 0.4

### 0.8 Phase 0 exit gate
- [ ] Round-trip test: standalone Node script writes a `GuestbookEntry`, throwaway page reads it via `useCoState`
- [ ] DO can call `writeStatus` without crashing the `runTinkerCycle` (no-op when registry missing, logs when present)
- [ ] `JAZZ_REGISTRY_ID` is set everywhere it needs to be

---

## Phase 4 — Hour 3 (12:30–13:30): Realtime wiring

Maps to [§16 Hour 3](../../project.md#L625). Assumes Phase 0 green. Pure UI work + one line in the DO.

### 4.1 Wire writer into PersonaDO (+0–10m)
- [ ] `persona-do.ts` `onStep` callback calls `writeStatus(env, personaId, step)` — **fire-and-forget** (`void writeStatus(...)`, no `await`; review finding #7)
- [ ] Also called on `setStatus('editing')` and `setStatus('idle')` in `runTinkerCycle`
- [ ] Verify via `wrangler tail`: `POST /admin/nudge/dave-001` produces status writes without stalling the agent loop
- [ ] Jazz dashboard (or second test tab) shows status transitions in <1s

### 4.2 Guestbook component (+10–30m)
- [ ] `apps/web/components/Guestbook.tsx` subscribes via `useCoState(PersonaRoom, roomId, { guestbook: [{}] })`
- [ ] `useRegistryRoom(personaId)` hook resolves `personaId` → `roomId` from the registry CoValue
- [ ] Renders entries with per-stumbler color
- [ ] Post form creates `GuestbookEntry` with `stumblerHandle()` + `stumblerColor()` (backed by `localStorage`: `geostumble.handle`, `geostumble.color`)
- [ ] Client-side 3s debounce + 140-char cap on input (review + proposal §10)
- [ ] **Verify:** two tabs on `/s/dave-001`, post in one → appears in other in <1s

### 4.3 StatusBanner component (+30–40m)
- [ ] `apps/web/components/StatusBanner.tsx` reads `room.status` via `useCoState`
- [ ] Renders animated `<marquee>` "🚧 UNDER CONSTRUCTION — {name} is {humanize(status)}…" when `status !== 'idle'`
- [ ] Hidden when idle
- [ ] **Verify:** `POST /admin/nudge/dave-001` → banner animates through statuses → returns to idle

### 4.4 PresencePill component (+40–55m)
- [ ] `apps/web/components/PresencePill.tsx` writes `room.presence[stumblerId] = PresenceEntry.create(...)` on mount
- [ ] Heartbeat updates `lastSeen` every 10s
- [ ] Count = entries where `Date.now() - lastSeen < 30_000`
- [ ] Does not remove own entry on unmount (GC'd by stale filter)
- [ ] **Verify:** open 3 tabs, count → 3; close one, within 30s count → 2
- [ ] Known v1 debt: `PresenceMap` grows unboundedly; accepted for hackathon (review finding #6)

### 4.5 Wire into result page (+55–60m)
- [ ] `apps/web/app/s/[id]/page.tsx` mounts `<StatusBanner />`, `<Guestbook />`, `<PresencePill />` around the iframe per project.md §13 layout
- [ ] `?nojazz=1` query flag pre-wired to skip Jazz and use SSE-only mode (demo fallback)

### 4.6 Phase 4 exit gate (= proposal §11 done criteria)
- [ ] Two tabs on same persona page: guestbook round-trips in <1s
- [ ] Presence count correct within 10s of tab open/close
- [ ] `POST /admin/nudge/:id` flips banner on all open viewers
- [ ] Blocking `cloud.jazz.tools` in DevTools → page still renders, UI shows "disconnected" state, no crash
- [ ] Seed script idempotent check: re-run, no duplicates

---

## Fallback ladder (pre-decided, from proposal §9)

| Time mark | Check | If behind |
|-----------|-------|-----------|
| +20m | Guestbook round-trips between two tabs | Skip presence; go straight to status banner |
| +40m | Status banner flips when worker writes | Drop presence entirely; ship guestbook + status |
| +55m | Presence count works | Accept it; move on |
| Any time | Worker → Jazz write fails hard | **Switch to SSE-only** via existing `/p/:id/stream`; StatusBanner uses `EventSource`; guestbook stays on Jazz if up, otherwise hide and accept the loss |

---

## Post-event

- [ ] Rotate `JAZZ_WORKER_SECRET` (per project.md §18)
- [ ] Optional: sweep stale `PresenceMap` entries (known v1 debt)

---

## Open questions

- [ ] **J1 — `jazz-tools` worker bundle size** — resolved in 0.7. Mitigation: lazy-import.
- [ ] **J2 — Field-level permissions** — Jazz doesn't offer per-field ACLs; structural workaround is child CoValues (see 0.3). Confirm this actually works in practice during seed script testing.
- [ ] **J3 — Registry discovery** — dual-published to env var + KV. KV path exists so the worker can re-read after a secret rotation without redeploy; if that flexibility isn't used, drop the KV write post-event.
- [ ] **J4 — Anonymous account loss** — accepted. `localStorage` eviction = new identity. Not a hackathon blocker.
- [ ] **J5 — Presence GC** — client-side filter only; map grows monotonically. Worker sweep during `alarm()` is a post-event cleanup, not a v1 requirement.

---

## Cross-proposal coupling

| Depends on | For | Tracked in |
|------------|-----|------------|
| Database 0.x | Persona rows to seed rooms from | [../Database/v1-tracker.md](../Database/v1-tracker.md) |
| Cloudflare 0.5 | `jazz:registry_id` KV write | [../Cloudflare/v1-tracker.md](../Cloudflare/v1-tracker.md) |
| Cloudflare 4.1 | `writeStatus` called from `runTinkerCycle.onStep` | [../Cloudflare/v1-tracker.md](../Cloudflare/v1-tracker.md) |
| Frontend Phase 3 | `<Guestbook/>`, `<PresencePill/>`, `<StatusBanner/>` mounted on `/s/[id]` | [../Frontend/](../Frontend/) |
