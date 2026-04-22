import { co, z } from 'jazz-tools';

// Guestbook — anonymous stumblers post short notes to a persona's page.
// Owned by a group with `everyone: "writer"` so unauthenticated clients can push.
export const GuestbookEntry = co.map({
  author: z.string(),
  message: z.string(),
  color: z.string(),
  createdAt: z.date(),
});

export const GuestbookList = co.list(GuestbookEntry);

// Presence — one entry per stumbler, keyed by a localStorage-persisted id.
// Count = entries where `Date.now() - lastSeen < 30_000`.
// Known v1 debt: map grows monotonically; sweep is post-event cleanup.
export const PresenceEntry = co.map({
  stumblerId: z.string(),
  lastSeen: z.date(),
});

export const PresenceMap = co.record(z.string(), PresenceEntry);

// PersonaRoom — one per persona. Worker owns `status`; guestbook + presence
// are child CoValues with their own `everyone: writer` groups (per review
// finding #5 — Jazz has no field-level ACLs, so we split writes by CoValue).
export const PersonaRoom = co.map({
  personaId: z.string(),
  status: z.string(),
  guestbook: GuestbookList,
  presence: PresenceMap,
});

// RoomRegistry — single CoValue, keyed by personaId (e.g. "dave-001").
// Id is published to NEXT_PUBLIC_JAZZ_REGISTRY_ID + KV jazz:registry_id so
// both the worker and browser can discover rooms without a hardcoded table.
export const RoomRegistry = co.record(z.string(), PersonaRoom);
