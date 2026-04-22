'use client';

import { useCoState } from 'jazz-tools/react';
import { JazzReactProvider } from 'jazz-tools/react';
import { type ReactNode } from 'react';
import {
  PersonaRoom,
  RoomRegistry,
} from '@geostumble/shared/jazz-schema';

/**
 * Value of `NEXT_PUBLIC_JAZZ_REGISTRY_ID` — set to the RoomRegistry
 * CoValue id produced by `scripts/seed-jazz-rooms.ts`.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time; centralising
 * the read here keeps the fallback rendering easy to audit.
 */
export const JAZZ_REGISTRY_ID: string =
  process.env.NEXT_PUBLIC_JAZZ_REGISTRY_ID ?? '';

const JAZZ_PEER: `wss://${string}` =
  (process.env.NEXT_PUBLIC_JAZZ_PEER as `wss://${string}`) ??
  'wss://cloud.jazz.tools/sync';

/**
 * Root-level Jazz provider. Mounted client-side only because `enableSSR`
 * forces guest mode (no anonymous account → writes fail with "No active
 * account"). We'd rather pay a first-paint flicker on the persona page
 * than lose the guestbook write path. During SSR / before mount the
 * children render untouched; the `usePersonaRoom` hook then returns
 * `undefined` until the client provider wakes up, which all three
 * Jazz-consuming components already handle.
 */
export function JazzClientProvider({ children }: { children: ReactNode }) {
  return (
    <JazzReactProvider sync={{ peer: JAZZ_PEER }} enableSSR>
      {children}
    </JazzReactProvider>
  );
}

/**
 * Hand-rolled shape of a deeply-loaded PersonaRoom.
 *
 * Background: jazz-tools 0.20.17 can't resolve our schema's
 * `guestbook`/`presence` keys to CoValues at the type level — both
 * `Loaded<typeof PersonaRoom, …>` and `co.loaded<typeof GuestbookEntry>`
 * collapse to `never`. The runtime works fine because the actual proxy
 * objects honor the schema; only the static types are broken. We model
 * the shape by hand so consumers (Guestbook, PresencePill, StatusBanner)
 * still get useful autocomplete instead of `never`.
 *
 * If a future jazz-tools version fixes the `Loaded<>` derivation, we can
 * replace these interfaces with the native generic.
 */
export interface GuestbookEntryLoaded {
  author: string;
  message: string;
  color: string;
  createdAt: Date;
  $jazz: { id: string };
}

export interface PresenceEntryLoaded {
  stumblerId: string;
  lastSeen: Date;
  $jazz: { id: string };
}

interface JazzListMeta<T> {
  // `Account | Group` from jazz-tools; typed loose so consumers can pass it
  // straight to `Foo.create(init, { owner })` without re-importing the union.
  owner: never;
  push(entry: T): void;
}

interface JazzRecordMeta<T> {
  // `Account | Group` from jazz-tools; typed loose so consumers can pass it
  // straight to `Foo.create(init, { owner })` without re-importing the union.
  owner: never;
  set(key: string, value: T): void;
}

export type GuestbookListLoaded = ReadonlyArray<GuestbookEntryLoaded | null> & {
  $jazz: JazzListMeta<GuestbookEntryLoaded>;
};

export type PresenceMapLoaded = Record<string, PresenceEntryLoaded | undefined> & {
  $jazz: JazzRecordMeta<PresenceEntryLoaded>;
};

export interface PersonaRoomLoaded {
  personaId: string;
  status: string;
  guestbook: GuestbookListLoaded;
  presence: PresenceMapLoaded;
  $jazz: { id: string };
}

/**
 * Two-step load:
 *   1) subscribe to the RoomRegistry (shallow)
 *   2) subscribe to the specific PersonaRoom by id, with guestbook +
 *      presence fully loaded
 *
 * Returns:
 *   - `undefined` while loading
 *   - `null` when the registry id isn't set, the registry failed to load,
 *     or no room exists for this personaId
 */
export function usePersonaRoom(
  personaId: string,
): PersonaRoomLoaded | null | undefined {
  const registry = useCoState(RoomRegistry, JAZZ_REGISTRY_ID || undefined);

  // Dynamic key lookup — `registry[personaId]` on a CoRecord proxy
  // returns a ref stub (or undefined) without triggering a deep load.
  const roomRef =
    registry && registry !== null
      ? (registry as unknown as Record<string, { $jazz: { id: string } } | undefined>)[personaId]
      : undefined;
  const roomId = roomRef?.$jazz?.id;

  // Resolve query types in jazz-tools 0.20.17 reject our nested-collection
  // shape (see PersonaRoomLoaded comment). Cast to satisfy useCoState; the
  // runtime accepts and honors the resolve correctly.
  const room = useCoState(PersonaRoom, roomId, {
    resolve: { guestbook: { $each: true }, presence: { $each: true } } as never,
  });

  if (!JAZZ_REGISTRY_ID) return null;
  if (registry === undefined) return undefined;
  if (registry === null) return null;
  if (!roomId) return null;
  if (room === undefined) return undefined;
  if (room === null) return null;
  return room as unknown as PersonaRoomLoaded;
}
