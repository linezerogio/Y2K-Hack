/**
 * Typed fetch helpers for the Cloudflare Worker.
 *
 * Contract frozen for v1; see docs/frontend-worker-integration.md §2.
 */

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;
if (!WORKER_URL) {
  throw new Error('NEXT_PUBLIC_WORKER_URL missing — set in apps/web/.env.local');
}

export interface PersonaMeta {
  personaId: string;
  name: string;
  era: string;
  version: number;
  muxPlaybackId: string | null;
  status: string;
}

export async function stumble(): Promise<{ personaId: string }> {
  const res = await fetch(`${WORKER_URL}/stumble`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`worker /stumble returned ${res.status}`);
  return res.json();
}

export async function getPersonaMeta(id: string): Promise<PersonaMeta | null> {
  const res = await fetch(`${WORKER_URL}/p/${encodeURIComponent(id)}/meta`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`worker /p/${id}/meta returned ${res.status}`);
  return res.json();
}

export function personaIframeUrl(id: string): string {
  return `${WORKER_URL}/p/${encodeURIComponent(id)}`;
}

export function personaStreamUrl(id: string): string {
  return `${WORKER_URL}/p/${encodeURIComponent(id)}/stream`;
}
