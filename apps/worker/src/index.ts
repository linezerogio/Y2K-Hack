import type { Sandbox as CFSandbox } from '@cloudflare/sandbox';
import { PersonaDO } from './persona-do';
import { getPersonaMeta, totalSpendUsd, type PersonaMeta } from './neon';

export { PersonaDO };
export { Sandbox } from '@cloudflare/sandbox';

export interface Env {
  PERSONA: DurableObjectNamespace;
  SANDBOX: DurableObjectNamespace<CFSandbox>;
  PAGES: KVNamespace;
  ADMIN: KVNamespace;
  ASSETS: R2Bucket;
  NEON_DATABASE_URL: string;
  EDIT_PROBABILITY?: string;
  MAX_CONCURRENT_SANDBOXES?: string;
  COST_CAP_USD?: string;
  ASSETS_PUBLIC_URL?: string;
  ADMIN_TOKEN?: string;
}

const META_CACHE_TTL_MS = 5_000;
const metaCache = new Map<string, { at: number; value: PersonaMeta | null }>();

const COST_CACHE_TTL_MS = 2_000;
let costCache: { at: number; value: number } | null = null;

const PERSONA_COUNT = 20;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === '/health') return handleHealth(env);
    if (pathname === '/stumble') return handleStumble(env);
    if (pathname === '/admin/smoke/sandbox') return handleSandboxSmoke(req, env);

    const metaMatch = pathname.match(/^\/p\/([^/]+)\/meta$/);
    if (metaMatch) {
      const [, personaId] = metaMatch;
      return handleMeta(env, personaId);
    }

    const pageMatch = pathname.match(/^\/p\/([^/]+)(\/.*)?$/);
    if (pageMatch) {
      const [, personaId] = pageMatch;
      const stub = env.PERSONA.get(env.PERSONA.idFromName(personaId));
      return stub.fetch(req);
    }

    if (pathname.startsWith('/admin/')) return handleAdmin(req, env);

    return new Response('not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;

async function handleHealth(env: Env): Promise<Response> {
  const { keys } = await env.PAGES.list({ prefix: 'ready:', limit: 1000 });
  return json({
    ok: true,
    personaCount: PERSONA_COUNT,
    poolSize: keys.length,
  });
}

async function handleMeta(env: Env, personaId: string): Promise<Response> {
  const now = Date.now();
  const cached = metaCache.get(personaId);
  if (cached && now - cached.at < META_CACHE_TTL_MS) {
    if (cached.value === null) return json({ error: 'persona not found' }, 404);
    return json({ ...cached.value, status: 'idle' });
  }
  try {
    const meta = await getPersonaMeta(env, personaId);
    metaCache.set(personaId, { at: now, value: meta });
    if (!meta) return json({ error: 'persona not found' }, 404);
    return json({ ...meta, status: 'idle' });
  } catch (err) {
    return json({ error: 'meta lookup failed', detail: (err as Error).message }, 500);
  }
}

async function handleStumble(env: Env): Promise<Response> {
  const { keys } = await env.PAGES.list({ prefix: 'ready:', limit: 1000 });
  if (keys.length === 0) {
    return json({ error: 'ready pool is empty' }, 503);
  }
  const picked = keys[Math.floor(Math.random() * keys.length)]!;
  const personaId = picked.name.slice('ready:'.length);
  return json({ personaId });
}

async function handleAdmin(req: Request, env: Env): Promise<Response> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: 'unauthorized' }, 401);
  }

  const url = new URL(req.url);
  const { pathname } = url;

  if (pathname === '/admin/freeze' && req.method === 'POST') {
    await env.ADMIN.put('frozen', '1');
    return json({ frozen: true });
  }

  if (pathname === '/admin/thaw' && req.method === 'POST') {
    await env.ADMIN.delete('frozen');
    return json({ frozen: false });
  }

  if (pathname === '/admin/cost') {
    const now = Date.now();
    if (costCache && now - costCache.at < COST_CACHE_TTL_MS) {
      return json({ totalUsd: costCache.value, cached: true });
    }
    try {
      const totalUsd = await totalSpendUsd(env);
      costCache = { at: now, value: totalUsd };
      return json({ totalUsd, cached: false });
    } catch (err) {
      return json({ error: 'cost lookup failed', detail: (err as Error).message }, 500);
    }
  }

  const nudgeMatch = pathname.match(/^\/admin\/nudge\/([^/]+)$/);
  if (nudgeMatch && req.method === 'POST') {
    const [, personaId] = nudgeMatch;
    const stub = env.PERSONA.get(env.PERSONA.idFromName(personaId));
    return stub.fetch(new Request(`https://do/nudge`, { method: 'POST' }));
  }

  return new Response('not found', { status: 404 });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function handleSandboxSmoke(req: Request, env: Env): Promise<Response> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return json({ error: 'unauthorized' }, 401);
  }

  const { createSandbox } = await import('./sandbox');
  const started = Date.now();
  const sb = await createSandbox(env, `smoke-${crypto.randomUUID()}`);

  try {
    const html = '<html><body><h1>hello y2k</h1></body></html>';
    await sb.writeFile('/workspace/index.html', html);
    const readBack = await sb.readFile('/workspace/index.html');
    const tidy = await sb.exec('/usr/bin/tidy -errors -q /workspace/index.html 2>&1 || true');

    return json({
      ok: readBack === html,
      readBackBytes: readBack.length,
      tidyExitCode: tidy.exitCode,
      tidyTail: tidy.stdout.slice(-500),
      elapsedMs: Date.now() - started,
    });
  } finally {
    await sb.destroy();
  }
}
