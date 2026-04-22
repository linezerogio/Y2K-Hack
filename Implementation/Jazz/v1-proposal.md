# Jazz Integration — v1 Implementation Proposal

**Target:** Geostumble (Y2K Hackathon, 2026-04-22, 6 hrs)
**Scope:** Realtime guestbook, presence, and per-persona live status via Jazz CoValues.
**Authors:** v1 for Hour 3 (12:30–13:30) of ship order.

---

## 1. Goals

1. **Guestbook** — stumblers post notes to a persona's page; all viewers see updates instantly.
2. **Presence** — "👀 N stumblers here" count per persona, live.
3. **Live status** — when the PersonaDO runs a tinker cycle, UI shows "Dave is picking a background tile…" synchronized across all viewers.
4. **Zero stumbler auth** — anonymous accounts created client-side on first visit, persisted in `localStorage`.

## 2. Non-goals (v1)

- No cross-persona "webring" CoValues (V2).
- No moderation, rate-limiting, profanity filter.
- No message editing / deletion.
- No cursor tracking (presence is count-only in v1).
- No offline-first reconciliation beyond what Jazz gives us for free.

## 3. Architecture

```
┌────────────────────────────┐        ┌────────────────────────────┐
│ Browser (Next.js / Vercel) │        │ Worker (Cloudflare DO)     │
│ jazz-react + jazz-browser  │        │ jazz-tools (node-ish)      │
│ Anonymous guest account    │        │ Worker account (service)   │
└──────────────┬─────────────┘        └──────────────┬─────────────┘
               │ wss                                  │ wss
               └──────────────┬───────────────────────┘
                              ▼
                     ┌──────────────────┐
                     │ Jazz Cloud sync  │
                     │ cloud.jazz.tools │
                     └──────────────────┘
```

- **Browser** reads + writes guestbook entries, reads status, writes own presence heartbeat.
- **Worker DO** writes status transitions only. Does not read browser traffic.
- **Jazz Cloud** is source of truth for realtime state. Neon remains source of truth for persona identity / snapshots.

## 4. CoValue schema

File: `packages/shared/src/jazz-schema.ts` (shared between web + worker).

```ts
import { co, CoList, CoMap } from 'jazz-tools';

export class GuestbookEntry extends CoMap {
  author   = co.string;  // "anon-42" display handle
  message  = co.string;
  color    = co.string;  // "#ff00cc" — random per stumbler
  createdAt = co.Date;
}

export class GuestbookList extends CoList.Of(co.ref(GuestbookEntry)) {}

export class PresenceEntry extends CoMap {
  stumblerId = co.string; // short random id from localStorage
  lastSeen   = co.Date;
}

export class PresenceMap extends CoMap.Record(co.ref(PresenceEntry)) {}

export class PersonaRoom extends CoMap {
  personaId = co.string;
  status    = co.string;       // "idle" | "editing:selecting-bg" | ...
  guestbook = co.ref(GuestbookList);
  presence  = co.ref(PresenceMap);
}

export class RoomRegistry extends CoMap.Record(co.string) {}
// key:  personaId   →   value: PersonaRoom CoValue id
```

**Registry discovery.** A single `RoomRegistry` CoValue. Its id is emitted at build time into `NEXT_PUBLIC_JAZZ_REGISTRY_ID` and also stored in KV at `jazz:registry_id` so the Worker can read it. Clients subscribe to the registry once, then hydrate a `PersonaRoom` by id on demand.

## 5. Accounts & auth

| Actor | Account | Created where | Persistence |
|-------|---------|---------------|-------------|
| Worker (DO writer) | Jazz Worker Account | Pre-hackathon via Jazz CLI | `JAZZ_WORKER_ACCOUNT` + `JAZZ_WORKER_SECRET` in `.dev.vars` |
| Browser stumbler  | Anonymous Account    | Client on first visit | secret in `localStorage` under `geostumble.jazz.secret` |

The Worker account **owns** the `RoomRegistry` and every `PersonaRoom`. Browser accounts are granted `writer` role on each `PersonaRoom` (so they can push guestbook entries + set their own presence) but cannot mutate `status`.

Permissions are set at room-creation time in the seed script; no runtime ACL changes.

## 6. Files to create / modify

```
packages/shared/src/jazz-schema.ts              (new)  — schemas above
packages/shared/src/index.ts                    (mod)  — re-export schema

apps/worker/src/jazz-writer.ts                  (fill) — server-side Jazz client
apps/worker/src/persona-do.ts                   (mod)  — setStatus() calls jazz-writer

apps/web/lib/jazz.ts                            (fill) — browser Jazz provider
apps/web/app/layout.tsx                         (mod)  — wrap in <JazzProvider>
apps/web/components/Guestbook.tsx               (new)  — subscribe + post
apps/web/components/PresencePill.tsx            (new)  — heartbeat + count
apps/web/components/StatusBanner.tsx            (new)  — under-construction banner
apps/web/app/s/[id]/page.tsx                    (mod)  — mount the three components

scripts/seed-jazz-rooms.ts                      (new)  — create registry + 20 rooms
```

