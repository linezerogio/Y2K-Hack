'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { personaIframeSrc } from '@/lib/worker';
import type { PersonaMeta } from '@geostumble/shared/types';
import { CrtFrame } from './CrtFrame';
import { Guestbook } from './Guestbook';
// import { HeroAnimation } from './HeroAnimation'; // uncomment to enable intro animation
import { PresencePill } from './PresencePill';
import { RealPlayerClip } from './RealPlayerClip';
import { StatusBanner } from './StatusBanner';

type Props = {
  meta: PersonaMeta;
};

export function ResultShell({ meta }: Props) {
  const router = useRouter();
  const [stumbling, setStumbling] = useState(false);
  const iframeUrl = personaIframeSrc(meta.personaId, meta.version);

  async function stumbleAgain() {
    if (stumbling) return;
    setStumbling(true);
    try {
      const res = await fetch('/api/stumble', { cache: 'no-store' });
      if (!res.ok) {
        setStumbling(false);
        return;
      }
      const data = (await res.json()) as { personaId: string };
      if (data.personaId === meta.personaId) {
        // Stumbled to the same persona. Force a re-navigation anyway so the
        // iframe reloads with the current version string.
        router.refresh();
      } else {
        router.push(`/s/${encodeURIComponent(data.personaId)}`);
      }
    } finally {
      setStumbling(false);
    }
  }

  const topBar = (
    <>
      <span
        style={{
          display: 'inline-block',
          cursor: stumbling ? 'wait' : 'pointer',
        }}
      >
        <button
          type="button"
          onClick={stumbleAgain}
          disabled={stumbling}
          aria-busy={stumbling}
          style={{
            background: 'linear-gradient(180deg, #ff67c8 0%, #7e2fc5 100%)',
            border: '2px solid #3f165d',
            color: '#fff8dc',
            font: '700 0.72rem Tahoma, Verdana, sans-serif',
            letterSpacing: '0.1em',
            padding: '7px 12px',
            cursor: 'inherit',
            textTransform: 'uppercase',
            opacity: stumbling ? 0.7 : 1,
          }}
        >
          {stumbling ? 'dialing...' : 'Stumble Again'}
        </button>
      </span>
      <span>
        {meta.name} <span style={{ opacity: 0.7 }}>- {meta.era}</span>
      </span>
      <span style={{ opacity: 0.7 }}>v{meta.version}</span>
      <PresencePill personaId={meta.personaId} />
    </>
  );

  return (
    <CrtFrame topBar={topBar}>
      {/* <HeroAnimation /> */} {/* uncomment to enable intro animation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '7fr 3fr',
          gap: 14,
          padding: 14,
          background: '#040913',
        }}
      >
        <div
          style={{
            border: '2px solid #c89eff',
            boxShadow:
              '0 0 0 2px #02050b, 0 0 28px rgba(200,158,255,0.46)',
            background:
              'radial-gradient(circle at 50% 30%, #2c1f51 0%, #090815 90%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: '44px 1fr',
          }}
        >
          <StatusBanner personaId={meta.personaId} initialStatus={meta.status} />
          <div style={{ position: 'relative', padding: 12 }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 12,
                pointerEvents: 'none',
                border: '1px solid rgba(255,255,255,0.22)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 46%), repeating-linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
              }}
            />
            <div
              style={{
                position: 'relative',
                height: '100%',
                border: '2px solid rgba(255,255,255,0.4)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 1,
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#d3ffff',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  padding: '4px 6px',
                  textTransform: 'uppercase',
                }}
              >
                {meta.personaId}
              </div>
              <iframe
                title={`GeoStumble persona ${meta.personaId}`}
                src={iframeUrl}
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  background: '#000',
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            border: '2px solid #8f74b3',
            background: 'linear-gradient(180deg, #2d1d45 0%, #140d22 100%)',
            color: '#f5edd6',
            display: 'grid',
            gridTemplateRows: meta.muxPlaybackId ? '1fr 170px' : '1fr',
            minHeight: 0,
          }}
        >
          <div
            style={{
              borderBottom: meta.muxPlaybackId
                ? '2px solid rgba(0,0,0,0.45)'
                : 'none',
              padding: 12,
            }}
          >
            <Guestbook personaId={meta.personaId} />
          </div>
          {meta.muxPlaybackId ? (
            <div style={{ padding: 12 }}>
              <RealPlayerClip muxPlaybackId={meta.muxPlaybackId} />
            </div>
          ) : null}
        </div>
      </div>
    </CrtFrame>
  );
}
