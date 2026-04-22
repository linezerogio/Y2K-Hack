/**
 * One-off: upload the demo MP4 to Mux and print the playback_id.
 *
 *   node --experimental-strip-types scripts/upload-demo-mp4.ts
 *
 * Reads MUX_TOKEN_ID + MUX_TOKEN_SECRET from apps/worker/.dev.vars,
 * PUTs assets/demo/demo-agent.mp4 to a signed upload URL, polls for
 * the asset_id, then prints the public playback_id. Paste that value
 * into apps/worker/.dev.vars as MUX_DEMO_PLAYBACK_ID.
 *
 * This is the Option A seed: every persona snapshot reuses this single
 * playback_id. Safe to re-run — each run creates a new asset. If you
 * want to reuse an existing asset, skip this script.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MUX_API = 'https://api.mux.com';

function loadEnv(key: string): string {
  const text = readFileSync(
    resolve(import.meta.dirname ?? '.', '../apps/worker/.dev.vars'),
    'utf8',
  );
  const match = text.match(new RegExp(`^${key}=(.+)$`, 'm'));
  if (!match || !match[1]) throw new Error(`${key} missing from .dev.vars`);
  return match[1];
}

const MUX_TOKEN_ID = loadEnv('MUX_TOKEN_ID');
const MUX_TOKEN_SECRET = loadEnv('MUX_TOKEN_SECRET');
const auth = `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`;

const mp4Path = resolve(import.meta.dirname ?? '.', '../assets/demo/demo-agent.mp4');
const mp4 = readFileSync(mp4Path);
console.log(`loaded ${mp4.length} bytes from ${mp4Path}`);

// 1. Reserve a signed upload URL
console.log('→ POST /video/v1/uploads');
const createRes = await fetch(`${MUX_API}/video/v1/uploads`, {
  method: 'POST',
  headers: { authorization: auth, 'content-type': 'application/json' },
  body: JSON.stringify({
    new_asset_settings: {
      playback_policy: ['public'],
      video_quality: 'basic',
    },
    cors_origin: '*',
  }),
});
if (!createRes.ok) {
  console.error('FAIL', createRes.status, await createRes.text());
  process.exit(1);
}
const { data: upload } = (await createRes.json()) as {
  data: { id: string; url: string };
};
console.log(`  upload id: ${upload.id}`);

// 2. PUT the bytes
console.log('→ PUT signed URL');
const putRes = await fetch(upload.url, {
  method: 'PUT',
  headers: { 'content-type': 'video/mp4' },
  body: new Uint8Array(mp4),
});
if (!putRes.ok) {
  console.error('FAIL', putRes.status);
  process.exit(1);
}
console.log('  ok');

// 3. Poll for asset_id
console.log('→ polling for asset_id...');
const deadline = Date.now() + 60_000;
let assetId: string | null = null;
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 2000));
  const pollRes = await fetch(`${MUX_API}/video/v1/uploads/${upload.id}`, {
    headers: { authorization: auth },
  });
  const { data } = (await pollRes.json()) as {
    data: { asset_id?: string; status: string };
  };
  process.stdout.write(`  status=${data.status} `);
  if (data.asset_id) {
    assetId = data.asset_id;
    console.log(`asset_id=${assetId}`);
    break;
  }
  console.log('');
}
if (!assetId) {
  console.error('FAIL: asset_id never appeared');
  process.exit(1);
}

// 4. Fetch playback_id
console.log('→ GET /video/v1/assets/{asset_id}');
const assetRes = await fetch(`${MUX_API}/video/v1/assets/${assetId}`, {
  headers: { authorization: auth },
});
const { data: asset } = (await assetRes.json()) as {
  data: { playback_ids?: Array<{ id: string; policy: string }>; status: string };
};

console.log(`\nasset status: ${asset.status}`);
if (!asset.playback_ids || asset.playback_ids.length === 0) {
  console.error('FAIL: no playback_ids on asset');
  process.exit(1);
}
const playbackId = asset.playback_ids[0].id;
console.log(`\n✅ playback_id: ${playbackId}`);
console.log(`\nNext: paste into apps/worker/.dev.vars as:`);
console.log(`  MUX_DEMO_PLAYBACK_ID=${playbackId}`);
console.log(`\nPreview URL (once Mux finishes encoding):`);
console.log(`  https://stream.mux.com/${playbackId}.m3u8`);
console.log(`  https://image.mux.com/${playbackId}/thumbnail.png`);
