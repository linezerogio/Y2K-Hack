/**
 * Per-cycle recorder — Mux V2.
 *
 * Each call to `startRecorder()` opens a session that the PersonaDO feeds
 * status events into via `logStep(name)`. When the agent loop finishes,
 * `stop(env, sandbox)` renders the timeline as an MP4 inside the sandbox
 * (ffmpeg lavfi bg + burned-in subtitles), uploads it to Mux, and returns
 * the new playback id.
 *
 * Failure-safe: any thrown error inside `stop()` falls through to the
 * shared `MUX_DEMO_PLAYBACK_ID`, so a recording problem can never break
 * a tinker cycle. See Implementation/Mux/v2/IMPLEMENTATION-PROPOSAL.md.
 */

import type { SandboxHandle } from './sandbox';
import { uploadRecordingToMux, type MuxEnv } from './mux';

export interface RecorderOutput {
  /** Mux playback id — real per-cycle clip OR the v1 shared demo fallback. */
  playbackId: string | null;
  /** True when the playback id came from a fresh per-cycle upload. */
  freshUpload: boolean;
  durationSec: number;
  transcript: string;
}

export interface Recorder {
  logStep(name: string, payload?: unknown): void;
  stop(env: RecorderEnv, sandbox: SandboxHandle): Promise<RecorderOutput>;
}

export interface RecorderEnv extends MuxEnv {
  MUX_DEMO_PLAYBACK_ID?: string;
}

interface Step {
  name: string;
  at: number;
  payload?: unknown;
}

const MIN_DURATION_SEC = 3;
const MAX_DURATION_SEC = 60;
const VIDEO_W = 480;
const VIDEO_H = 270;
const BG_COLOR = '#000080'; // Y2K Windows-blue

export function startRecorder(): Recorder {
  const started = Date.now();
  const steps: Step[] = [];

  return {
    logStep(name, payload) {
      steps.push({ name, at: Date.now() - started, payload });
    },
    async stop(env, sandbox) {
      const rawSec = Math.round((Date.now() - started) / 1000);
      const durationSec = clamp(rawSec, MIN_DURATION_SEC, MAX_DURATION_SEC);
      const transcript = renderTranscript(steps);
      const fallback: RecorderOutput = {
        playbackId: env.MUX_DEMO_PLAYBACK_ID ?? null,
        freshUpload: false,
        durationSec,
        transcript,
      };

      try {
        const srt = renderSrt(steps, durationSec);
        await sandbox.writeFile('/workspace/timeline.srt', srt);

        const cmd = ffmpegCmd(durationSec);
        const ff = await sandbox.exec(cmd);
        if (ff.exitCode !== 0) {
          console.warn('[recorder] ffmpeg exit', ff.exitCode, ff.stderr.slice(-300));
          return fallback;
        }

        const mp4 = await sandbox.readFileBytes('/workspace/clip.mp4');
        if (mp4.byteLength < 1000) {
          console.warn('[recorder] mp4 too small', mp4.byteLength);
          return fallback;
        }

        const playbackId = await uploadRecordingToMux(env, mp4);
        if (!playbackId) return fallback;

        return { playbackId, freshUpload: true, durationSec, transcript };
      } catch (err) {
        console.warn('[recorder] threw', (err as Error).message);
        return fallback;
      }
    },
  };
}

/* --------------------------------------------------------------- helpers */

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function renderTranscript(steps: Step[]): string {
  return steps
    .map((s) => `[${s.at}ms] ${s.name}${s.payload ? ' ' + JSON.stringify(s.payload) : ''}`)
    .join('\n');
}

/**
 * Build SRT cues from the step timeline. Each cue runs from its own
 * timestamp until the next step's timestamp (or until durationSec for
 * the last step). Empty timelines fall back to a single placeholder cue.
 */
function renderSrt(steps: Step[], durationSec: number): string {
  if (steps.length === 0) {
    return `1\n00:00:00,000 --> 00:00:0${Math.min(durationSec, 9)},000\nidle\n`;
  }
  const totalMs = durationSec * 1000;
  const cues: string[] = [];
  for (let i = 0; i < steps.length; i++) {
    const startMs = Math.min(steps[i]!.at, totalMs - 500);
    const endMs = i + 1 < steps.length ? Math.min(steps[i + 1]!.at, totalMs) : totalMs;
    if (endMs <= startMs) continue;
    cues.push(
      `${cues.length + 1}\n${msToSrtTs(startMs)} --> ${msToSrtTs(endMs)}\n${escapeSrt(
        steps[i]!.name,
      )}\n`,
    );
  }
  return cues.join('\n');
}

function msToSrtTs(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const milli = ms % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(milli)}`;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}
function pad3(n: number): string {
  return n.toString().padStart(3, '0');
}

function escapeSrt(s: string): string {
  // SRT renderer is libass; commas + colons are safe, but strip newlines.
  return s.replace(/\r?\n/g, ' ').slice(0, 80);
}

/**
 * ffmpeg invocation: solid Y2K-blue background, burned-in subtitles in
 * Courier for that Geocities-monitor look, no audio, ultrafast preset
 * to keep the cycle under +5s.
 */
function ffmpegCmd(durationSec: number): string {
  const style =
    "FontName=Courier New,FontSize=18,PrimaryColour=&H0000FFFF&,OutlineColour=&H00000000&,BackColour=&H80000000&,BorderStyle=3,Outline=2,Shadow=0,Alignment=2,MarginV=30";
  const filter = `subtitles=/workspace/timeline.srt:force_style='${style}'`;
  return [
    'ffmpeg',
    '-hide_banner -loglevel error -y',
    `-f lavfi -i color=c=${BG_COLOR}:s=${VIDEO_W}x${VIDEO_H}:d=${durationSec}`,
    `-vf "${filter}"`,
    '-c:v libx264 -preset ultrafast -pix_fmt yuv420p',
    '-movflags +faststart',
    '/workspace/clip.mp4',
    '2>&1',
  ].join(' ');
}
