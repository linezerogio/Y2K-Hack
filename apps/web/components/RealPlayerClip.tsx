/**
 * "Making Of" panel. Renders nothing when muxPlaybackId is null so the
 * sidebar doesn't show a broken embed during Phase 5 rollout.
 *
 * When Phase 5 lands and a playbackId shows up, this component will be
 * upgraded to lazy-import @mux/mux-player-react wrapped in the RealPlayer
 * 8 table chrome (see Implementation/Mux + project.md §13).
 */
type Props = {
  muxPlaybackId: string | null;
};

export function RealPlayerClip({ muxPlaybackId }: Props) {
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
          border: '2px solid rgba(255,255,255,0.28)',
          background: 'linear-gradient(180deg, #1f2638 0%, #0e1320 100%)',
          padding: 10,
          fontFamily: 'Tahoma, Verdana, sans-serif',
          fontSize: '0.76rem',
          lineHeight: 1.45,
        }}
      >
        <p style={{ margin: '0 0 6px', color: '#d3ffff' }}>
          RealPlayer (muted) - playbackId {muxPlaybackId}
        </p>
        <p style={{ margin: 0, color: '#b4bed1' }}>
          rewinding tape... @mux/mux-player-react wiring ships in Phase 5.
        </p>
      </div>
    </div>
  );
}
