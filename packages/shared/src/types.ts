/**
 * Shared types across Worker (apps/worker) and Web (apps/web).
 * Worker is the source of truth; these mirror its response shapes.
 * Contract reference: docs/frontend-worker-integration.md §2, §5.
 */

/**
 * Response shape of GET /p/:id/meta. Worker-side cached 5s.
 * `status` is a snapshot/seed value — rebind to Jazz `PersonaRoom.status`
 * (or the SSE stream) after hydration for live updates.
 */
export interface PersonaMeta {
  personaId: string;
  name: string;
  era: string;
  version: number;
  muxPlaybackId: string | null;
  status: PersonaStatus;
}

/**
 * Status strings emitted by the Worker. `idle` means quiescent; anything
 * else means a tinker cycle is in flight. Substeps are colon-delimited
 * per docs/frontend-worker-integration.md §2 SSE example.
 */
export type PersonaStatus =
  | 'idle'
  | 'editing'
  | `editing:${string}`;

/** Response shape of GET /stumble. */
export interface StumbleResponse {
  personaId: string;
}

/** Response shape of GET /health. */
export interface HealthResponse {
  ok: boolean;
  personaCount: number;
  poolSize: number;
}
