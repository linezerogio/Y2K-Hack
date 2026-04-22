/**
 * Typed client for the Cloudflare Worker.
 * Contract: docs/frontend-worker-integration.md §2, §5.
 * Base URL is read from NEXT_PUBLIC_WORKER_URL at runtime.
 */

import type {
  HealthResponse,
  PersonaMeta,
  StumbleResponse,
} from '@geostumble/shared/types';

function requireWorkerUrl(): string {
  const url = process.env.NEXT_PUBLIC_WORKER_URL;
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_WORKER_URL is not set. Copy apps/web/.env.example to ' +
        'apps/web/.env.local and fill it in (see docs/frontend-worker-integration.md §1).',
    );
  }
  return url.replace(/\/+$/, '');
}

function workerUrl(path: string): string {
  return `${requireWorkerUrl()}${path}`;
}

export async function stumble(): Promise<StumbleResponse | null> {
  const res = await fetch(workerUrl('/stumble'), { cache: 'no-store' });
  if (res.status === 503) return null;
  if (!res.ok) throw new Error(`/stumble ${res.status}`);
  return (await res.json()) as StumbleResponse;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(workerUrl('/health'), { cache: 'no-store' });
  if (!res.ok) throw new Error(`/health ${res.status}`);
  return (await res.json()) as HealthResponse;
}

export async function getPersonaMeta(
  personaId: string,
  init?: { signal?: AbortSignal },
): Promise<PersonaMeta | null> {
  const res = await fetch(workerUrl(`/p/${encodeURIComponent(personaId)}/meta`), {
    ...init,
    // Match the Worker's 5s in-memory cache (Cloudflare proposal §1).
    next: { revalidate: 5 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`meta ${res.status}`);
  return (await res.json()) as PersonaMeta;
}

export function personaIframeSrc(personaId: string, version?: number): string {
  // Worker ignores query strings; we use `v` to bust the browser cache
  // after a nudge (docs/frontend-worker-integration.md §9 gotcha).
  const suffix = version != null ? `?v=${version}` : '';
  return workerUrl(`/p/${encodeURIComponent(personaId)}${suffix}`);
}

export function personaStatusStreamUrl(personaId: string): string {
  return workerUrl(`/p/${encodeURIComponent(personaId)}/stream`);
}
