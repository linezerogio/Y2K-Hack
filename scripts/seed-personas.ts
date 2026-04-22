/**
 * Seed the personas table from scripts/personas.json. Idempotent.
 *
 * Run:
 *   node --experimental-strip-types scripts/seed-personas.ts
 *
 * Reads NEON_DATABASE_URL from env, or falls back to apps/worker/.dev.vars.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface Persona {
  id: string;
  name: string;
  age: number;
  archetype: string;
  obsessions: string[];
  palette: Record<string, string>;
  era: string;
  vibe_notes: string;
}

function loadDatabaseUrl(): string {
  if (process.env.NEON_DATABASE_URL) return process.env.NEON_DATABASE_URL;
  const devVarsPath = resolve(import.meta.dirname ?? '.', '../apps/worker/.dev.vars');
  try {
    const text = readFileSync(devVarsPath, 'utf8');
    const match = text.match(/^NEON_DATABASE_URL=(.+)$/m);
    if (match) return match[1];
  } catch {
    /* fall through */
  }
  console.error('NEON_DATABASE_URL not found in env or apps/worker/.dev.vars');
  process.exit(1);
}

const url = loadDatabaseUrl();
const host = new URL(url).host;
console.log(`seeding → ${host}`);

const personasPath = resolve(import.meta.dirname ?? '.', 'personas.json');
const personas: Persona[] = JSON.parse(readFileSync(personasPath, 'utf8'));

console.log(`loaded ${personas.length} personas from personas.json`);

const sql = neon(url);

let upserts = 0;
for (const p of personas) {
  await sql`
    INSERT INTO personas (id, name, age, archetype, obsessions, palette, era, vibe_notes)
    VALUES (${p.id}, ${p.name}, ${p.age}, ${p.archetype}, ${p.obsessions},
            ${JSON.stringify(p.palette)}::jsonb, ${p.era}, ${p.vibe_notes})
    ON CONFLICT (id) DO UPDATE SET
      name       = EXCLUDED.name,
      age        = EXCLUDED.age,
      archetype  = EXCLUDED.archetype,
      obsessions = EXCLUDED.obsessions,
      palette    = EXCLUDED.palette,
      era        = EXCLUDED.era,
      vibe_notes = EXCLUDED.vibe_notes
  `;
  upserts++;
  process.stdout.write('.');
}

const countRows = (await sql`SELECT COUNT(*)::int AS count FROM personas`) as Array<{ count: number }>;
console.log(`\nupserted ${upserts} personas; table now contains ${countRows[0].count}`);