## 7. Implementation steps (in order)

### Step 1 — shared schema (10 min)
Write `packages/shared/src/jazz-schema.ts`. Export all classes. Add `"jazz-tools"` to `packages/shared/package.json` peer deps.

### Step 2 — Worker-side writer (20 min)
Fill `apps/worker/src/jazz-writer.ts`:

```ts
import { startWorker } from 'jazz-tools/worker';
import { PersonaRoom, RoomRegistry } from '@geostumble/shared';

let workerPromise: Promise<Awaited<ReturnType<typeof startWorker>>> | null = null;

export function getJazzWorker(env: Env) {
  workerPromise ??= startWorker({
    syncServer: env.JAZZ_SYNC_URL,     // wss://cloud.jazz.tools/sync
    accountID:  env.JAZZ_WORKER_ACCOUNT,
    accountSecret: env.JAZZ_WORKER_SECRET,
    AccountSchema: undefined,          // default account is fine
  });
  return workerPromise;
}

export async function writeStatus(env: Env, personaId: string, status: string) {
  const { worker } = await getJazzWorker(env);
  const registry = await RoomRegistry.load(env.JAZZ_REGISTRY_ID, worker, {});
  const roomId = registry?.[personaId];
  if (!roomId) return;                 // seed script didn't run; silent no-op
  const room = await PersonaRoom.load(roomId, worker, {});
  if (room) room.status = status;
}
```

DO calls `writeStatus(env, personaId, 'editing:selecting-bg')` from each `onStep` callback.

**Caveat.** Durable Objects have no persistent WebSocket across invocations; the Jazz worker client lives only for the duration of the DO instance. `blockConcurrencyWhile` + module-scoped promise gives us a single warm client per DO instance, which is good enough.

### Step 3 — Browser provider (15 min)
Fill `apps/web/lib/jazz.ts`:

```ts
'use client';
import { createJazzReactApp } from 'jazz-react';
import { PersonaRoom, RoomRegistry } from '@geostumble/shared';

export const Jazz = createJazzReactApp({
  AccountSchema: undefined,
});
export const { JazzProvider, useAccount, useCoState } = Jazz;
```

Wrap `app/layout.tsx`:

```tsx
<JazzProvider
  peer={process.env.NEXT_PUBLIC_JAZZ_PEER!}
  storage="indexedDB"
  auth="anonymous"                     // generates + persists a guest account
>
  {children}
</JazzProvider>
```

### Step 4 — Guestbook component (25 min)
`apps/web/components/Guestbook.tsx`:

```tsx
'use client';
import { useCoState } from '@/lib/jazz';
import { PersonaRoom, GuestbookEntry } from '@geostumble/shared';
import { useRegistryRoom } from '@/lib/use-registry-room';

export function Guestbook({ personaId }: { personaId: string }) {
  const roomId = useRegistryRoom(personaId);
  const room = useCoState(PersonaRoom, roomId, { guestbook: [{}] });
  if (!room?.guestbook) return <div className="retro-loading">loading…</div>;

  return (
    <div className="guestbook">
      {room.guestbook.map((e) => (
        <div key={e.id} style={{ color: e.color }}>
          <b>{e.author}</b>: {e.message}
        </div>
      ))}
      <form onSubmit={(ev) => {
        ev.preventDefault();
        const msg = new FormData(ev.currentTarget).get('m') as string;
        const entry = GuestbookEntry.create(
          { author: stumblerHandle(), message: msg, color: stumblerColor(), createdAt: new Date() },
          { owner: room._owner },
        );
        room.guestbook!.push(entry);
        (ev.target as HTMLFormElement).reset();
      }}>
        <input name="m" placeholder="leave a note..." />
        <button>sign</button>
      </form>
    </div>
  );
}
```

`stumblerHandle()` and `stumblerColor()` read/generate into `localStorage` (`geostumble.handle`, `geostumble.color`).

