'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { personaStatusStreamUrl } from '@/lib/worker';
import type { PersonaStatus } from '@geostumble/shared/types';
import { JAZZ_REGISTRY_ID, usePersonaRoom } from '@/lib/jazz';

type Props = {
  personaId: string;
  /** Seed value from /p/:id/meta so first paint isn't empty. */
  initialStatus?: PersonaStatus;
};

/**
 * UNDER CONSTRUCTION banner.
 *
 * Primary source: PersonaRoom.status via Jazz. Fallback: the Worker's
 * SSE stream at `/p/:id/stream`. The fallback runs when any of these
 * hold:
 *   - `NEXT_PUBLIC_JAZZ_REGISTRY_ID` is missing
 *   - the query string has `?nojazz=1`
 *   - the Jazz room hasn't loaded yet (still undefined/null)
 *
 * Project.md §17 keeps SSE authoritative for the demo so a cold Jazz
 * peer never blocks the construction animation.
 */
export function StatusBanner({ personaId, initialStatus }: Props) {
  const params = useSearchParams();
  const nojazz = params?.get('nojazz') === '1';

  const jazzEnabled = Boolean(JAZZ_REGISTRY_ID) && !nojazz;
  const room = usePersonaRoom(personaId);
  const jazzStatus = (room?.status as PersonaStatus | undefined) ?? null;

  const [sseStatus, setSseStatus] = useState<PersonaStatus>(
    initialStatus ?? 'idle',
  );
  const [sseConnected, setSseConnected] = useState(false);

  // Need SSE when Jazz is disabled or still linking up.
  const useSSE = !jazzEnabled || jazzStatus === null;

  useEffect(() => {
    if (!useSSE) return;
    const es = new EventSource(personaStatusStreamUrl(personaId));
    const onStatus = (e: MessageEvent) => {
      setSseStatus((e.data as PersonaStatus) ?? 'idle');
    };
    const onOpen = () => setSseConnected(true);
    const onError = () => setSseConnected(false);
    es.addEventListener('status', onStatus as EventListener);
    es.addEventListener('open', onOpen);
    es.addEventListener('error', onError);
    return () => {
      es.removeEventListener('status', onStatus as EventListener);
      es.removeEventListener('open', onOpen);
      es.removeEventListener('error', onError);
      es.close();
    };
  }, [personaId, useSSE]);

  const status: PersonaStatus = jazzStatus ?? sseStatus;
  const isEditing = status !== 'idle';
  const substep =
    typeof status === 'string' && status.startsWith('editing:')
      ? status.slice('editing:'.length)
      : null;

  const source: string = jazzEnabled && jazzStatus !== null
    ? '● jazz'
    : sseConnected
      ? '● sse'
      : '○ link';

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
        title={
          jazzEnabled && jazzStatus !== null
            ? 'Jazz live'
            : sseConnected
              ? 'SSE live'
              : 'SSE reconnecting'
        }
        style={{
          marginLeft: 'auto',
          fontSize: '0.62rem',
          letterSpacing: '0.1em',
          opacity: 0.7,
        }}
      >
        {source}
      </span>
    </div>
  );
}
