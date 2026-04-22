# Neon Database — Implementation Tracker

**Proposal:** [v1-proposal.md](./v1-proposal.md)
**Spec:** [../../project.md](../../project.md)
**Event:** Frontier Tech Week Y2K Hackathon (6 hours) — 2026-04-22
**Legend:** `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 0 — Night-before (project, schema, seeds)

Maps to [project.md §16 "Night before"](../../project.md#L587) and [proposal §1](./v1-proposal.md). Worker cannot boot without this phase green.

### 0.1 Neon project
- [x] Neon project created — `withered-wildflower-95411406`
- [x] Region `aws-us-east-1` confirmed
- [x] Working on `main` branch (no `dev` branch for v1)
- [ ] `main` autosuspend **off** (critical — avoid cold-start mid-demo)
- [ ] Pooled connection string captured (`-pooler` suffix)

### 0.2 Secrets
- [x] `NEON_DATABASE_URL` (pooled, `main`) → `apps/worker/.dev.vars`
- [ ] `wrangler secret put NEON_DATABASE_URL` for deployed Worker
- [x] Confirmed **no** `NEON_*` var in Vercel env (Worker is sole DB client — [proposal §1](./v1-proposal.md))

### 0.3 Schema
- [x] `apps/worker/db/schema.sql` committed (4 tables + indexes + constraints, [proposal §2](./v1-proposal.md))
- [x] Applied to `main` via `@neondatabase/serverless` (no `psql` available locally)
- [x] Verified: `pg_tables` lists `personas`, `page_snapshots`, `webring_edges`, `cost_ledger`
- [x] Verified: schema file contains `UNIQUE (persona_id, version)` on `page_snapshots`
- [x] Verified: schema file contains `CHECK (kind IN ...)` on `cost_ledger`

### 0.4 Client library (`apps/worker/src/neon.ts`)
- [x] `@neondatabase/serverless` installed in `apps/worker` + repo root
- [x] `apps/worker/src/neon.ts` committed with 6 functions:
  - [x] `loadPersonaFromNeon(env, id)`
  - [x] `getLatestVersion(env, personaId)`
  - [x] `recordSnapshot(env, s)` — with `ON CONFLICT DO NOTHING`
  - [x] `logCost(env, personaId, kind, amountUsd)`
  - [x] `totalSpendUsd(env)`
  - [x] `getPersonaMeta(env, id)` — JOIN + LATERAL ([proposal §3](./v1-proposal.md))
- [x] Every call wrapped in `Promise.race` against 3s timeout (`withTimeout` helper)
- [x] Lint/review: only `@neondatabase/serverless` imported — no `pg` / `node-postgres`
- [x] `npx tsc --noEmit` clean

### 0.5 Seed script (`scripts/seed-personas.ts`)
- [x] `scripts/personas.json` committed with 5 entries (scope reduced from 20 for hackathon; Dave + Becky + Tyler cover the demo script, Linda + Harold add demographic/era variety)
- [x] `scripts/seed-personas.ts` committed — idempotent `ON CONFLICT DO UPDATE`
- [x] Script prints target host before running
- [x] Run: `npm run seed` → `upserted 5 personas; table now contains 5`
- [x] Re-run confirms idempotence (still 5 rows)
- [x] **Does NOT** create Jazz rooms — [Jazz §7 step 7](../Jazz/v1-proposal.md) handles that
- [~] `--confirm-prod` flag dropped (single-branch v1 — user confirmed working on `main` only)

### 0.6 Smoke test (`scripts/smoke.ts`)
- [x] Inserts one row into `cost_ledger` (`kind='gemini'`, `amount_usd=0.0001`)
- [x] Reads total spend via SUM; confirms delta matches
- [x] Round-trips `getPersonaMeta('dave-001')` → returns `{ name: 'Dave', era: '1999-Q3', version: 0, muxPlaybackId: null }`
- [x] Deletes the test row; confirms total returns to baseline
- [x] Exits 0 on success — verified, 710–780ms end-to-end
- [x] Run command: `npm run smoke`

### 0.7 Prewarm query
- [ ] `SELECT 1` issued at 09:45 against `main` (prevents first-hit latency spike) — part of [Cloudflare §0.5 prewarm](../Cloudflare/v1-tracker.md)

---

## Phase 1 — Hour 0 (09:30–10:30): Worker wiring

Worker consumes `neon.ts`; no new DB work, but verify the integration.

- [ ] `PersonaDO.constructor` calls `loadPersonaFromNeon` under `blockConcurrencyWhile`
- [ ] Persona row cached in DO storage on first call; second `fetch()` does not hit DB
- [ ] `wrangler tail` shows exactly one Neon query per DO cold start

---

## Phase 2 — Hour 1 (10:30–11:30): First snapshot write

Maps to [§16 Hour 1](../../project.md#L607). Goal: Dave's `page_snapshots` v1 row exists.

- [ ] `runTinkerCycle` calls `getLatestVersion` before computing `version = n + 1`
- [ ] `recordSnapshot` writes a row with `mux_playback_id = NULL` (Mux not wired yet)
- [ ] Verified: `SELECT * FROM page_snapshots WHERE persona_id = 'dave-001'` returns exactly one row, `version = 1`
- [ ] Duplicate-nudge test: trigger `/admin/nudge/dave-001` twice rapidly; only one row per version exists (UNIQUE + ON CONFLICT DO NOTHING works)

---

## Phase 3 — Hour 2 (11:30–12:30): Fleet

Maps to [§16 Hour 2](../../project.md#L616).

- [ ] All 20 DOs load their persona row without error
- [ ] No Neon-side rate limit warnings in `wrangler tail`
- [ ] Peak observed QPS < 5 (sanity check vs [proposal §5](./v1-proposal.md) projection)

---

## Phase 4 — Hour 4 (13:30–14:30): Mux + meta

Maps to [§16 Hour 4](../../project.md#L632). Mux writes into `page_snapshots`; Frontend reads via `/p/:id/meta`.

- [ ] `recordSnapshot` called post-Mux with non-null `mux_playback_id`
- [ ] `logCost(personaId, 'mux', amount)` fires on each successful upload
- [ ] `getPersonaMeta('dave-001')` returns `{ personaId, name, era, version, muxPlaybackId }` — `muxPlaybackId` non-null after first Mux success
- [ ] Frontend `/s/{id}` renders `<RealPlayerClip>` using `muxPlaybackId` from Worker `/p/:id/meta` (not direct Neon — see [Mux §5](../Mux/v1/IMPLEMENTATION-PROPOSAL.md))

---

## Phase 5 — Hour 5 (14:30–15:30): Kill-switch drill

Maps to [§16 Hour 5](../../project.md#L641). `cost_ledger` is the kill-switch input.

- [ ] `totalSpendUsd` returns realistic number after prewarm (sanity: 10 cycles × ~$0.02 ≈ $0.20)
- [ ] Cost-cap forced-hit: temporarily set `COST_CAP_USD=0.01`, verify next cycle early-returns
- [ ] Restore `COST_CAP_USD=50` before demo
- [ ] `/admin/cost` endpoint returns same value as direct `SELECT SUM(amount_usd)` query

---

## Phase 6 — Hour 6 (15:30–16:00): Ship

- [ ] No Neon error logs in final 5 min of `wrangler tail`
- [ ] `main` branch still has autosuspend disabled
- [ ] Connection string rotated plan noted for post-event

---

## Post-event

Maps to [project.md §18](../../project.md#L667).

- [ ] Rotate `NEON_DATABASE_URL` (hackathons leak secrets)
- [ ] Export `personas` + `page_snapshots` as SQL dump for archive
- [ ] Snapshot the `main` Neon branch (takes ~1s, free)
- [ ] Consider truncating `cost_ledger` after archiving (unbounded growth, not a v1 concern but tidy post-event)

---

## Risk register (from [proposal §7](./v1-proposal.md))

- [ ] **Neon cold start on first DO boot** — mitigated by autosuspend-off on `main` + 09:45 `SELECT 1` prewarm
- [ ] **Accidental `pg` import** — guarded by code review; re-check at end of Hour 0
- [ ] **Seed script against `main`** — guarded by `--confirm-prod` flag
- [ ] **Snapshot insert race** — guarded by `UNIQUE (persona_id, version)` + DO single-threading invariant ([proposal §7](./v1-proposal.md)): *all* `page_snapshots` writes must go through the per-persona DO
- [ ] **`cost_ledger` unbounded growth** — accepted for demo; post-event truncate

---

## Deliverables checklist (mirrors [proposal §8](./v1-proposal.md))

- [x] Neon project `withered-wildflower-95411406` created, `main` branch
- [ ] `main` autosuspend off (still pending user confirmation in dashboard)
- [x] `apps/worker/db/schema.sql` committed and applied
- [x] `apps/worker/src/neon.ts` committed with 6 functions
- [x] `scripts/seed-personas.ts` + `scripts/personas.json` (20 entries) committed and run
- [ ] `NEON_DATABASE_URL` set in Wrangler secrets for deployed Worker
- [x] `scripts/smoke.ts` inserts+reads `cost_ledger`, exits 0
- [ ] One dry-run tinker cycle writes exactly one `page_snapshots` row (blocked on Phase 2)
