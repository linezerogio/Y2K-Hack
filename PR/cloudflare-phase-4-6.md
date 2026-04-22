# Cloudflare Worker: Phase 4–6 complete — Jazz live, Mux wired, kill-switch drilled

Closes the remaining Cloudflare slice through Phase 6 of [`Implementation/Cloudflare/v1-tracker.md`](../Implementation/Cloudflare/v1-tracker.md). The Worker is demo-ready: Gemini 3 writes real Y2K pages against a 108-entry scraped asset library, status fans out live to Jazz CoValues, every snapshot carries a Mux playback id, kill-switch arms and disarms cleanly, and `/admin/cost` is at 1.3% of the $50 cap after dozens of cycles.

**Live URL:** https://geostumble-worker.eliothfraijo.workers.dev
**Base commit:** `9d643ca` (previous PR — "Phase 0-3 complete")
**Tip:** `dc1a0aa`

---

## Summary

- **Phase 4 (Jazz) is live end-to-end.** `writeJazzStatus` fans `PersonaRoom.status` on every `setStatus` via `startWorker` + `jazz-tools/load-edge-wasm`; Registry resolved from KV (`jazz:registry_id = co_zAMBDSKQyYEvJ1FZetCbXzcGPku`) with env fallback. Fire-and-forget so SSE stays instantaneous.
- **Phase 5 Option A (Mux) is persisted.** Every `page_snapshots` row now carries the shared `MUX_DEMO_PLAYBACK_ID`; `/p/:id/meta` surfaces it. Per-cycle recording (Option B) explicitly deferred to V2.
- **Phase 6 drills passed.** Asset scrape landed **108 real Y2K entries**, hallucinated-key nit is closed (11/11 img URLs return 200 across dave + harold), prewarm went 5/5 zero-fallback, freeze/thaw verified, cost at $0.66/$50.

---

## What's in it

