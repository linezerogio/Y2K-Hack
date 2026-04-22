'use client';

import { useEffect, useState } from 'react';
import { personaStatusStreamUrl } from '@/lib/worker';
import type { PersonaStatus } from '@geostumble/shared/types';

type Props = {
  personaId: string;
  /** Seed value from /p/:id/meta so first paint isn't empty. */
  initialStatus?: PersonaStatus;
};

/**
 * Subscribes to the Worker's SSE stream at /p/:id/stream and renders the
 * UNDER CONSTRUCTION bar when status is anything other than "idle".
 *
 * This is the pre-Jazz path: once PersonaRoom.status is wired in Phase 4,
 * swap the EventSource subscription for a Jazz useCoState hook and keep
 * the same visual treatment.
 */
export function StatusBanner({ personaId, initialStatus }: Props) {
  const [status, setStatus] = useState<PersonaStatus>(initialStatus ?? 'idle');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(personaStatusStreamUrl(personaId));

    const onStatus = (e: MessageEvent) => {
      setStatus((e.data as PersonaStatus) ?? 'idle');
    };
    const onOpen = () => setConnected(true);
    const onError = () => setConnected(false);

    es.addEventListener('status', onStatus as EventListener);
    es.addEventListener('open', onOpen);
    es.addEventListener('error', onError);

    return () => {
      es.removeEventListener('status', onStatus as EventListener);
      es.removeEventListener('open', onOpen);
      es.removeEventListener('error', onError);
      es.close();
    };
  }, [personaId]);

  const isEditing = status !== 'idle';
  const substep = typeof status === 'string' && status.startsWith('editing:')
    ? status.slice('editing:'.length)
    : null;

  return (
    <div
      style={{
        background: isEditing
          ? 'linear-gradient(90deg, #fff16a 0%, #ff67c8 50%, #7e2fc5 100%)'
          : 'linear-gradient(90deg, rgba(255,241,106,0.18) 0%, rgba(255,103,200,0.18) 50%, rgba(126,47,197,0.18) 100%)',
        color: isEditing ? '#1f0f2f' : '#c89eff',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        font: '700 0.72rem "Courier New", monospace',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        height: 44,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isEditing ? '#fff16a' : '#444',
          boxShadow: isEditing ? '0 0 8px #fff16a' : 'none',
          animation: isEditing
            ? 'geostumble-blink 0.9s steps(2, start) infinite'
            : 'none',
        }}
      />
      {isEditing ? (
        <span>
          UNDER CONSTRUCTION
          {substep ? ` - ${substep}` : ' - editing'}
        </span>
      ) : (
        <span>idle - page is settled</span>
      )}
      <span
        title={connected ? 'SSE live' : 'SSE reconnecting'}
        style={{
          marginLeft: 'auto',
          fontSize: '0.62rem',
          letterSpacing: '0.1em',
          opacity: 0.7,
        }}
      >
        {connected ? '● live' : '○ link'}
      </span>
    </div>
  );
}
