import type { Env } from './index';

export class PersonaDO implements DurableObject {
  private status: string = 'idle';
  private statusEvents = new EventTarget();

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.endsWith('/nudge')) return this.adminNudge();
    if (url.pathname.endsWith('/stream')) return this.statusStream();
    return this.serveCurrentPage();
  }

  async alarm(): Promise<void> {
    const editProbability = Number(this.env.EDIT_PROBABILITY ?? '0.3');
    if (Math.random() < editProbability) {
      // runTinkerCycle lands in Phase 2.2. For now just toggle status so SSE
      // subscribers have something to observe during local dev.
      this.setStatus('editing');
      this.setStatus('idle');
    }
    await this.state.storage.setAlarm(Date.now() + jitter(60_000, 300_000));
  }

  private async serveCurrentPage(): Promise<Response> {
    const personaId = this.state.id.toString();
    const html = await this.env.PAGES.get(`page:${personaId}:current`);
    if (!html) return new Response('persona has no page yet', { status: 404 });
    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  private async adminNudge(): Promise<Response> {
    return new Response(JSON.stringify({ error: 'not implemented' }), {
      status: 501,
      headers: { 'content-type': 'application/json' },
    });
  }

  private async statusStream(): Promise<Response> {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const send = (status: string) =>
      writer.write(encoder.encode(`event: status\ndata: ${status}\n\n`));

    send(this.status);
    const listener = (ev: Event) => {
      const custom = ev as CustomEvent<string>;
      void send(custom.detail);
    };
    this.statusEvents.addEventListener('status', listener);

    return new Response(readable, {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        'connection': 'keep-alive',
      },
    });
  }

  private setStatus(status: string): void {
    this.status = status;
    this.statusEvents.dispatchEvent(
      new CustomEvent('status', { detail: status }),
    );
    // Jazz write fan-out lands in Phase 4.1.
  }
}

function jitter(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}
