/**
 * Upload the Y2K asset library (binaries + manifest) from a local folder
 * to Cloudflare R2 and KV.
 *
 *   node --experimental-strip-types scripts/scrape-assets.ts \
 *     [--source /Users/velleker/Downloads/assets] \
 *     [--concurrency 8] [--dry-run] [--skip-upload] [--skip-manifest]
 *
 * Layout expected (matches the scraper agent's output):
 *   <source>/
 *     tiles/     *.gif, *.png        + <file>.meta.json
 *     gifs/      *.gif               + <file>.meta.json
 *     badges/    *.gif, *.png        + <file>.meta.json
 *     wordart/   *.gif, *.png        + <file>.meta.json
 *     counters/  *.gif, *.png        + <file>.meta.json
 *     _raw/ _rejected/ _state/       (ignored)
 *
 * Pushes each binary to R2 (bucket `geostumble-assets`) at
 *   assets/{kind}/{basename}
 * and writes the merged manifest to KV (binding `PAGES`, key `asset:manifest`)
 * as a JSON array of `{ key, kind, tags }` entries — the shape loaded by
 * apps/worker/src/storage.ts#loadAssetManifest.
 *
 * Uses `wrangler` via `apps/worker/node_modules/.bin/wrangler` — same CLI
 * the Worker deploys with. No CF API token needed beyond `wrangler login`.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';

type Kind = 'tile' | 'gif' | 'badge' | 'wordart' | 'counter';

// Folder name on disk → manifest `kind` value.
const KIND_MAP: Record<string, Kind> = {
  tiles: 'tile',
  gifs: 'gif',
  badges: 'badge',
  wordart: 'wordart',
  counters: 'counter',
};

const BINARY_EXT = new Set(['.gif', '.png', '.jpg', '.jpeg', '.webp']);
const R2_BUCKET = 'geostumble-assets';
const KV_BINDING = 'PAGES';
const KV_KEY = 'asset:manifest';

interface MetaSidecar {
  key?: string;
  kind?: Kind;
  tags?: string[];
  [k: string]: unknown;
}

interface ManifestEntry {
  key: string;
  kind: Kind;
  tags: string[];
}

interface Args {
  source: string;
  concurrency: number;
  dryRun: boolean;
  skipUpload: boolean;
  skipManifest: boolean;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    source: get('--source') ?? '/Users/velleker/Downloads/assets',
    concurrency: Number(get('--concurrency') ?? '8'),
    dryRun: argv.includes('--dry-run'),
    skipUpload: argv.includes('--skip-upload'),
    skipManifest: argv.includes('--skip-manifest'),
  };
}

const args = parseArgs();
const source = resolve(args.source);
const workerDir = resolve(import.meta.dirname ?? '.', '../apps/worker');
const wranglerBin = resolve(workerDir, 'node_modules/.bin/wrangler');

console.log(`source:      ${source}`);
console.log(`wrangler:    ${wranglerBin}`);
console.log(`bucket:      ${R2_BUCKET}`);
console.log(`kv binding:  ${KV_BINDING} (key=${KV_KEY})`);
console.log(`concurrency: ${args.concurrency}`);
if (args.dryRun) console.log('*** DRY RUN — no uploads will occur ***');
console.log('');

// --- 1. Walk folders, pair binaries with meta sidecars ----------------------

interface Pair {
  kind: Kind;
  file: string; // absolute path to binary
  meta: MetaSidecar | null;
  key: string; // R2 object key, e.g. assets/gifs/foo.gif
}

function walk(): Pair[] {
  const pairs: Pair[] = [];
  for (const [folder, kind] of Object.entries(KIND_MAP)) {
    const dir = join(source, folder);
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      console.warn(`[skip] ${dir} missing`);
      continue;
    }
    for (const name of entries) {
      const ext = extname(name).toLowerCase();
      if (!BINARY_EXT.has(ext)) continue;
      const file = join(dir, name);
      if (!statSync(file).isFile()) continue;

      const metaPath = `${file}.meta.json`;
      let meta: MetaSidecar | null = null;
      try {
        meta = JSON.parse(readFileSync(metaPath, 'utf8')) as MetaSidecar;
      } catch {
        // Missing sidecar — still upload the file, just with no tags.
      }

      const key = meta?.key ?? `assets/${folder}/${name}`;
      pairs.push({ kind, file, meta, key });
    }
  }
  return pairs;
}

const pairs = walk();
console.log(`discovered ${pairs.length} binaries:`);
for (const kind of new Set(pairs.map((p) => p.kind))) {
  console.log(`  ${kind.padEnd(8)} ${pairs.filter((p) => p.kind === kind).length}`);
}
console.log('');

// --- 2. Upload binaries to R2 ----------------------------------------------

function run(cmd: string, argv: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolveRun) => {
    const child = spawn(cmd, argv, { cwd: workerDir, stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.stdout.on('data', () => {});
    child.on('close', (code) => resolveRun({ code: code ?? 1, stderr }));
  });
}

async function uploadOne(p: Pair): Promise<'ok' | 'fail'> {
  if (args.dryRun) return 'ok';
  const { code, stderr } = await run(wranglerBin, [
    'r2',
    'object',
    'put',
    `${R2_BUCKET}/${p.key}`,
    '--file',
    p.file,
    '--remote',
  ]);
  if (code !== 0) {
    console.error(`\nFAIL ${p.key}: ${stderr.trim().slice(0, 300)}`);
    return 'fail';
  }
  return 'ok';
}

async function uploadAll(): Promise<{ ok: number; fail: number }> {
  let cursor = 0;
  let ok = 0;
  let fail = 0;
  let done = 0;
  const total = pairs.length;

  async function worker(): Promise<void> {
    while (cursor < total) {
      const i = cursor++;
      const result = await uploadOne(pairs[i]);
      if (result === 'ok') ok++;
      else fail++;
      done++;
      if (done % 10 === 0 || done === total) {
        process.stdout.write(`\r  uploaded ${done}/${total} (ok=${ok} fail=${fail})   `);
      }
    }
  }

  await Promise.all(Array.from({ length: args.concurrency }, worker));
  process.stdout.write('\n');
  return { ok, fail };
}

if (args.skipUpload) {
  console.log('→ skipping R2 upload (--skip-upload)');
} else {
  console.log(`→ uploading ${pairs.length} files to R2…`);
  const t0 = Date.now();
  const { ok, fail } = await uploadAll();
  console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s — ok=${ok} fail=${fail}`);
  if (fail > 0) {
    console.error(`\n${fail} uploads failed. Fix and rerun (script is idempotent).`);
    process.exit(1);
  }
  console.log('');
}

// --- 3. Build + publish manifest to KV --------------------------------------

const manifest: ManifestEntry[] = pairs.map((p) => ({
  key: p.key,
  kind: (p.meta?.kind as Kind | undefined) ?? p.kind,
  tags: Array.isArray(p.meta?.tags) ? (p.meta!.tags as string[]) : [],
}));

if (args.skipManifest) {
  console.log('→ skipping manifest publish (--skip-manifest)');
} else {
  console.log(`→ publishing manifest (${manifest.length} entries) to KV…`);
  const tmp = mkdtempSync(join(tmpdir(), 'geostumble-manifest-'));
  const manifestPath = join(tmp, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest));
  console.log(`  wrote ${manifestPath} (${statSync(manifestPath).size} bytes)`);

  if (args.dryRun) {
    console.log('  (dry-run) would run: wrangler kv key put …');
  } else {
    const { code, stderr } = await run(wranglerBin, [
      'kv',
      'key',
      'put',
      KV_KEY,
      `--binding=${KV_BINDING}`,
      `--path=${manifestPath}`,
      '--remote',
    ]);
    if (code !== 0) {
      console.error(`FAIL kv put: ${stderr.trim()}`);
      process.exit(1);
    }
    console.log(`  ok — ${KV_BINDING}[${KV_KEY}] now holds ${manifest.length} entries`);
  }
}

console.log('\n✅ assets synced. Coding agent list_assets() will return live data on next run.');
