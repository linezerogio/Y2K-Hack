import { getSandbox, type Sandbox as CFSandbox } from '@cloudflare/sandbox';
import type { Env } from './index';

export interface SandboxHandle {
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
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
