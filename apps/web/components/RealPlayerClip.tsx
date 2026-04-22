'use client';

import MuxPlayer from '@mux/mux-player-react';

type Props = {
  playbackId: string | null;
  personaName: string;
  envKey?: string;
};

export function RealPlayerClip({ playbackId, personaName, envKey }: Props) {
  if (!playbackId) return null;

  return (
    <div className="realplayer">
      <div className="realplayer-titlebar">
        <span>📡 RealPlayer G2 — making-of.rm</span>
        <span className="realplayer-titlebar-buttons">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </div>
      <div className="realplayer-body">
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay={false}
          muted
          loop
          primaryColor="#00ff00"
          secondaryColor="#000080"
          metadata={{
            video_title: `agent-session — ${personaName}`,
            ...(envKey ? { env_key: envKey } : {}),
          }}
        />
      </div>
      <div className="realplayer-statusbar">
        <span>{personaName}.rm</span>
        <span className="blink">● LIVE</span>
      </div>
    </div>
  );
}
