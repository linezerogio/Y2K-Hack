import { neon } from '@neondatabase/serverless';

export interface Env {
  NEON_DATABASE_URL: string;
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  archetype: string;
  obsessions: string[];
  palette: Record<string, string>;
  era: string;
  vibe_notes: string;
  created_at: string;
}

export interface PersonaMeta {
  personaId: string;
  name: string;
  era: string;
  version: number;
  muxPlaybackId: string | null;
}

export interface SnapshotInput {
  personaId: string;
  version: number;
  htmlKvKey: string;
  muxPlaybackId: string | null;
  sandboxLog: string;
  tokenCostUsd: number;
}

export type CostKind = 'gemini' | 'mux' | 'sandbox' | 'anthropic';

const QUERY_TIMEOUT_MS = 3000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`neon: ${label} exceeded ${ms}ms`)), ms),
    ),
  ]);
}

export const sql = (env: Env) => neon(env.NEON_DATABASE_URL);

/** Load a single persona by id. Returns null if not found. */
export async function loadPersonaFromNeon(env: Env, id: string): Promise<Persona | null> {
  const rows = await withTimeout(
    sql(env)`SELECT * FROM personas WHERE id = ${id} LIMIT 1` as unknown as Promise<Persona[]>,
    QUERY_TIMEOUT_MS,
    'loadPersonaFromNeon',
  );
  return rows[0] ?? null;
}

/** Latest version number for a persona's page snapshots. Returns 0 if none. */
export async function getLatestVersion(env: Env, personaId: string): Promise<number> {
  const rows = await withTimeout(
    sql(env)`
      SELECT COALESCE(MAX(version), 0) AS v
      FROM page_snapshots WHERE persona_id = ${personaId}
    ` as unknown as Promise<Array<{ v: number | string }>>,
    QUERY_TIMEOUT_MS,
    'getLatestVersion',
  );
  return Number(rows[0].v);
}

/** Idempotent insert — safe on retry via UNIQUE (persona_id, version). */
export async function recordSnapshot(env: Env, s: SnapshotInput): Promise<void> {
  await withTimeout(
    sql(env)`
      INSERT INTO page_snapshots
        (persona_id, version, html_kv_key, mux_playback_id, sandbox_log, token_cost_usd)
      VALUES
        (${s.personaId}, ${s.version}, ${s.htmlKvKey}, ${s.muxPlaybackId},
         ${s.sandboxLog}, ${s.tokenCostUsd})
      ON CONFLICT (persona_id, version) DO NOTHING
    `,
    QUERY_TIMEOUT_MS,
    'recordSnapshot',
  );
}

/** Append-only cost ledger entry. Consumed by totalSpendUsd + /admin/cost. */
export async function logCost(
  env: Env,
  personaId: string | null,
  kind: CostKind,
  amountUsd: number,
): Promise<void> {
  await withTimeout(
    sql(env)`
      INSERT INTO cost_ledger (persona_id, kind, amount_usd)
      VALUES (${personaId}, ${kind}, ${amountUsd})
    `,
    QUERY_TIMEOUT_MS,
    'logCost',
  );
}

/** Sum of all cost_ledger entries in USD. Drives costCapHit() kill-switch. */
export async function totalSpendUsd(env: Env): Promise<number> {
  const rows = await withTimeout(
    sql(env)`
      SELECT COALESCE(SUM(amount_usd), 0) AS total FROM cost_ledger
    ` as unknown as Promise<Array<{ total: number | string }>>,
    QUERY_TIMEOUT_MS,
    'totalSpendUsd',
  );
  return Number(rows[0].total);
}

/**
 * Persona identity + latest snapshot version + mux playback id, in one round-trip.
 * Backs the Worker's GET /p/:id/meta route. Status is NOT returned — live status
 * lives in Jazz (PersonaRoom.status); callers rebind after hydration.
 */
export async function getPersonaMeta(env: Env, id: string): Promise<PersonaMeta | null> {
  const rows = await withTimeout(
    sql(env)`
      SELECT p.id                     AS "personaId",
             p.name                   AS name,
             p.era                    AS era,
             COALESCE(s.version, 0)   AS version,
             s.mux_playback_id        AS "muxPlaybackId"
      FROM personas p
      LEFT JOIN LATERAL (
        SELECT version, mux_playback_id
        FROM page_snapshots
        WHERE persona_id = p.id
        ORDER BY version DESC
        LIMIT 1
      ) s ON TRUE
      WHERE p.id = ${id}
    ` as unknown as Promise<
      Array<{
        personaId: string;
        name: string;
        era: string;
        version: number | string;
        muxPlaybackId: string | null;
      }>
    >,
    QUERY_TIMEOUT_MS,
    'getPersonaMeta',
  );
  const r = rows[0];
  if (!r) return null;
  return {
    personaId: r.personaId,
    name: r.name,
    era: r.era,
    version: Number(r.version),
    muxPlaybackId: r.muxPlaybackId,
  };
}
