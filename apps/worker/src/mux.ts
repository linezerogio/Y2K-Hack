/**
 * Mux Video — direct-upload REST client.
 *
 * Per Mux Implementation Proposal §2. We call the REST API directly with
 * `fetch` + Basic auth rather than importing @mux/mux-node, to stay inside
 * the Cloudflare Worker 1MB bundle limit.
 *
 * Algorithm (from proposal):
 *   1. POST /video/v1/uploads  → { url, id }
 *   2. PUT  url  (mp4 body)
 *   3. Poll GET /video/v1/uploads/{id} until asset_id present (max 30s)
 *   4. GET  /video/v1/assets/{asset_id} → playback_ids[0].id
 *
 * In v1 we operate in **Option A mode**: runTinkerCycle does not call this
 * at runtime. Instead, a one-off seed script (`scripts/upload-demo-mp4.ts`)
 * uploads a single generic "agent typing" clip, and every persona page
 * reuses the resulting MUX_DEMO_PLAYBACK_ID. This helper exists so (a) the
 * seed script has a typed implementation, and (b) per-cycle recording
 * (Option B/V2) can drop straight in later.
 */

const MUX_API = 'https://api.mux.com';

export interface MuxEnv {
  MUX_TOKEN_ID?: string;
  MUX_TOKEN_SECRET?: string;
}

function authHeader(env: MuxEnv): string {
  const b64 = btoa(`${env.MUX_TOKEN_ID ?? ''}:${env.MUX_TOKEN_SECRET ?? ''}`);
  return `Basic ${b64}`;
}

/**
 * Upload an MP4 buffer to Mux and return its playback_id.
 * Returns null on any failure — callers should treat the clip as optional.
 */
export async function uploadRecordingToMux(
  env: MuxEnv,
  mp4: Uint8Array,
): Promise<string | null> {
  if (!env.MUX_TOKEN_ID || !env.MUX_TOKEN_SECRET) {
    console.warn('mux: credentials missing, skipping upload');
    return null;
  }
  try {
    // 1. Reserve a signed upload URL
    const createRes = await fetch(`${MUX_API}/video/v1/uploads`, {
      method: 'POST',
      headers: {
        'authorization': authHeader(env),
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policy: ['public'],
          video_quality: 'basic',
        },
        cors_origin: '*',
      }),
    });
    if (!createRes.ok) {
      console.error('mux: create upload failed', createRes.status, await createRes.text());
      return null;
    }
    const { data: upload } = (await createRes.json()) as {
      data: { id: string; url: string };
    };

    // 2. PUT the mp4 bytes to the signed URL
    const putRes = await fetch(upload.url, {
      method: 'PUT',
      headers: { 'content-type': 'video/mp4' },
      body: mp4,
    });
    if (!putRes.ok) {
      console.error('mux: PUT failed', putRes.status);
      return null;
    }

    // 3. Poll for asset_id (Mux processes asynchronously)
    const deadline = Date.now() + 30_000;
    let assetId: string | null = null;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2_000));
      const pollRes = await fetch(`${MUX_API}/video/v1/uploads/${upload.id}`, {
        headers: { authorization: authHeader(env) },
      });
      if (!pollRes.ok) continue;
      const { data } = (await pollRes.json()) as {
        data: { asset_id?: string; status: string };
      };
      if (data.asset_id) {
        assetId = data.asset_id;
        break;
      }
    }
    if (!assetId) {
      console.error('mux: asset_id never appeared within 30s');
      return null;
    }

    // 4. Fetch the playback id
    const assetRes = await fetch(`${MUX_API}/video/v1/assets/${assetId}`, {
      headers: { authorization: authHeader(env) },
    });
    if (!assetRes.ok) {
      console.error('mux: asset fetch failed', assetRes.status);
      return null;
    }
    const { data: asset } = (await assetRes.json()) as {
      data: { playback_ids?: Array<{ id: string; policy: string }> };
    };
    return asset.playback_ids?.[0]?.id ?? null;
  } catch (err) {
    console.error('mux: unexpected error', (err as Error).message);
    return null;
  }
}

/**
 * Estimate USD cost for a basic-quality VOD asset of given duration.
 * Used to seed a cost_ledger row tagged kind='mux'.
 */
export function estimateMuxCostUsd(durationSec: number): number {
  return Number((durationSec * 0.0005).toFixed(4));
}
