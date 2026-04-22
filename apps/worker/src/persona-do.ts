import { runCodingAgent, fallbackTemplate } from './coding-agent';
import type { Env } from './index';
import { writeJazzStatus } from './jazz-writer';
import {
  getLatestVersion,
  loadPersonaFromNeon,
  logCost,
  recordSnapshot,
  totalSpendUsd,
  type Persona,
} from './neon';
import { createSandbox } from './sandbox';
import {
  addToReadyPool,
  loadAssetManifest,
  passesQualityGate,
  storeHtml,
} from './storage';

import codingTaskPrompt from './prompts/coding-task.md';
import personaSystemPrompt from './prompts/persona-system.md';

const JITTER_MIN_MS = 60_000;
const JITTER_MAX_MS = 300_000;
const COST_CACHE_TTL_MS = 30_000;

let inFlightSandboxes = 0;

export class PersonaDO implements DurableObject {
  private status: string = 'idle';
  private readonly statusEvents = new EventTarget();

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const personaId = extractPersonaId(url.pathname);
    if (personaId) await this.rememberPersonaId(personaId);

    if (url.pathname.endsWith('/nudge')) return this.adminNudge();
    if (url.pathname.endsWith('/stream')) return this.statusStream();
    return this.serveCurrentPage(personaId);
  }

  async alarm(): Promise<void> {
    try {
      const frozen = await this.env.ADMIN.get('frozen');
      if (frozen === '1') return;
      const editProbability = Number(this.env.EDIT_PROBABILITY ?? '0.3');
      if (Math.random() >= editProbability) return;
      const persona = await this.loadPersona();
      if (persona) await this.runTinkerCycle(persona);
    } catch (err) {
      console.error('[alarm]', (err as Error).message);
    } finally {
      await this.state.storage.setAlarm(Date.now() + jitter(JITTER_MIN_MS, JITTER_MAX_MS));
    }
  }

  /* ------------------------------------------------------------ routes */

  private async serveCurrentPage(personaId: string | null): Promise<Response> {
    if (!personaId) return new Response('bad request', { status: 400 });
    const html = await this.env.PAGES.get(`page:${personaId}:current`);
    if (!html) return new Response('persona has no page yet', { status: 404 });
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  private async adminNudge(): Promise<Response> {
    const persona = await this.loadPersona();
    if (!persona) return json({ error: 'persona not found' }, 404);
    try {
      const result = await this.runTinkerCycle(persona);
      return json(result);
    } catch (err) {
      return json({ error: 'tinker failed', detail: (err as Error).message }, 500);
    }
  }

  private async statusStream(): Promise<Response> {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const send = (status: string) =>
      writer.write(encoder.encode(`event: status\ndata: ${status}\n\n`));

    void send(this.status);
    const listener = (ev: Event) => {
      const custom = ev as CustomEvent<string>;
      void send(custom.detail);
    };
    this.statusEvents.addEventListener('status', listener);

    return new Response(readable, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      },
    });
  }

  /* ------------------------------------------------------- tinker cycle */

  private async runTinkerCycle(persona: Persona): Promise<{
    version: number;
    bytes: number;
    usedFallback: boolean;
    qualityGate: boolean;
    iterations: number;
    tokenUsage: number;
    elapsedMs: number;
  }> {
    const started = Date.now();

    if (await this.costCapHit()) {
      throw new Error('cost cap hit');
    }
    const maxConcurrent = Number(this.env.MAX_CONCURRENT_SANDBOXES ?? '5');
    if (inFlightSandboxes >= maxConcurrent) {
      throw new Error(`sandbox concurrency cap (${maxConcurrent}) reached`);
    }

    inFlightSandboxes++;
    this.setStatus('editing');

    const sandboxId = `persona-${persona.id}-${crypto.randomUUID().slice(0, 8)}`;
    const sb = await createSandbox(this.env, sandboxId);

    try {
      const apiKey = this.env.GEMINI_API_KEY ?? '';
      const assets = await loadAssetManifest(this.env);
      const assetsPublicUrl = this.env.ASSETS_PUBLIC_URL ?? '';

      let html: string;
      let transcript: string;
      let usedFallback = false;
      let iterations = 0;
      let tokenUsage = 0;

      if (apiKey) {
        this.setStatus('editing:agent');
        const result = await runCodingAgent({
          sandbox: sb,
          persona,
          systemPrompt: personaSystemPrompt,
          taskPrompt: codingTaskPrompt,
          assets,
          assetsPublicUrl,
          apiKey,
          onStep: (s) => this.setStatus(`editing:${s}`),
        });

        html = result.html;
        transcript = result.transcript;
        usedFallback = result.usedFallback;
        iterations = result.iterations;
        tokenUsage = result.tokenUsage;
      } else {
        html = fallbackTemplate({ persona, assets, assetsPublicUrl });
        transcript = 'GEMINI_API_KEY empty — used deterministic fallback template';
        usedFallback = true;
      }

      const qualityGate = passesQualityGate(html);
      if (!qualityGate) {
        // One retry: if agent wrote junk, drop to fallback
        html = fallbackTemplate({ persona, assets, assetsPublicUrl });
        usedFallback = true;
        transcript += '\n\nQUALITY_GATE_FAILED → fallback template used';
      }

      this.setStatus('editing:saving');
      const prevVersion = await getLatestVersion(this.env, persona.id);
      const version = prevVersion + 1;
      await storeHtml(this.env, persona.id, version, html);
      await addToReadyPool(this.env, persona.id);

      // Token cost estimate — Gemini Flash is roughly $0.30/1M input + $2.50/1M output.
      // Single blended figure is fine for the ledger.
      const tokenCostUsd = tokenUsage > 0 ? (tokenUsage / 1_000_000) * 1.0 : 0;
      if (tokenCostUsd > 0) await logCost(this.env, persona.id, 'gemini', tokenCostUsd);

      await recordSnapshot(this.env, {
        personaId: persona.id,
        version,
        htmlKvKey: `page:${persona.id}:v${version}`,
        muxPlaybackId: this.env.MUX_DEMO_PLAYBACK_ID ?? null, // Option A: shared demo clip
        sandboxLog: transcript,
        tokenCostUsd,
      });

      return {
        version,
        bytes: html.length,
        usedFallback,
        qualityGate,
        iterations,
        tokenUsage,
        elapsedMs: Date.now() - started,
      };
    } finally {
      try {
        await sb.destroy();
      } catch (err) {
        console.warn('[sandbox.destroy]', (err as Error).message);
      }
      inFlightSandboxes--;
      this.setStatus('idle');
    }
  }

  /* -------------------------------------------------------- helpers */

  private async costCapHit(): Promise<boolean> {
    const cap = Number(this.env.COST_CAP_USD ?? '50');
    const cached = await this.state.storage.get<{ at: number; total: number }>('costCache');
    const now = Date.now();
    let total: number;
    if (cached && now - cached.at < COST_CACHE_TTL_MS) {
      total = cached.total;
    } else {
      total = await totalSpendUsd(this.env);
      await this.state.storage.put('costCache', { at: now, total });
    }
    return total >= cap;
  }

  private async loadPersona(): Promise<Persona | null> {
    const cached = await this.state.storage.get<Persona>('persona');
    if (cached) return cached;
    const personaId = await this.state.storage.get<string>('personaId');
    if (!personaId) return null;
    const fresh = await loadPersonaFromNeon(this.env, personaId);
    if (fresh) await this.state.storage.put('persona', fresh);
    return fresh;
  }

  private async rememberPersonaId(personaId: string): Promise<void> {
    const existing = await this.state.storage.get<string>('personaId');
    if (existing === personaId) return;
    await this.state.storage.put('personaId', personaId);
    // Seed first alarm with jitter so thundering-herd is avoided when
    // all 20 DOs first boot.
    const alarm = await this.state.storage.getAlarm();
    if (!alarm) {
      await this.state.storage.setAlarm(Date.now() + jitter(JITTER_MIN_MS, JITTER_MAX_MS));
    }
  }

  private setStatus(status: string): void {
    this.status = status;
    this.statusEvents.dispatchEvent(new CustomEvent('status', { detail: status }));
    // Jazz fan-out: persona's id was stashed on first fetch. Fire-and-forget
    // so a slow Jazz sync doesn't block the status transition.
    void this.state.storage.get<string>('personaId').then(async (personaId) => {
      if (!personaId) return;
      try {
        await writeJazzStatus(this.env, personaId, status);
      } catch (err) {
        console.warn('[setStatus jazz fan-out]', (err as Error).message);
      }
    });
  }
}

function jitter(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}

function extractPersonaId(pathname: string): string | null {
  const m = pathname.match(/^\/p\/([^/]+)/);
  return m ? m[1]! : null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
