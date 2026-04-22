# Neon Database — V1 Implementation Proposal

**Scope:** Geostumble hackathon, 6hr build. Neon is the relational backbone: personas (seed data), page_snapshots (every agent-generated page version), webring_edges (V2), cost_ledger (kill-switch input).

**Non-goals:** migrations tooling, ORM, RLS, auth. This is a single-tenant system with one writer (Cloudflare Worker + DO) and one read path (`/admin/cost`, seed loader on DO cold start).

---

## 1. Neon project setup (night-before)

1. Create Neon project `geostumble`, region `aws-us-east-1` (closest to Cloudflare IAD).
2. Create branches:
   - `main` — production (used by demo)
   - `dev` — local development + smoke tests
3. Grab pooled connection string from dashboard. Use the **pooler** (`-pooler` suffix) endpoint — DOs are short-lived and benefit from PgBouncer.
4. Enable **autosuspend: 5 min** on `dev`, **never** on `main` (avoid cold start mid-demo; see §7 risk).
5. Store secrets:
   - `NEON_DATABASE_URL` → Wrangler `.dev.vars` + `wrangler secret put`
   - No secret needed on Vercel — the Worker is the only DB client.

---

## 2. Schema (v1)

File: `apps/worker/db/schema.sql` — applied once via `psql $NEON_DATABASE_URL -f schema.sql`.

```sql
-- personas: seed, read-only at runtime
CREATE TABLE IF NOT EXISTS personas (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  age         INT  NOT NULL,
  archetype   TEXT NOT NULL,
  obsessions  TEXT[] NOT NULL,
  palette     JSONB NOT NULL,
  era         TEXT NOT NULL,
  vibe_notes  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- page_snapshots: one row per successful tinker cycle
CREATE TABLE IF NOT EXISTS page_snapshots (
  id               BIGSERIAL PRIMARY KEY,
  persona_id       TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  version          INT  NOT NULL,
  html_kv_key      TEXT NOT NULL,
  mux_playback_id  TEXT,
  sandbox_log      TEXT,
  token_cost_usd   NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (persona_id, version)
);
CREATE INDEX IF NOT EXISTS page_snapshots_persona_version_idx
  ON page_snapshots (persona_id, version DESC);

-- webring_edges: V2, but table exists so seeds can populate
CREATE TABLE IF NOT EXISTS webring_edges (
  src_persona TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  dst_persona TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (src_persona, dst_persona),
  CHECK (src_persona <> dst_persona)
);

-- cost_ledger: append-only, summed by /admin/cost and costCapHit()
CREATE TABLE IF NOT EXISTS cost_ledger (
  id         BIGSERIAL PRIMARY KEY,
  persona_id TEXT REFERENCES personas(id) ON DELETE SET NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('gemini','mux','sandbox','anthropic')),
  amount_usd NUMERIC(10,4) NOT NULL,
  ts         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cost_ledger_ts_idx ON cost_ledger (ts DESC);
```

**Deltas from spec (§7):**
- Added `UNIQUE (persona_id, version)` — prevents duplicate writes from a retried tinker cycle.
- Added `ON DELETE CASCADE` on FK — cleanup friendliness.
- Added `CHECK` on `cost_ledger.kind` — cheap typo guard.
- Added `CHECK (src <> dst)` on webring — no self-loops.

---

## 3. Client library — `apps/worker/src/neon.ts`

**Driver choice:** `@neondatabase/serverless` (HTTP fetch-based, no TCP). Critical for Workers — `pg` will not work in the Workers runtime.

```ts
import { neon } from '@neondatabase/serverless';

export const sql = (env: Env) => neon(env.NEON_DATABASE_URL);

export async function loadPersonaFromNeon(env: Env, id: string): Promise<Persona | null> {
  const rows = await sql(env)`SELECT * FROM personas WHERE id = ${id} LIMIT 1`;
  return rows[0] as Persona ?? null;
}

export async function getLatestVersion(env: Env, personaId: string): Promise<number> {
  const rows = await sql(env)`
    SELECT COALESCE(MAX(version), 0) AS v
    FROM page_snapshots WHERE persona_id = ${personaId}
  `;
  return Number(rows[0].v);
}

export async function recordSnapshot(env: Env, s: SnapshotInput): Promise<void> {
  await sql(env)`
    INSERT INTO page_snapshots
      (persona_id, version, html_kv_key, mux_playback_id, sandbox_log, token_cost_usd)
    VALUES
      (${s.personaId}, ${s.version}, ${s.htmlKvKey}, ${s.muxPlaybackId},
       ${s.sandboxLog}, ${s.tokenCostUsd})
    ON CONFLICT (persona_id, version) DO NOTHING
  `;
}

export async function logCost(env: Env, personaId: string | null, kind: CostKind, amountUsd: number) {
  await sql(env)`
    INSERT INTO cost_ledger (persona_id, kind, amount_usd)
    VALUES (${personaId}, ${kind}, ${amountUsd})
  `;
}

export async function totalSpendUsd(env: Env): Promise<number> {
  const rows = await sql(env)`SELECT COALESCE(SUM(amount_usd), 0) AS total FROM cost_ledger`;
  return Number(rows[0].total);
}

export async function getPersonaMeta(env: Env, id: string): Promise<PersonaMeta | null> {
  const rows = await sql(env)`
    SELECT p.id          AS "personaId",
           p.name,
           p.era,
           COALESCE(s.version, 0)        AS version,
           s.mux_playback_id             AS "muxPlaybackId"
    FROM personas p
    LEFT JOIN LATERAL (
      SELECT version, mux_playback_id
      FROM page_snapshots
      WHERE persona_id = p.id
      ORDER BY version DESC
      LIMIT 1
    ) s ON TRUE
    WHERE p.id = ${id}
  `;
  if (!rows[0]) return null;
  return { ...rows[0], version: Number(rows[0].version) } as PersonaMeta;
}
```

