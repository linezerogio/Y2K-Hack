/**
 * Stumbler identity — stable per-browser id + color used to author
 * guestbook entries and key presence entries. Pure client-side. Kept
 * out of Jazz entirely; the identity just lives in localStorage and
 * gets stamped onto CoValues when the stumbler writes.
 *
 * Frontend proposal §4 step 8.
 */

const STORAGE_KEY = 'geostumble:stumbler';

export interface Stumbler {
  id: string;
  color: string;
  /** Optional display handle. Blank until the user sets one in the guestbook form. */
  name: string;
}

const PALETTE = [
  '#ff67c8', // magenta
  '#73efff', // cyan
  '#fff16a', // yellow
  '#ff9f1a', // orange
  '#c89eff', // lilac
  '#a3ff8a', // lime
  '#ff8a8a', // coral
  '#8ab8ff', // powder blue
];

function randomId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomColor(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
}

/**
 * Lazily reads (or creates) the stumbler identity from localStorage.
 * Must be called from a client component — guards against SSR.
 */
export function getStumbler(): Stumbler {
  if (typeof window === 'undefined') {
    return { id: 'ssr', color: PALETTE[0]!, name: '' };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Stumbler>;
      if (parsed.id && parsed.color) {
        return {
          id: parsed.id,
          color: parsed.color,
          name: parsed.name ?? '',
        };
      }
    }
  } catch {
    // fall through and regenerate
  }

  const fresh: Stumbler = { id: randomId(), color: randomColor(), name: '' };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // storage disabled — return the ephemeral identity anyway
  }
  return fresh;
}

/**
 * Update the display name (or any subset) of the stumbler. Writes back
 * to localStorage and returns the merged value.
 */
export function setStumbler(patch: Partial<Stumbler>): Stumbler {
  const current = getStumbler();
  const next: Stumbler = { ...current, ...patch };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  return next;
}
