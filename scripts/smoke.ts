/**
 * End-to-end smoke test against Neon.
 *
 *   1. Insert a cost_ledger row
 *   2. Read total spend; confirm the inserted amount shows up
 *   3. Read getPersonaMeta for dave-001 (depends on seed-personas having run)
 *   4. Delete the test row
 *
 * Exits 0 on success, non-zero on any assertion failure.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDatabaseUrl(): string {
  if (process.env.NEON_DATABASE_URL) return process.env.NEON_DATABASE_URL;
  const devVarsPath = resolve(import.meta.dirname ?? '.', '../apps/worker/.dev.vars');
  const text = readFileSync(devVarsPath, 'utf8');
  const match = text.match(/^NEON_DATABASE_URL=(.+)$/m);
  if (!match) throw new Error('NEON_DATABASE_URL not found');
  return match[1];
}

const sql = neon(loadDatabaseUrl());
const TEST_AMOUNT = 0.0001;
const TEST_KIND = 'gemini';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
}

const t0 = Date.now();

// 1. Capture baseline spend
const beforeRows = (await sql`
  SELECT COALESCE(SUM(amount_usd), 0)::float8 AS total FROM cost_ledger
`) as Array<{ total: number }>;
const before = Number(beforeRows[0].total);

// 2. Insert test row
const insertedRows = (await sql`
  INSERT INTO cost_ledger (persona_id, kind, amount_usd)
  VALUES (NULL, ${TEST_KIND}, ${TEST_AMOUNT})
  RETURNING id
`) as Array<{ id: number | string }>;
const insertedId = insertedRows[0].id;
assert(insertedId != null, 'insert returned no id');

// 3. Read total spend and confirm delta
const afterRows = (await sql`
  SELECT COALESCE(SUM(amount_usd), 0)::float8 AS total FROM cost_ledger
`) as Array<{ total: number }>;
const after = Number(afterRows[0].total);
const delta = Number((after - before).toFixed(4));
assert(
  delta === TEST_AMOUNT,
  `expected delta=${TEST_AMOUNT} but got delta=${delta} (before=${before}, after=${after})`,
);

// 4. getPersonaMeta round-trip for dave-001 (needs seed to have run)
const metaRows = (await sql`
  SELECT p.id                   AS "personaId",
         p.name                 AS name,
         p.era                  AS era,
         COALESCE(s.version, 0) AS version,
         s.mux_playback_id      AS "muxPlaybackId"
  FROM personas p
  LEFT JOIN LATERAL (
    SELECT version, mux_playback_id
    FROM page_snapshots
    WHERE persona_id = p.id
    ORDER BY version DESC LIMIT 1
  ) s ON TRUE
  WHERE p.id = 'dave-001'
`) as Array<{ personaId: string; name: string; era: string; version: number; muxPlaybackId: string | null }>;
assert(metaRows.length === 1, 'dave-001 not found — did seed run?');
assert(metaRows[0].name === 'Dave', `expected Dave, got ${metaRows[0].name}`);
assert(Number(metaRows[0].version) === 0, 'expected version 0 (no snapshots yet)');

// 5. Cleanup: delete the test row
await sql`DELETE FROM cost_ledger WHERE id = ${insertedId}`;

const cleanupRows = (await sql`
  SELECT COALESCE(SUM(amount_usd), 0)::float8 AS total FROM cost_ledger
`) as Array<{ total: number }>;
assert(
  Number(cleanupRows[0].total) === before,
  'post-cleanup total does not match baseline',
);

console.log(`OK in ${Date.now() - t0}ms`);
console.log(`  cost_ledger insert/read/delete: pass`);
console.log(`  getPersonaMeta(dave-001): ${metaRows[0].name} / ${metaRows[0].era} / v${metaRows[0].version}`);