All query call sites in `persona-do.ts`, `coding-agent.ts`, `/admin/cost`, and `/p/:id/meta` go through this module. `getPersonaMeta` serves the Cloudflare `/p/:id/meta` route ([Cloudflare §1](../Cloudflare/v1-proposal.md)) and the Frontend `getLatestSnapshot` helper ([Frontend §5](../Frontend/v1-proposal.md)) in one round-trip. `status` is not returned — callers rebind to Jazz `PersonaRoom.status` for live values.

---

## 4. Seeding — `scripts/seed-personas.ts`

- Reads `scripts/personas.json` (20 entries, shape matches §11 of spec).
- Uses `@neondatabase/serverless` over Node (same driver — works in both Workers and Node).
- Upsert so the script is idempotent across re-runs:

```ts
for (const p of personas) {
  await sql`
    INSERT INTO personas (id, name, age, archetype, obsessions, palette, era, vibe_notes)
    VALUES (${p.id}, ${p.name}, ${p.age}, ${p.archetype}, ${p.obsessions},
            ${p.palette}, ${p.era}, ${p.vibe_notes})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, age = EXCLUDED.age, archetype = EXCLUDED.archetype,
      obsessions = EXCLUDED.obsessions, palette = EXCLUDED.palette,
      era = EXCLUDED.era, vibe_notes = EXCLUDED.vibe_notes
  `;
}
```

Run: `NEON_DATABASE_URL=... tsx scripts/seed-personas.ts`. Ship before hour 0.

> **Scope:** this script seeds Neon only. Jazz `RoomRegistry` + per-persona `PersonaRoom` CoValues are created by a separate `scripts/seed-jazz-rooms.ts` ([Jazz §7 step 7](../Jazz/v1-proposal.md)), which runs *after* personas exist in Neon (it reads the persona list to know what rooms to create).

---

## 5. Access patterns & performance

| Path | Query | Frequency | Notes |
|------|-------|-----------|-------|
| DO cold start | `SELECT * FROM personas WHERE id = $1` | Once per DO per region | Cached in DO storage after first load — second call never hits DB |
| After tinker cycle | `SELECT MAX(version)` + `INSERT page_snapshots` | ~once/persona/5min | Index covers MAX; insert trivial |
| `/admin/cost` | `SELECT SUM(amount_usd) FROM cost_ledger` | Admin poll, ~1/s during demo | Cache 2s in-memory in Worker |
| `costCapHit()` | Same as above | Start of every tinker cycle | Same cache; worst case 20 queries/min |

**Projected peak QPS:** < 5. Free-tier Neon is overkill for this load.

---

## 6. Connection & timeout posture

- Use `neon()` (HTTP), not `neonConfig.poolQueryViaFetch` + `Pool` — tinker cycles do 1–2 queries, no transactions needed.
- No explicit transactions in v1. If webring insertion needs atomicity later, use `sql.transaction([...])` (supported by the serverless driver).
- **Timeouts:** wrap every call in `Promise.race` against a 3s timeout; Neon cold starts on `dev` branch can exceed 1s. On `main` with autosuspend off, expect <100ms.

---

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Neon cold start on first DO boot delays first stumble | `main` branch autosuspend disabled; prewarm script issues a `SELECT 1` at 09:45 |
| `pg` driver imported accidentally → Worker deploy fails | Lint rule / code review; `neon.ts` is the only DB module |
| Seed script run against `main` instead of `dev` | Seed script prints target host and requires `--confirm-prod` flag for `*.neon.tech` URLs without `dev-` prefix |
| Snapshot insert races when two alarms overlap | `UNIQUE (persona_id, version)` + `ON CONFLICT DO NOTHING`; version is computed as `MAX+1` under DO concurrency lock (DO is single-threaded, so this is safe per-persona). **Invariant:** all `page_snapshots` writes must go through the per-persona DO — no out-of-band inserts from cron, replay scripts, or admin tools, or the `MAX+1` read-then-write becomes racy |
| Cost ledger grows unbounded | Not a concern for 6hr demo; post-event cleanup per §18 |

---

## 8. Deliverables checklist

- [ ] Neon project + `main` and `dev` branches created, autosuspend configured
- [ ] `apps/worker/db/schema.sql` committed
- [ ] `apps/worker/src/neon.ts` committed with 6 functions above (`loadPersonaFromNeon`, `getLatestVersion`, `recordSnapshot`, `logCost`, `totalSpendUsd`, `getPersonaMeta`)
- [ ] `scripts/seed-personas.ts` + `scripts/personas.json` (20 entries) committed
- [ ] `NEON_DATABASE_URL` set in Wrangler secrets for deployed Worker
- [ ] Smoke test: `scripts/smoke.ts` inserts+reads a row in `cost_ledger`, exits 0
- [ ] One dry-run of full tinker cycle writes exactly one `page_snapshots` row

---

## 9. Explicitly out of scope for v1

- Prisma / Drizzle / any ORM — raw tagged templates are faster to ship and match the spec's ~150 LOC budget.
- Read replicas, connection pooling tuning.
- Full-text search on personas.
- Analytics tables (`stumbles`, `guestbook_archive`) — Jazz holds those live; archive post-event if useful.
- Webring edge generation logic (V2).