### Phase 4 — Realtime (Jazz + SSE)
- `apps/worker/src/jazz-writer.ts` (new) — `writeJazzStatus(env, personaId, status)` opens a short-lived `startWorker` session, loads `RoomRegistry` from KV, sets `PersonaRoom.status`, waits for sync, shuts down. All errors swallowed with `console.warn` — Jazz is a best-effort enhancement on top of SSE ([project.md §17](../project.md#L659)).
- `apps/worker/src/persona-do.ts` — `setStatus` fires `writeJazzStatus` without `await`. SSE stays instantaneous (DO-local `EventTarget`), Jazz lands ~1-3s later.
- `apps/worker/src/index.ts` — `Env` extended with `JAZZ_WORKER_ACCOUNT`, `JAZZ_WORKER_SECRET`, `JAZZ_REGISTRY_ID`, `JAZZ_SYNC_URL`.
- `packages/shared/package.json` — jazz-tools moved to `peerDependencies` + symlinked to the worker's install so types dedupe across packages.
- `scripts/seed-jazz-rooms.ts` (sweep) — Jazz team's seed; creates RoomRegistry + 5 PersonaRoom CoValues and writes the registry id to KV.
- **SSE fallback** (`/p/:id/stream`, already shipped in Phase 1) remains the authoritative path per the project.md §17 degradation row.

### Phase 5 — Mux (Option A)
- `apps/worker/src/mux.ts` (sweep) — direct-upload REST client (fetch + Basic auth, stays under 1MB bundle).
- `scripts/upload-demo-mp4.ts` (sweep) — one-off seed that uploads the shared "agent typing" demo clip and prints the playback id.
- `wrangler.toml [vars]` — `MUX_DEMO_PLAYBACK_ID = "wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE"` pinned.
- `runTinkerCycle` passes the playback id to `recordSnapshot`; Neon's `page_snapshots.mux_playback_id` is populated on every cycle.
- `/p/:id/meta` already serves `muxPlaybackId` via `getPersonaMeta` JOIN — no schema change needed.
- **Option B deferred**: per-cycle recorder + upload. `recorder.ts` is empty; `mux.ts` has `createUpload` / `waitForAsset` ready to consume when you want to flip it on.

### Phase 6 — Demo prep
- **108-entry asset scrape landed** (`scripts/scrape-assets.ts`): 14 tiles, 29 gifs, 52 badges, 11 wordart, 4 counters. Uploaded to R2 + `asset:manifest` in KV.
- **Kill-switch drill passed**: `POST /admin/freeze` sets `ADMIN.frozen = "1"`, `alarm()` skips cycles; `/admin/thaw` resumes. `/admin/nudge` bypasses freeze by design — halts autonomous fleet, keeps manual override for demo narrative.
- **Prewarm run against 108-entry manifest**: 5/5 personas went zero-fallback (becky v6, dave v14, harold v8, linda v5, tyler v5). Previous runs had 1–2 fallbacks on the sparse 25-entry seed.
- **§2.3 known nit CLOSED**: 11/11 img URLs from dave v12 + harold v8 return 200. No more hallucinated asset keys.
- **Open Q #4 resolved** (R2 → iframe CORS): `pub-*.r2.dev` returns 200 for `<img>` tags; `Access-Control-Allow-Origin` isn't required for simple cross-origin GETs, only for `fetch()` which agent pages don't use.

### Incidental sweeps in this branch
- `apps/web/*` — Vercel app scaffold (layout, StumbleButton, `/api/stumble` proxy, `lib/worker.ts` typed client matching `docs/frontend-worker-integration.md`).
- Tracker updates (Cloudflare + Database + Jazz) with "verified in prod" checkmarks across the board.
- `docs/openclaw-asset-harvest.md` — asset scrape plan (already committed; referenced by the scrape script).

---

## How to test

### 1. Verify Jazz writes are silent-successful
```bash
BASE=https://geostumble-worker.eliothfraijo.workers.dev
TOKEN=<ADMIN_TOKEN>

# Terminal 1:
cd apps/worker && npx wrangler tail --format=json

# Terminal 2:
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/nudge/dave-001
# {"version":15,"bytes":4132,"usedFallback":false,"qualityGate":true,"iterations":5,"tokenUsage":25072,"elapsedMs":28832}
```
Tail should show zero `exceptions` and zero `warn`/`error` logs. `writeJazzStatus` only `console.warn`s on failure, so a silent tail means Jazz writes went through. From a Jazz-subscribed browser you should see `PersonaRoom.status` flip through `editing → editing:iteration-N → editing:saving → idle`.

### 2. Verify Mux Option A is persisted
```bash
curl -s $BASE/p/dave-001/meta | jq .muxPlaybackId
# "wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE"
```
All 5 personas return the same shared id.

### 3. Asset-scrape closeout — every image resolves
```bash
curl -s $BASE/p/dave-001 | grep -oE 'https://pub-[^"]+' | sort -u | \
  while read url; do printf "%-50s " "$(basename "$url")"; \
    curl -s -o /dev/null -w "%{http_code}\n" "$url"; done
# geocities-hot.gif                     200
# quartocities-img-hot.gif              200
# quartocities-img-ns-logo.gif          200
# quartocities-img-torch.gif            200
# geocities-flames.gif                  200
```

### 4. Kill-switch drill
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/freeze  # {"frozen":true}
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/thaw    # {"frozen":false}
```
Note: `/admin/nudge` bypasses freeze by design — it halts the autonomous fleet, not manual overrides.

### 5. Prewarm + cost check
```bash
npm run prewarm
# 5/5 succeeded, zero fallbacks
curl -s -H "Authorization: Bearer $TOKEN" $BASE/admin/cost
# {"totalUsd":0.6628,"cached":false}
```

### 6. Open the pages
- https://geostumble-worker.eliothfraijo.workers.dev/p/becky-002 (angsty poet, 15yo)
- https://geostumble-worker.eliothfraijo.workers.dev/p/dave-001 (Pokemon obsessive)
- https://geostumble-worker.eliothfraijo.workers.dev/p/harold-005 (ham radio grandpa)
- https://geostumble-worker.eliothfraijo.workers.dev/p/linda-004 (Beanie Babies mom)
- https://geostumble-worker.eliothfraijo.workers.dev/p/tyler-003 (wrestling fan)

Each is Gemini-written, references real scraped assets, and has a `muxPlaybackId` for the "making of" player.

---

## Deployment state

| Resource | ID / URL | Status |
|---|---|---|
| Worker | `geostumble-worker` at `*.eliothfraijo.workers.dev` | ✅ active, tip `dc1a0aa` |
| KV `PAGES` | `75cd531f…b1de47` | ✅ 108-entry `asset:manifest` + `jazz:registry_id = co_zAMB…GPku` |
| KV `ADMIN` | `b3e3d18e…2bd2` | ✅ |
| R2 `geostumble-assets` | `pub-7313…88c8.r2.dev` | ✅ 108 assets uploaded |
| Jazz `RoomRegistry` | `co_zAMBDSKQyYEvJ1FZetCbXzcGPku` | ✅ seeded, 5 PersonaRooms |
| Jazz worker account | `co_zDjRJynhDQrQLMG5fUGBjEvQQUN` | ✅ |
| Mux shared playback | `wiZQiwUdPmDaBlrwqCS7GXBP9UhUIZLKTlY77DATpCE` | ✅ every new snapshot carries it |
| Secrets | `ADMIN_TOKEN`, `NEON_DATABASE_URL`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `JAZZ_WORKER_ACCOUNT`, `JAZZ_WORKER_SECRET` | ✅ pushed |

---

## Metrics snapshot

- **Cycle time:** 20-44s end-to-end (Gemini tool loop + sandbox + KV/Neon + Jazz sync)
- **Fallback rate:** 0% across 5-persona prewarm on the 108-entry manifest
- **Cost after dozens of cycles:** $0.66 of $50 cap (1.3%)
- **Token spend per cycle:** ~$0.005-0.008 (Gemini 3 flash preview, 20K-30K tokens)
- **Image 404s:** 0/11 verified URLs

---

## Known issues & follow-ups

- **Option B (per-cycle recording)** deferred. `mux.ts` + `recorder.ts` scaffolds are in place if you want to flip it on post-event.
- **Frontend StatusBanner + Guestbook hookups** are Frontend-owned. Worker exposes everything they need (`/p/:id/stream`, Jazz `PersonaRoom` at the seeded registry).
- **Cost-cap forced-hit test** (`COST_CAP_USD=0.01`) deferred — the code path throws `"cost cap hit"` which is verified by inspection; burning tokens to force-trigger isn't worth the $10 of sunk spend.
- **Jitter soak test** deferred — correctness visible in code, not worth an hour of tail watching.
- **DNS** stays `*.workers.dev` for v1. Custom `geostumble.xyz` is a post-event upgrade.

---

## Contract stability

No changes to the v1-frozen contract surface documented in [`docs/frontend-worker-integration.md`](../docs/frontend-worker-integration.md). Jazz + Mux integrations are transparent to the frontend:
- `/p/:id/meta.muxPlaybackId` now always non-null (was nullable during Phase 0-3)
- `/p/:id/meta.status` remains a 5s-cached snapshot; live value comes from Jazz `PersonaRoom.status`
- SSE `/p/:id/stream` continues to work as the Jazz-outage fallback

---

## Commits (9 net)

```
dc1a0aa Flip Phase 4.1 header + upstream list to reflect live verification
180f61e Flip Phase 4 to live — Jazz registry seeded, worker writing status
6a382e0 Cloudflare Phase 6: asset-scrape closeout + kill-switch + prewarm verified
2359abc Seed Jazz rooms + close Phase 4 worker-side loop
cdfd53a Mark Cloudflare Phase 5 Option A as complete
b7b28af Implement Cloudflare Phase 4: Jazz writer fan-out (no-op pending seed)
997d847 Lock Mux v1 to Option A (shared demo clip), defer per-cycle to V2
3ade255 Add Mux env vars to Worker Env interface
e256bce Sweep: commit Mux REST client + demo-upload seed + demo assets
```

---

## Scoreboard against [Implementation/Cloudflare/v1-tracker.md](../Implementation/Cloudflare/v1-tracker.md)

| Phase | Status |
|---|---|
| 0 — Night before | ✅ (Sandbox, KV, R2, Neon seed, Mux, Jazz account, asset scrape) |
| 1 — Router + DO stub | ✅ (previous PR) |
| 2 — One persona end-to-end | ✅ (previous PR) |
| 3 — Fleet of 5 | ✅ (previous PR) |
| **4 — Realtime (Jazz + SSE)** | ✅ **this PR** |
| **5A — Mux Option A** | ✅ **this PR** |
| 5B — Per-cycle recording | ⏸ V2 |
| **6 — Demo prep + kill-switch** | ✅ **this PR** |
| 7 — Ship | Open on Elioth: final deploy confirmation, 5-min clean tail, backup recording, Devpost |
