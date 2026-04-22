/**
 * Option A v1 — no-op recorder.
 *
 * Returns the shared demo playback_id for every tinker cycle. See the
 * Mux proposal §1 for why we're deferring real per-cycle recording to
 * V2: `asciinema-agg` isn't in the sandbox image, and building the
 * pipeline from scratch during the 6-hour window is too risky. The
 * interface matches what a real recorder would expose so the upgrade
 * path stays small.
 *
 * Callers use it like:
 *   const rec = startRecorder();
 *   rec.logStep('editing:selecting-bg');
 *   // ... agent runs ...
 *   const out = await rec.stop(env);   // { playbackId, durationSec }
 */

export interface RecorderOutput {
  playbackId: string | null;
  durationSec: number;
  /** Kept for future V2 real-recording path. Empty string in Option A. */
  transcript: string;
}

export interface Recorder {
  logStep(name: string, payload?: unknown): void;
  stop(env: { MUX_DEMO_PLAYBACK_ID?: string }): Promise<RecorderOutput>;
}

export function startRecorder(): Recorder {
  const started = Date.now();
  const steps: Array<{ name: string; at: number; payload?: unknown }> = [];

  return {
    logStep(name, payload) {
      steps.push({ name, at: Date.now() - started, payload });
    },
    async stop(env) {
      const durationSec = Math.round((Date.now() - started) / 1000);
      const transcript = steps
        .map((s) => `[${s.at}ms] ${s.name}${s.payload ? ' ' + JSON.stringify(s.payload) : ''}`)
        .join('\n');
      return {
        playbackId: env.MUX_DEMO_PLAYBACK_ID ?? null,
        durationSec,
        transcript,
      };
    },
  };
}
