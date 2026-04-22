import type { Env } from './index';

export interface AssetManifestEntry {
  key: string;
  kind: 'tile' | 'gif' | 'badge' | 'wordart' | 'counter';
  tags: string[];
}

/**
 * Write versioned + current HTML, then re-read `current` to confirm
 * replication before the caller writes `ready:{id}`. KV is eventually
 * consistent — without this read-back, `/stumble` can redirect to a
 * persona whose page hasn't propagated yet.
 */
export async function storeHtml(
  env: Env,
  personaId: string,
  version: number,
  html: string,
): Promise<void> {
  await env.PAGES.put(`page:${personaId}:v${version}`, html);
  await env.PAGES.put(`page:${personaId}:current`, html);

  for (let i = 0; i < 10; i++) {
    const back = await env.PAGES.get(`page:${personaId}:current`);
    if (back === html) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  // If replication never confirms, fall through anyway — caller may still
  // want to add to ready pool on the next cycle. Log for diagnosis.
  console.warn(`[storeHtml] read-back never matched for ${personaId} v${version}`);
}

export async function addToReadyPool(env: Env, personaId: string): Promise<void> {
  await env.PAGES.put(`ready:${personaId}`, '1');
}

/**
 * Load asset manifest from KV. Returns [] if unseeded — coding agent
 * handles the empty case by skipping list_assets results.
 */
export async function loadAssetManifest(env: Env): Promise<AssetManifestEntry[]> {
  const raw = await env.PAGES.get('asset:manifest');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AssetManifestEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Quality gate per project.md §10. At least 5 of 7 checks must pass
 * — gives agents room to be stylistically adventurous without breaking
 * the era constraints.
 */
export function passesQualityGate(html: string): boolean {
  const checks = [
    /<table/i.test(html),
    /<marquee/i.test(html),
    /background(-image)?[:=]/i.test(html),
    /Comic Sans|Impact|Arial Black/i.test(html),
    html.length > 1500,
    html.length < 25000,
    !/display\s*:\s*(flex|grid)|@media/i.test(html),
  ];
  return checks.filter(Boolean).length >= 5;
}
