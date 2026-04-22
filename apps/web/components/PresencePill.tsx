'use client';

/**
 * Placeholder until Jazz PresenceMap wiring lands (Phase 4.1).
 * Renders a "disconnected" pill that slots into the silver top bar.
 */
export function PresencePill() {
  const jazzReady = Boolean(process.env.NEXT_PUBLIC_JAZZ_REGISTRY_ID);

  return (
    <span
      style={{
        marginLeft: 'auto',
        display: 'inline-flex',
        gap: 8,
        alignItems: 'center',
        fontFamily: 'Tahoma, Verdana, sans-serif',
        fontSize: '0.72rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#1b1330',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: jazzReady ? '#73efff' : '#806a9a',
          boxShadow: jazzReady ? '0 0 8px #73efff' : 'none',
        }}
      />
      {jazzReady ? 'presence pending' : 'offline'}
    </span>
  );
}
