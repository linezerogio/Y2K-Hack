-- Geostumble v1 schema
-- Apply with: node apps/worker/scripts/apply-schema.mjs
-- or: psql $NEON_DATABASE_URL -f apps/worker/db/schema.sql
--
-- Source of truth: Implementation/Database/v1-proposal.md §2

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

-- webring_edges: V2 placeholder; table exists so seeds can populate
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
