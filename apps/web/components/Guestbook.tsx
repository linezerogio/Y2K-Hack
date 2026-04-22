'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { GuestbookEntry } from '@geostumble/shared/jazz-schema';
import { usePersonaRoom, JAZZ_REGISTRY_ID } from '@/lib/jazz';
import { getStumbler } from '@/lib/stumbler';

type Props = { personaId: string };

const MAX_LEN = 140;

/**
 * Guestbook panel. Reads entries from the PersonaRoom's guestbook
 * CoList and writes new ones via `$jazz.push`. Falls back to an
 * on-brand offline card whenever the registry id is missing, the
 * room hasn't synced, or the user passed `?nojazz=1`.
 */
export function Guestbook({ personaId }: Props) {
  const params = useSearchParams();
  const nojazz = params?.get('nojazz') === '1';

  const room = usePersonaRoom(personaId);

  const [message, setMessage] = useState('');
  const [name, setName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entries = useMemo(() => {
    if (!room?.guestbook) return [];
    return [...room.guestbook]
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .sort((a, b) => {
        const at = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bt = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bt - at;
      })
      .slice(0, 20);
  }, [room]);

  if (!JAZZ_REGISTRY_ID || nojazz) {
    return <Offline reason={nojazz ? 'nojazz flag' : 'registry not seeded'} />;
  }

  if (room === undefined) {
    return <Label>connecting to room for {personaId}...</Label>;
  }

  if (room === null) {
    return <Offline reason="no room for this persona" />;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const trimmed = message.trim();
    if (!trimmed) return;
    if (!room?.guestbook) return;

    setSubmitting(true);
    setError(null);
    try {
      const stumbler = getStumbler();
      // Inherit the public-writer group from the parent list so the new
      // entry is writable by the same set (no active-account required
      // on the anon browser client).
      const owner = room.guestbook.$jazz.owner;
      room.guestbook.$jazz.push(
        GuestbookEntry.create(
          {
            author: name.trim() || 'anon',
            message: trimmed.slice(0, MAX_LEN),
            color: stumbler.color,
            createdAt: new Date(),
          },
          owner ? { owner } : undefined,
        ),
      );
      setMessage('');
    } catch (err) {
      setError((err as Error).message ?? 'push failed');
    } finally {
      setSubmitting(false);
    }
  }

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
        Guestbook Live
      </p>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.34)',
          background: 'rgba(0,0,0,0.42)',
          padding: 10,
          font: '0.78rem/1.45 "Courier New", monospace',
          display: 'grid',
          gap: 6,
          minHeight: 110,
          maxHeight: 170,
          overflowY: 'auto',
          color: '#cdb8e8',
        }}
      >
        {entries.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.65 }}>
            be the first to sign the guestbook
          </p>
        ) : (
          entries.map((entry, i) => (
            <p
              key={entry.$jazz?.id ?? i}
              style={{ margin: 0, color: '#f5edd6', wordBreak: 'break-word' }}
            >
              <span style={{ color: entry.color, fontWeight: 700 }}>
                {entry.author}:
              </span>{' '}
              {entry.message}
            </p>
          ))
        )}
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 6,
          marginTop: 10,
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 24))}
          placeholder="your handle"
          maxLength={24}
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#f5edd6',
            padding: '6px 8px',
            font: '0.78rem "Courier New", monospace',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            placeholder="leave a note"
            maxLength={MAX_LEN}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#f5edd6',
              padding: '6px 8px',
              font: '0.78rem "Courier New", monospace',
            }}
          />
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            style={{
              background: 'linear-gradient(180deg, #73efff 0%, #2aa7c5 100%)',
              border: '2px solid #1b4a5d',
              color: '#06131a',
              font: '700 0.72rem Tahoma, Verdana, sans-serif',
              letterSpacing: '0.1em',
              padding: '6px 12px',
              cursor: submitting ? 'progress' : 'pointer',
              textTransform: 'uppercase',
              opacity: submitting || !message.trim() ? 0.55 : 1,
            }}
          >
            {submitting ? '...' : 'Sign'}
          </button>
        </div>
        <p
          style={{
            margin: 0,
            font: '0.7rem Tahoma, Verdana, sans-serif',
            color: '#cdb8e8',
            opacity: 0.8,
          }}
        >
          {MAX_LEN - message.length} chars left - sync ~3s
          {error ? <span style={{ color: '#ff8a8a' }}> - {error}</span> : null}
        </p>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
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
        Guestbook
      </p>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.34)',
          background: 'rgba(0,0,0,0.42)',
          padding: 10,
          font: '0.78rem/1.45 "Courier New", monospace',
          minHeight: 110,
          color: '#cdb8e8',
        }}
      >
        <p style={{ margin: 0, opacity: 0.7 }}>{children}</p>
      </div>
    </div>
  );
}

function Offline({ reason }: { reason: string }) {
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
        Guestbook Offline
      </p>
      <div
        style={{
          border: '1px solid rgba(255,255,255,0.34)',
          background: 'rgba(0,0,0,0.42)',
          padding: 10,
          font: '0.78rem/1.45 "Courier New", monospace',
          display: 'grid',
          gap: 6,
          minHeight: 110,
          color: '#cdb8e8',
        }}
      >
        <p style={{ margin: 0, opacity: 0.7 }}>guestbook unavailable</p>
        <p style={{ margin: 0, opacity: 0.5, fontSize: '0.7rem' }}>({reason})</p>
      </div>
    </div>
  );
}
