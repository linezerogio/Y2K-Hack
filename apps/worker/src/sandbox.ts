import { getSandbox, type Sandbox as CFSandbox } from '@cloudflare/sandbox';
import type { Env } from './index';

export interface SandboxHandle {
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
  /**
   * Read a binary file out of the sandbox via `base64 -w 0` over stdout.
   * The 33% inflation is fine for clips under ~5MB; we cap recorder MP4
   * output at ~30s 480x270 which lands comfortably under that.
   */
  readFileBytes(path: string): Promise<Uint8Array>;
  exec(cmd: string): Promise<{ stdout: string; stderr: string; exitCode: number }>;
  destroy(): Promise<void>;
}

export async function createSandbox(env: Env, id: string): Promise<SandboxHandle> {
  const sb = getSandbox(env.SANDBOX, id);
  return wrap(sb);
}

function wrap(sb: CFSandbox): SandboxHandle {
  return {
    async writeFile(path, content) {
      await sb.writeFile(path, content);
    },
    async readFile(path) {
      const res = await sb.readFile(path);
      return res.content;
    },
    async readFileBytes(path) {
      // Single-line base64 (no wrapping) over stdout, then decode in JS.
      const res = await sb.exec(`base64 -w 0 ${shellQuote(path)}`);
      if (res.exitCode !== 0) {
        throw new Error(`readFileBytes ${path} failed: ${res.stderr.slice(0, 200)}`);
      }
      const bin = atob(res.stdout.trim());
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    },
    async exec(cmd) {
      const res = await sb.exec(cmd);
      return {
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode,
      };
    },
    async destroy() {
      await sb.destroy();
    },
  };
}

function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}
