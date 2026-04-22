'use client';

/**
 * Placeholder until Jazz registry is seeded (Phase 0.5 + Phase 4.1).
 * Once NEXT_PUBLIC_JAZZ_REGISTRY_ID is non-empty and a PersonaRoom exists,
 * swap this to `useCoState(PersonaRoom, roomId).guestbook` and enable the
 * <form onSubmit> write path.
 *
 * Contract owner: Implementation/Jazz/v1-proposal.md §6
 */
type Props = { personaId: string };

export function Guestbook({ personaId }: Props) {
  const jazzReady = Boolean(process.env.NEXT_PUBLIC_JAZZ_REGISTRY_ID);

  return (
    <div>
      <p
        style={{
          margin: '0 0 10px',
          fontFamily: 'Verdana, sans-serif',
          fontSize: '0.74rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#ff9f1a',
        }}
      >
        Guestbook {jazzReady ? 'Live' : 'Offline'}
      </p>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.34)',
          background: 'rgba(0,0,0,0.42)',
          padding: 10,
          font: '0.78rem/1.45 "Courier New", monospace',
          display: 'grid',
          gap: 8,
          minHeight: 110,
          color: '#cdb8e8',
        }}
      >
        {jazzReady ? (
          <p style={{ margin: 0, opacity: 0.7 }}>
            connecting to room for <strong>{personaId}</strong>...
          </p>
        ) : (
          <>
            <p style={{ margin: 0, opacity: 0.7 }}>
              guestbook is offline - Jazz registry not yet seeded
            </p>
            <p style={{ margin: 0, opacity: 0.55, fontSize: '0.7rem' }}>
              (Phase 0.5 of Cloudflare/Jazz tracker)
            </p>
          </>
        )}
      </div>
      <p
        style={{
          margin: '10px 0 0',
          font: '0.7rem Tahoma, Verdana, sans-serif',
          color: '#cdb8e8',
        }}
      >
        140 chars max - sync debounce 3s
      </p>
    </div>
  );
}
