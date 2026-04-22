'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

/**
 * Dynamically imported so the ~250kB Mux player stays out of the
 * initial bundle. Only personas with a `muxPlaybackId` render this
 * component at all (see ResultShell), so the import is effectively
 * scoped to the "Making Of" panel.
 */
const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <p style={{ margin: 0, color: '#b4bed1', fontSize: '0.7rem' }}>
        loading tape...
      </p>
    ),
  },
);

type Props = {
  muxPlaybackId: string | null;
};

/**
 * "Making Of" clip. Wrapped in a RealPlayer-8-ish chrome (chrome
 * described in project.md §13). Muted by default + explicit Play so
 * the demo never starts audio on page load.
 */
export function RealPlayerClip({ muxPlaybackId }: Props) {
  const [playing, setPlaying] = useState(false);

  if (!muxPlaybackId) return null;

  return (
    <div>
      <p
        style={{
          margin: '0 0 8px',
          fontFamily: 'Verdana, sans-serif',
          fontSize: '0.72rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#fff16a',
        }}
      >
        Making Of
      </p>
      <div
        style={{
          border: '2px solid #c89eff',
          background:
            'linear-gradient(180deg, #3a3054 0%, #1a1226 100%)',
          padding: 8,
          boxShadow:
            'inset 0 0 0 1px rgba(255,255,255,0.18), 0 0 14px rgba(200,158,255,0.25)',
          display: 'grid',
          gap: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'Tahoma, Verdana, sans-serif',
            fontSize: '0.66rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#1b1330',
            background:
              'linear-gradient(180deg, #e4dff2 0%, #b5a6d4 100%)',
            padding: '3px 7px',
            border: '1px solid #5a4780',
          }}
        >
          <span>RealPlayer 8 - geostumble.rm</span>
          <span style={{ opacity: 0.75 }}>- _ x</span>
        </div>
        <div
          style={{
            position: 'relative',
            background: '#000',
            border: '1px solid rgba(255,255,255,0.18)',
            minHeight: 120,
            imageRendering: 'pixelated',
          }}
        >
          <MuxPlayer
            playbackId={muxPlaybackId}
            streamType="on-demand"
            muted
            autoPlay={false}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              display: 'block',
            }}
            metadata={{
              video_title: 'making of',
              player_name: 'geostumble-realplayer',
            }}
          />
        </div>
        <p
          style={{
            margin: 0,
            font: '0.66rem Tahoma, Verdana, sans-serif',
            color: '#cdb8e8',
            letterSpacing: '0.06em',
          }}
        >
          {playing ? 'playing - 28.8 kbps' : 'press play to rewind tape'}
        </p>
      </div>
    </div>
  );
}
