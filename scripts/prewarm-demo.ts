/**
 * Prewarm all personas by nudging each one once. Ensures every persona
 * has at least a v1 page in KV + a `ready:{id}` sentinel before the
 * demo starts. Respects the Worker's MAX_CONCURRENT_SANDBOXES cap by
 * running in batches.
 *
 * Run:
 *   npm run prewarm
 *   WORKER_URL=... npm run prewarm
 *
 * Reads ADMIN_TOKEN + NEON_DATABASE_URL from env or apps/worker/.dev.vars.
 */
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_WORKER_URL = 'https://geostumble-worker.eliothfraijo.workers.dev';
const CONCURRENCY = 5;
const NUDGE_TIMEOUT_MS = 180_000;

function readDevVar(key: string): string | undefined {
  const fromEnv = process.env[key];
  if (fromEnv) return fromEnv;
  const devVarsPath = resolve(import.meta.dirname ?? '.', '../apps/worker/.dev.vars');
  try {
    const text = readFileSync(devVarsPath, 'utf8');
    const match = text.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match?.[1];
  } catch {
    return undefined;
  }
}

interface NudgeResult {
  id: string;
  ok: boolean;
  version?: number;
  bytes?: number;
  usedFallback?: boolean;
  elapsedMs?: number;
  error?: string;
}

async function nudge(
  workerUrl: string,
  token: string,
  personaId: string,
): Promise<NudgeResult> {
  const started = Date.now();
  try {
    const res = await fetch(`${workerUrl}/admin/nudge/${personaId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(NUDGE_TIMEOUT_MS),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return {
        id: personaId,
        ok: false,
        error: `${res.status} ${JSON.stringify(body).slice(0, 200)}`,
        elapsedMs: Date.now() - started,
      };
    }
    return {
      id: personaId,
      ok: true,
      version: body.version as number,
      bytes: body.bytes as number,
      usedFallback: body.usedFallback as boolean,
      elapsedMs: body.elapsedMs as number,
    };
  } catch (err) {
    return {
      id: personaId,
      ok: false,
      error: (err as Error).message,
      elapsedMs: Date.now() - started,
    };
  }
}

async function main(): Promise<void> {
  const workerUrl = process.env.WORKER_URL ?? DEFAULT_WORKER_URL;
  const adminToken = readDevVar('ADMIN_TOKEN');
  const dbUrl = readDevVar('NEON_DATABASE_URL');
  if (!adminToken) throw new Error('ADMIN_TOKEN missing');
  if (!dbUrl) throw new Error('NEON_DATABASE_URL missing');

  const sql = neon(dbUrl);
  const rows = (await sql`SELECT id FROM personas ORDER BY id`) as Array<{ id: string }>;
  const ids = rows.map((r) => r.id);

  console.log(`[prewarm] ${ids.length} personas: ${ids.join(', ')}`);
  console.log(`[prewarm] worker=${workerUrl} concurrency=${CONCURRENCY}`);

  const results: NudgeResult[] = [];

  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map((id) => nudge(workerUrl, adminToken, id)),
    );
    results.push(...batchResults);
    for (const r of batchResults) {
      if (r.ok) {
        console.log(
          `[prewarm]   ${r.id} v${r.version} bytes=${r.bytes} fallback=${r.usedFallback} ${r.elapsedMs}ms`,
        );
      } else {
        console.error(`[prewarm]   ${r.id} FAILED: ${r.error}`);
      }
    }
  }

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n[prewarm] done: ${ok}/${results.length} succeeded`);
  if (ok < results.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
