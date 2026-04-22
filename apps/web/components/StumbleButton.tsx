'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ButtonState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

export function StumbleButton() {
  const router = useRouter();
  const [state, setState] = useState<ButtonState>({ kind: 'idle' });

  async function onClick() {
    if (state.kind === 'loading') return;
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/stumble', { cache: 'no-store' });
      if (res.status === 503) {
        setState({ kind: 'error', message: 'warming up the tubes...' });
        return;
      }
      if (!res.ok) {
        setState({ kind: 'error', message: 'the internet is having a moment' });
        return;
      }
      const data = (await res.json()) as { personaId: string };
      router.push(`/s/${encodeURIComponent(data.personaId)}`);
    } catch {
      setState({ kind: 'error', message: 'the internet is having a moment' });
    }
  }

  const accent = '#ff67c8';
  const label =
    state.kind === 'loading'
      ? 'dialing in...'
      : state.kind === 'error'
        ? 'retry stumble'
        : 'Stumble';

  const busy = state.kind === 'loading';

  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
      <span
        style={{
          display: 'inline-block',
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          aria-busy={busy}
          style={{
            position: 'relative',
            display: 'inline-block',
            border: `2px solid ${accent}`,
            background: 'linear-gradient(180deg, #1a0f2e 0%, #0a0614 100%)',
            color: accent,
            fontFamily: 'Impact, sans-serif',
            fontSize: '1.35rem',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            padding: '16px 40px',
            cursor: 'inherit',
            textShadow: `0 0 8px ${accent}, 0 0 18px ${accent}`,
            boxShadow: `0 0 0 2px rgba(0,0,0,0.6), 0 0 28px ${accent}, inset 0 0 18px rgba(255,255,255,0.05)`,
            opacity: busy ? 0.7 : 1,
          }}
        >
          {label}
        </button>
      </span>
      {state.kind === 'error' ? (
        <p
          style={{
            margin: 0,
            fontFamily: '"Comic Sans MS", Comic Sans, cursive',
            color: '#fff16a',
            fontSize: '0.8rem',
            textShadow: '0 0 8px #fff16a',
          }}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
