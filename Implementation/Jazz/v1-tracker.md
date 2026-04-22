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

### 0.4 Worker-side writer (`apps/worker/src/jazz-writer.ts`) — **DONE**
- [x] `writeJazzStatus(env, personaId, status)` opens short-lived worker session per call, loads `RoomRegistry`, resolves `PersonaRoom`, sets `status`, waits for sync, shuts down. ~1–3s per call.
- [x] All errors caught + logged via `console.warn('[jazz-writer]', ...)`; never throws into `runTinkerCycle`
- [x] Silent no-op when `JAZZ_WORKER_ACCOUNT`/`JAZZ_WORKER_SECRET` or `RoomRegistry` id missing
- [x] Registry id resolved from KV (`jazz:registry_id`) first, `JAZZ_REGISTRY_ID` env var fallback
- [x] `edge-wasm` side-effect import for Cloudflare Worker crypto provider
- [~] **Note:** proposal suggested module-scope memoization (`workerPromise ??= startWorker(...)`). Current impl creates + destroys per call — simpler, avoids DO-lifetime socket management, but costs a handshake per setStatus (~6× per cycle). Fine for v1; optimize only if we see it break.
- [x] Not using lazy-import — bundle check (0.7) passed at 890 KiB gzipped, well under limit

### 0.5 Browser provider (`apps/web/lib/jazz.ts`)
- [ ] `createJazzReactContext` (or current equivalent) with `auth="anonymous"`, `storage="indexedDB"`
- [ ] `apps/web/app/layout.tsx` wrapped in `<JazzProvider>`
- [ ] Anonymous account secret persists to `localStorage` — verify by reloading twice and confirming same account id
- [ ] `useCoState` exported for component use

### 0.6 Seed script (`scripts/seed-jazz-rooms.ts`) — **DONE** 🎉
- [x] Script at `scripts/seed-jazz-rooms.ts`, exposed as `npm run seed:jazz`
- [x] Boots Jazz worker via `startWorker()` with creds from env / `.dev.vars`
- [x] Reads 5 personas from Neon: `becky-002, dave-001, harold-005, linda-004, tyler-003`
- [x] Creates `RoomRegistry` on first run; logs id + paste-in instructions for `.dev.vars` + KV
- [x] Per persona: creates `Group.makePublic('writer')` → `GuestbookList` + `PresenceMap` under it → `PersonaRoom` owned by worker (so `status` stays worker-write-only per review finding #5)
- [x] Registry keyed by `personaId` (e.g. `dave-001`)
- [x] Idempotent: re-run with `JAZZ_REGISTRY_ID` set → loads registry, skips personas already present. Verified: second run reports `✓ seeded 0 new, 5 already present`.
- [x] `RoomRegistry ID: co_zAMBDSKQyYEvJ1FZetCbXzcGPku`
- [x] Written to `apps/worker/.dev.vars` (`JAZZ_REGISTRY_ID`)
- [x] Pushed to production KV: `PAGES['jazz:registry_id'] = co_zAMBDSKQyYEvJ1FZetCbXzcGPku`
- [ ] `NEXT_PUBLIC_JAZZ_REGISTRY_ID` in `apps/web/.env.local` — deferred until web app scaffolded

### 0.7 Bundle size check — **PASSED**
- [x] `wrangler deploy --dry-run` → **Total Upload: 3442.36 KiB / gzip: 889.61 KiB** — well under 10 MiB paid-plan limit
- [x] Jazz `cojson_core_wasm.wasm` (435 KiB) is the largest single asset; acceptable
- [x] Lazy-import not required

### 0.8 Phase 0 exit gate — **PASSED** (worker side)
- [x] `writeJazzStatus` wired into `PersonaDO.setStatus` ([persona-do.ts:256](../../apps/worker/src/persona-do.ts)) — fire-and-forget via `void this.state.storage.get<string>('personaId').then(...)`
- [x] Worker typechecks clean (`tsc --noEmit`)
- [x] All Jazz secrets present in prod Wrangler: `JAZZ_WORKER_ACCOUNT`, `JAZZ_WORKER_SECRET`
- [x] `JAZZ_REGISTRY_ID` resolvable from prod KV (`jazz:registry_id`)
- [ ] Browser-side round-trip (`GuestbookEntry` write → `useCoState` read) — blocked on Frontend scaffold
- [ ] Live nudge → prod Jazz status update observable — deploy-and-verify pending

---

## Phase 4 — Hour 3 (12:30–13:30): Realtime wiring

Maps to [§16 Hour 3](../../project.md#L625). Assumes Phase 0 green. Pure UI work + one line in the DO.

### 4.1 Wire writer into PersonaDO (+0–10m) — **CODE DONE; verification pending**
- [x] `setStatus` calls `writeJazzStatus` via `void ... .then()` — fire-and-forget (no await on agent hot path)
- [x] Covers `setStatus('editing')`, `setStatus('editing:agent')`, `onStep` callback `setStatus('editing:${s}')`, `setStatus('editing:saving')`, `setStatus('idle')` — all 5 transitions per cycle
- [ ] Verify via `wrangler tail`: `POST /admin/nudge/dave-001` produces Jazz writes without stalling the agent loop
- [ ] Second browser tab subscribed to `PersonaRoom.status` shows live transitions in <1s

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
