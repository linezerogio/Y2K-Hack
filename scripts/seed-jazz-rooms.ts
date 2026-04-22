/**
 * Seed Jazz CoValues for each persona in Neon. Idempotent.
 *
 * Creates one RoomRegistry CoValue and one PersonaRoom per persona.
 * Guestbook + presence are child CoValues under an `everyone: writer`
 * group; room (with status) stays owned by the worker account so
 * anonymous clients can't overwrite status.
 *
 * Run:
 *   node --experimental-strip-types scripts/seed-jazz-rooms.ts
 *
 * Reads JAZZ_WORKER_ACCOUNT, JAZZ_WORKER_SECRET, JAZZ_SYNC_URL,
 * NEON_DATABASE_URL, and (optionally) JAZZ_REGISTRY_ID from env,
 * with fallback to apps/worker/.dev.vars.
 *
 * First run prints the RoomRegistry id; paste into .dev.vars
 * JAZZ_REGISTRY_ID and push to KV so the Worker can resolve it.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Group } from 'jazz-tools';
import { startWorker } from 'jazz-tools/worker';
import {
  GuestbookList,
  PersonaRoom,
  PresenceMap,
  RoomRegistry,
} from '../packages/shared/src/jazz-schema.ts';

function loadDevVars(): Record<string, string> {
  const devVarsPath = resolve(import.meta.dirname ?? '.', '../apps/worker/.dev.vars');
  try {
    const text = readFileSync(devVarsPath, 'utf8');
    const out: Record<string, string> = {};
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) out[m[1]!] = m[2]!;
    }
    return out;
  } catch {
    return {};
  }
}

const devVars = loadDevVars();
const env = (k: string): string | undefined => process.env[k] ?? devVars[k];

const JAZZ_WORKER_ACCOUNT = env('JAZZ_WORKER_ACCOUNT');
const JAZZ_WORKER_SECRET = env('JAZZ_WORKER_SECRET');
const JAZZ_SYNC_URL = env('JAZZ_SYNC_URL') ?? 'wss://cloud.jazz.tools/sync';
const JAZZ_REGISTRY_ID = env('JAZZ_REGISTRY_ID');
const NEON_DATABASE_URL = env('NEON_DATABASE_URL');

if (!JAZZ_WORKER_ACCOUNT || !JAZZ_WORKER_SECRET) {
  console.error('JAZZ_WORKER_ACCOUNT + JAZZ_WORKER_SECRET required (env or .dev.vars)');
  process.exit(1);
}
if (!NEON_DATABASE_URL) {
  console.error('NEON_DATABASE_URL required (env or .dev.vars)');
  process.exit(1);
}

console.log(`sync server: ${JAZZ_SYNC_URL}`);
console.log(`neon host:   ${new URL(NEON_DATABASE_URL).host}`);

const sql = neon(NEON_DATABASE_URL);
const rows = (await sql`SELECT id FROM personas ORDER BY id`) as unknown as Array<{ id: string }>;
const personaIds = rows.map((r) => r.id);
console.log(`personas:    ${personaIds.length} (${personaIds.join(', ')})`);

const { worker, shutdownWorker } = await startWorker({
  accountID: JAZZ_WORKER_ACCOUNT as `co_${string}`,
  accountSecret: JAZZ_WORKER_SECRET as `sealerSecret_${string}/signerSecret_${string}`,
  syncServer: JAZZ_SYNC_URL,
});

try {
  let registry: Awaited<ReturnType<typeof RoomRegistry.load>>;
  if (JAZZ_REGISTRY_ID) {
    console.log(`\nloading existing registry ${JAZZ_REGISTRY_ID}`);
    registry = await RoomRegistry.load(JAZZ_REGISTRY_ID as `co_${string}`, { loadAs: worker });
    if (!registry) {
      console.error('registry id present but load failed; aborting');
      process.exit(1);
    }
  } else {
    console.log('\nno JAZZ_REGISTRY_ID set — creating new registry');
    registry = RoomRegistry.create({}, worker);
  }

  const registryId = registry.$jazz.id;

  let created = 0;
  let skipped = 0;

  for (const personaId of personaIds) {
    if (registry[personaId]) {
      skipped++;
      console.log(`  skip  ${personaId} (already in registry)`);
      continue;
    }

    const publicGroup = Group.create({ owner: worker });
    publicGroup.makePublic('writer');

    const guestbook = GuestbookList.create([], { owner: publicGroup });
    const presence = PresenceMap.create({}, { owner: publicGroup });

    const room = PersonaRoom.create(
      { personaId, status: 'idle', guestbook, presence },
      { owner: worker },
    );

    registry.$jazz.set(personaId, room);
    created++;
    console.log(`  seed  ${personaId} → room ${room.$jazz.id}`);
  }

  console.log('\nwaiting for sync...');
  await registry.$jazz.waitForSync();

  console.log(`\n✓ seeded ${created} new, ${skipped} already present`);
  console.log(`\nRoomRegistry ID: ${registryId}`);

  if (!JAZZ_REGISTRY_ID) {
    console.log('\nNext steps:');
    console.log(`  1) Add to apps/worker/.dev.vars:`);
    console.log(`     JAZZ_REGISTRY_ID=${registryId}`);
    console.log(`  2) Add to apps/web/.env.local (when scaffolded):`);
    console.log(`     NEXT_PUBLIC_JAZZ_REGISTRY_ID=${registryId}`);
    console.log(`  3) Push to production KV (Worker resolves from here):`);
    console.log(`     cd apps/worker && npx wrangler kv key put --binding=PAGES \\`);
    console.log(`       jazz:registry_id ${registryId} --remote`);
  }
} finally {
  await shutdownWorker();
}

process.exit(0);
