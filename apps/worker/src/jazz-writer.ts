import { RoomRegistry } from '@geostumble/shared/jazz-schema';
// The load-edge-wasm import registers the WASM crypto provider as a side
// effect. Must run before startWorker for the Cloudflare Worker runtime
// to authenticate the worker account.
import 'jazz-tools/load-edge-wasm';
import { startWorker } from 'jazz-tools/worker';

import type { Env } from './index';

/**
 * Fire-and-forget write of a persona's `status` to Jazz. Opens a short-lived
 * worker account session, updates the CoValue, and shuts down. Swallows
 * all errors by design — Jazz is a best-effort enhancement on top of the
 * SSE stream (`/p/:id/stream`), which stays authoritative for the demo
 * fallback path (project.md §17).
 *
 * Latency per call: ~1-3s (WebSocket handshake + sync). Use
 * `ctx.waitUntil()` at the caller to avoid blocking the main response.
 */
export async function writeJazzStatus(
  env: Env,
  personaId: string,
  status: string,
): Promise<void> {
  if (!env.JAZZ_WORKER_ACCOUNT || !env.JAZZ_WORKER_SECRET) return;

  const registryId = await resolveRegistryId(env);
  if (!registryId) return;

  let worker: Awaited<ReturnType<typeof startWorker>> | null = null;
  try {
    worker = await startWorker({
      accountID: env.JAZZ_WORKER_ACCOUNT,
      accountSecret: env.JAZZ_WORKER_SECRET,
      syncServer: env.JAZZ_SYNC_URL ?? 'wss://cloud.jazz.tools/sync',
    });

    const registry = (await RoomRegistry.load(registryId, {
      loadAs: worker.worker,
      resolve: { [personaId]: true },
    })) as Record<string, unknown> | null;
    const room = registry?.[personaId];
    if (!room) return;

    // Jazz CoValues are proxied; plain assignment persists + syncs.
    (room as unknown as { $jazz: { set: (k: string, v: unknown) => void; waitForSync: () => Promise<void> } }).$jazz.set('status', status);
    await (room as unknown as { $jazz: { waitForSync: () => Promise<void> } }).$jazz.waitForSync();
  } catch (err) {
    console.warn('[jazz-writer]', (err as Error).message);
  } finally {
    try {
      await worker?.shutdownWorker();
    } catch {
      // ignore shutdown errors — they only affect resource cleanup
    }
  }
}

/**
 * Resolve the RoomRegistry CoValue id. Prefers KV (`jazz:registry_id`,
 * written by `scripts/seed-jazz-rooms.ts`) so rotating the registry
 * doesn't require a secret-put + redeploy. Falls back to the explicit
 * env var for local dev.
 */
async function resolveRegistryId(env: Env): Promise<string | null> {
  const fromKv = await env.PAGES.get('jazz:registry_id');
  if (fromKv) return fromKv;
  if (env.JAZZ_REGISTRY_ID) return env.JAZZ_REGISTRY_ID;
  return null;
}
