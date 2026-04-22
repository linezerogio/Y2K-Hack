'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PresenceEntry } from '@geostumble/shared/jazz-schema';
import { usePersonaRoom, JAZZ_REGISTRY_ID } from '@/lib/jazz';
import { getStumbler } from '@/lib/stumbler';

type Props = { personaId: string };

const HEARTBEAT_MS = 10_000;
const ACTIVE_WINDOW_MS = 30_000;

/**
 * Writes a presence heartbeat every 10s keyed by the local stumbler id
 * and reads the current active count (entries seen in the last 30s).
 * Silently no-ops when Jazz is offline or `?nojazz=1` is set.
 */
export function PresencePill({ personaId }: Props) {
  const params = useSearchParams();
  const nojazz = params?.get('nojazz') === '1';
  const room = usePersonaRoom(personaId);

  useEffect(() => {
    if (nojazz || !room?.presence) return;
    const stumbler = getStumbler();

    const beat = () => {
      try {
        const now = new Date();
        const existing = (room.presence as unknown as Record<string, unknown>)[
          stumbler.id
        ];
        if (existing) {
          (existing as { $jazz: { set: (k: string, v: unknown) => void } }).$jazz.set(
            'lastSeen',
            now,
          );
        } else {
          const owner = room.presence.$jazz.owner;
          room.presence.$jazz.set(
            stumbler.id,
            PresenceEntry.create(
              { stumblerId: stumbler.id, lastSeen: now },
              owner ? { owner } : undefined,
            ),
          );
        }
      } catch {
        // ignore — best effort
      }
    };

    beat();
    const id = window.setInterval(beat, HEARTBEAT_MS);
    return () => window.clearInterval(id);
  }, [room, nojazz]);

  const activeCount = useMemo(() => {
    if (!room?.presence) return 0;
    const now = Date.now();
    let count = 0;
    for (const key of Object.keys(room.presence)) {
      const entry = (room.presence as unknown as Record<string, { lastSeen?: Date }>)[key];
      const ts =
        entry?.lastSeen instanceof Date ? entry.lastSeen.getTime() : 0;
      if (now - ts < ACTIVE_WINDOW_MS) count++;
    }
    return count;
  }, [room]);

  const jazzReady = Boolean(JAZZ_REGISTRY_ID) && !nojazz;
  const live = jazzReady && room != null;
  const label = !jazzReady
    ? 'offline'
    : room === undefined
      ? 'linking...'
      : room === null
        ? 'no room'
        : `${activeCount} stumbler${activeCount === 1 ? '' : 's'}`;

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
          background: live ? '#73efff' : '#806a9a',
          boxShadow: live ? '0 0 8px #73efff' : 'none',
        }}
      />
      {label}
    </span>
  );
}
