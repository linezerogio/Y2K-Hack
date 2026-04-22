'use client';

/**
 * HeroAnimation
 *
 * Isolated sandbox for the intro animation that plays the first time you
 * land on an /s/[id] result after clicking Stumble. Fullscreen overlay that
 * blocks the page (pointer-events, z-index) until the animation finishes,
 * then unmounts itself so the underlying CRT shell can be interacted with.
 *
 * Swap variants by changing DEFAULT_VARIANT below, or pass `variant` as a
 * prop. To disable the animation entirely, comment out the import + render
 * line in ResultShell.tsx.
 */

import { useEffect, useRef, useState } from 'react';

type Variant = 'dialup' | 'warp' | 'scanlock' | 'channel';

const DEFAULT_VARIANT: Variant = 'dialup';
const DURATION_MS: Record<Variant, number> = {
  dialup: 2200,
  warp: 1600,
  scanlock: 1800,
  channel: 1400,
};

type Props = {
  variant?: Variant;
  onDone?: () => void;
};

export function HeroAnimation({ variant = DEFAULT_VARIANT, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const ms = DURATION_MS[variant];
    const t = window.setTimeout(() => {
      setVisible(false);
      onDoneRef.current?.();
    }, ms);
    return () => window.clearTimeout(t);
  }, [variant]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'all',
        background: '#000',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        fontFamily: '"Courier New", monospace',
        color: '#d3ffff',
      }}
    >
      <style>{KEYFRAMES}</style>
      {variant === 'dialup' && <DialupVariant />}
      {variant === 'warp' && <WarpVariant />}
      {variant === 'scanlock' && <ScanlockVariant />}
      {variant === 'channel' && <ChannelVariant />}
    </div>
  );
}

// --- variants ---------------------------------------------------------------

function DialupVariant() {
  return (
    <div
      style={{
        width: 'min(560px, 82vw)',
        border: '2px solid #ff67c8',
        background: 'linear-gradient(180deg, #1a0f2e 0%, #0a0614 100%)',
        padding: '20px 24px',
        textAlign: 'left',
        boxShadow: '0 0 24px rgba(255,103,200,0.55)',
        animation: 'heroFadeIn 240ms ease-out both, heroFadeOut 260ms ease-in 1940ms both',
      }}
    >
      <div
        style={{
          color: '#ff67c8',
          fontFamily: 'Impact, sans-serif',
          letterSpacing: '0.22em',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          textShadow: '0 0 8px #ff67c8',
          marginBottom: 14,
        }}
      >
        Dialing In...
      </div>
      <pre
        style={{
          margin: 0,
          color: '#d3ffff',
          fontSize: '0.82rem',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          animation: 'heroTypeReveal 1600ms steps(40, end) 220ms both',
          overflow: 'hidden',
        }}
      >
{`> ATDT 1-800-STUMBLE
> CONNECTING at 56.6 kbps...
> HANDSHAKE: ~~~*~~~ OK
> LOADING GEOCITY NEIGHBORHOOD...`}
      </pre>
      <div
        style={{
          marginTop: 14,
          height: 10,
          border: '1px solid #c89eff',
          background: '#0a0614',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            background:
              'repeating-linear-gradient(90deg, #ff67c8 0 12px, #7e2fc5 12px 24px)',
            transform: 'translateX(-100%)',
            animation: 'heroProgress 1800ms ease-in-out 200ms forwards',
          }}
        />
      </div>
    </div>
  );
}

function WarpVariant() {
  const stars = Array.from({ length: 80 });
  return (
    <>
      {stars.map((_, i) => {
        const angle = (i / stars.length) * Math.PI * 2;
        const delay = (i % 10) * 30;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 2,
              height: 2,
              background: '#fff16a',
              boxShadow: '0 0 6px #fff16a',
              transformOrigin: '0 0',
              // @ts-expect-error css custom property
              '--dx': `${Math.cos(angle)}`,
              '--dy': `${Math.sin(angle)}`,
              animation: `heroWarp 1600ms cubic-bezier(0.6,0,0.9,0.3) ${delay}ms both`,
            }}
          />
        );
      })}
      <div
        style={{
          position: 'relative',
          color: '#ff67c8',
          fontFamily: 'Impact, sans-serif',
          letterSpacing: '0.3em',
          fontSize: '1.6rem',
          textTransform: 'uppercase',
          textShadow: '0 0 12px #ff67c8, 0 0 28px #ff67c8',
          animation: 'heroFadeIn 300ms ease-out both, heroFadeOut 260ms ease-in 1300ms both',
        }}
      >
        Stumbling
      </div>
    </>
  );
}

function ScanlockVariant() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, transparent 1px, transparent 4px)',
          animation: 'heroFadeIn 240ms ease-out both',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 4,
          background: 'linear-gradient(90deg, transparent, #d3ffff, transparent)',
          boxShadow: '0 0 18px #d3ffff',
          animation: 'heroScanline 1400ms linear 120ms both',
        }}
      />
      <div
        style={{
          position: 'relative',
          fontFamily: 'Impact, sans-serif',
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: '#d3ffff',
          textShadow: '0 0 10px #d3ffff',
          fontSize: '1.2rem',
          animation: 'heroFadeIn 400ms ease-out both, heroFadeOut 260ms ease-in 1480ms both',
        }}
      >
        Locking Signal
      </div>
    </>
  );
}

function ChannelVariant() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          opacity: 0.35,
          animation: 'heroStatic 120ms steps(3) infinite',
        }}
      />
      <div
        style={{
          position: 'relative',
          border: '2px solid #fff16a',
          padding: '10px 18px',
          color: '#fff16a',
          fontFamily: 'Impact, sans-serif',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textShadow: '0 0 10px #fff16a',
          background: 'rgba(0,0,0,0.7)',
          animation: 'heroFadeIn 200ms ease-out both, heroFadeOut 240ms ease-in 1160ms both',
        }}
      >
        CH 07 — TUNING
      </div>
    </>
  );
}

// --- keyframes --------------------------------------------------------------

const KEYFRAMES = `
@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heroFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes heroTypeReveal {
  from { max-height: 0; }
  to { max-height: 200px; }
}
@keyframes heroProgress {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@keyframes heroWarp {
  from { transform: translate(0, 0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  to {
    transform: translate(calc(var(--dx) * 70vmax), calc(var(--dy) * 70vmax)) scale(2.4);
    opacity: 0;
  }
}
@keyframes heroScanline {
  from { top: 0; }
  to { top: 100%; }
}
@keyframes heroStatic {
  0% { transform: translate(0, 0); }
  33% { transform: translate(-1px, 1px); }
  66% { transform: translate(1px, -1px); }
  100% { transform: translate(0, 0); }
}
`;