### Step 5 — Presence component (15 min)
`PresencePill.tsx`: on mount, `room.presence[stumblerId] = PresenceEntry.create(...)`. Every 10s, update `lastSeen`. On unmount, leave the entry (GC'd by 30s stale filter on the client).

Count = entries where `Date.now() - lastSeen < 30_000`.

### Step 6 — Status banner (10 min)
`StatusBanner.tsx`: reads `room.status` via `useCoState`. When not `"idle"`, shows `"🚧 UNDER CONSTRUCTION — {name} is {humanize(status)}…"` in an animated `<marquee>` on top of the iframe.

### Step 7 — Seed script (20 min)
`scripts/seed-jazz-rooms.ts` (runs once, pre-hackathon):

1. Boot a worker Jazz client (same account as runtime).
2. Create `RoomRegistry` CoValue; log its id → paste into `NEXT_PUBLIC_JAZZ_REGISTRY_ID` + KV.
3. For each persona in Neon: create empty `GuestbookList`, `PresenceMap`, `PersonaRoom`; set registry entry.
4. Set `PersonaRoom` group to `everyone: "writer"` so anonymous clients can write.

Idempotent: if `jazz:registry_id` in KV already exists, fetch and reuse; only seed rooms missing from the registry.

### Step 8 — Wire into result page (10 min)
Edit `apps/web/app/s/[id]/page.tsx` to render `<StatusBanner />`, `<Guestbook />`, `<PresencePill />` around the iframe.

### Step 9 — Smoke test (15 min)
- Two browser tabs on `/s/dave-001`. Post in one → appears in other within 1s.
- Presence count ticks to 2, then back to 1 after closing a tab.
- Manually hit `/admin/nudge/dave-001` → banner flips through statuses, returns to idle.

**Total time budget:** ~2h15m of a 1h Hour-3 slot. **This is over budget.** See §9.

## 8. Env vars (additions)

| Var | Where | Value |
|-----|-------|-------|
| `JAZZ_SYNC_URL` | Worker `.dev.vars` | `wss://cloud.jazz.tools/sync` |
| `JAZZ_WORKER_ACCOUNT` | Worker `.dev.vars` | from `npx jazz-run account create` |
| `JAZZ_WORKER_SECRET` | Worker `.dev.vars` | same command |
| `JAZZ_REGISTRY_ID` | Worker `.dev.vars` | from seed script output |
| `NEXT_PUBLIC_JAZZ_PEER` | Web `.env.local` | `wss://cloud.jazz.tools/sync` |
| `NEXT_PUBLIC_JAZZ_REGISTRY_ID` | Web `.env.local` | same as above |

## 9. Time-boxed fallback ladder

Given Hour 3 is only 60 minutes, pre-decide what to drop if steps run long.

| Time mark | Check | If behind |
|-----------|-------|-----------|
| +20m | Guestbook posts round-trip between two tabs | Skip presence; go straight to status banner |
| +40m | Status banner flips when Worker writes | Drop presence entirely; ship guestbook + status |
| +55m | Presence count works | Accept it; move on |
| Any failure of Worker→Jazz write | — | **Fallback:** Worker exposes `GET /p/:id/stream` SSE; `StatusBanner` switches to `EventSource`. Guestbook stays on Jazz. (This matches §17 risk row in the spec.) |

## 10. Risks specific to this integration

| Risk | Detection | Mitigation |
|------|-----------|------------|
| Worker account writes block DO event loop | DO alarm cycle slows | Fire-and-forget `writeStatus()` (no `await` on hot path, catch + log) |
| Stumbler floods guestbook | Visible as spam on demo | Hardcoded client-side 3s debounce + 140-char cap; no server enforcement in v1 |
| Jazz Cloud downtime mid-demo | Guestbook + status both dead | Switch `/s/[id]` to SSE-only mode via `?nojazz=1` query flag; pre-wire before demo |
| `jazz-tools` bundle too heavy for Worker | Wrangler deploy >1MB | Lazy-import inside `writeStatus`; use `nodejs_compat_populate_process_env` only if needed |
| Anonymous accounts lose `localStorage` | Stumblers appear as new person each visit | Accepted — this is a hackathon, not a product |

## 11. Done criteria (v1 shipped)

- [ ] Two tabs on same persona page show each other's guestbook entries in <1s.
- [ ] Presence pill shows correct count within 10s of tab open/close.
- [ ] `POST /admin/nudge/:id` causes banner to show live status transitions on all open viewers.
- [ ] Closing Jazz sync (simulated by blocking `cloud.jazz.tools`) degrades gracefully — page still serves, UI shows "disconnected" hint, no crash.
- [ ] Seed script is idempotent; re-running doesn't duplicate rooms.

## 12. V2 candidates (explicitly out of scope)

- Presence cursors (add `cursor` field back to `PresenceEntry`).
- Per-stumbler inventory ("saved" pages) as a user-owned `CoList`.
- Inter-persona webring edges as shared `CoMap` across rooms.
- Reaction emoji on guestbook entries (`CoFeed`).
- Moderation group with delete permissions.
