# Cloudflare Worker: Phase 0–3 complete, live in production

Closes the Cloudflare slice of the Y2K Hackathon build through Phase 3 of [`Implementation/Cloudflare/v1-tracker.md`](../Implementation/Cloudflare/v1-tracker.md). Worker, Durable Objects, Sandbox SDK containers, KV, R2, Neon integration, Gemini 3 coding agent, and the 5-persona fleet are all deployed and verified in prod.

**Live URL:** https://geostumble-worker.eliothfraijo.workers.dev

---

## Summary

- **End-to-end coding agent runs in prod.** `POST /admin/nudge/:id` → Cloudflare Container sandbox → Gemini 3 tool loop (`list_assets` / `write_file` / `validate_html` / `done`) → 4–5KB of agent-written Y2K HTML stored in KV with Neon snapshot + cost ledger. ~16–30s per cycle.
- **Fleet of 5 personas live.** Prewarm script (`npm run prewarm`) nudges every persona in parallel batches. `/stumble` returns a random `{ personaId }` from the ready pool; `/p/:id` iframe-serves the agent-written page; `/p/:id/meta` backs the sidebar; `/p/:id/stream` emits SSE status transitions.
- **Demo-safe path.** Cost-cap kill-switch, freeze/thaw admin endpoints, mid-loop reminder for stuck agents, and a deterministic fallback template all land together.

---

## What's in it

### Infrastructure (Phase 0)
- Cloudflare KV (`PAGES`, `ADMIN`), R2 bucket (`geostumble-assets`) with public `pub-*.r2.dev` URL, Durable Object bindings (`PersonaDO`, `Sandbox`), Workers Paid plan for Containers
- `wrangler.toml` pinned to `instance_type = "standard-1"`, `[[rules]]` Text glob for `.md` prompts, `.workers.dev` URL instead of custom domain
- `Dockerfile` pulls prebuilt `cloudflare/sandbox:0.8.11` + installs `tidy`; `FROM --platform=linux/amd64` required to avoid OrbStack arm64 cache mismatches
- OrbStack installed as Docker Desktop alternative (required for `wrangler deploy` to build container images locally before pushing)

### Router + DO (Phase 1)
- Public routes: `/health`, `/stumble` (JSON, not 302 — resolves the [Open Q #6](../Implementation/Cloudflare/v1-proposal.md#open-questions) in the proposal), `/p/:id`, `/p/:id/meta`, `/p/:id/stream`
- Admin routes (bearer-gated): `/admin/nudge/:id`, `/admin/freeze`, `/admin/thaw`, `/admin/cost`, `/admin/smoke/sandbox`, `/admin/debug/transcript/:id`
- `PersonaDO.fetch` dispatches to `adminNudge` / `statusStream` / `serveCurrentPage` based on the URL
- `statusStream` uses a DO-local `EventTarget` so SSE works independently of Jazz (project.md §17 fallback row)
- `metaCache` (5s) + `costCache` (2s) in-process caches on the Worker

### Coding agent (Phase 2)
- `runTinkerCycle`: cost-cap → concurrency cap → sandbox → agent → quality gate → KV writes → Neon snapshot → cost ledger, with `sandbox.destroy()` in `finally`
- Gemini 3 flash preview tool loop (5 tools, 6-iteration budget)
- **`thoughtSignature` round-trip preserved** — echoing `response.candidates[0].content` verbatim instead of reconstructing, which is required for Gemini 3 function calling
- Fallback template triggered when `GEMINI_API_KEY` is empty, agent never writes `/workspace/index.html`, or the quality gate rejects the output. Ensures demo-safe path always produces something.
- `storeHtml` polls up to 10× 250ms for KV read-back before adding `ready:{id}` sentinel — prevents `/stumble` from redirecting to a persona whose page hasn't replicated

### Fleet (Phase 3)
- `scripts/prewarm-demo.ts` reads persona list from Neon, nudges in parallel batches of 5, reports per-persona outcomes. Exposed as `npm run prewarm`.
- **Mid-loop reminder**: after iteration 3 without a `write_file` call, inject a user-role message forcing the agent to commit. Harold (ham-radio grandpa) went from 1576-byte fallback to 5043-byte real page on first retry. This is the right fix pattern for exploration loops.

### Docs
- [`docs/frontend-worker-integration.md`](../docs/frontend-worker-integration.md) — integration guide for the Vercel team: env vars, public/admin routes, typed client, Jazz handoff, SSE example, user journey diagram, iframe cache gotcha, contract stability guarantee
- Tracker updates across all four phases with exit-gate verification and "bugs found during verification" sections
- Proposal edits apply the original review (freeze deviation, ready_pool per-persona keys, cost-cap TTL, ADMIN_TOKEN server-only, SSE via DO-local EventTarget, sandbox concurrency cap)

### Misc
- Mux REST client (`apps/worker/src/mux.ts`) and Option A seed script for the demo video — authored by the Mux agent owner, swept into this PR to keep the branch shippable
- Minor: `packages/shared/src/jazz-schema.ts` scaffold for Phase 4 handoff

---

## How to test

### 1. See the live pages
Open in a browser:
- https://geostumble-worker.eliothfraijo.workers.dev/p/dave-001 (Pokemon obsessive, 12yo)
- https://geostumble-worker.eliothfraijo.workers.dev/p/becky-002 (angsty poet, 15yo)
- https://geostumble-worker.eliothfraijo.workers.dev/p/tyler-003 (wrestling fan)
- https://geostumble-worker.eliothfraijo.workers.dev/p/linda-004 (Beanie Babies mom)
- https://geostumble-worker.eliothfraijo.workers.dev/p/harold-005 (ham radio grandpa)

Each page is genuinely agent-written Y2K-era HTML: Comic Sans, `<marquee>`, CSS blink, palette-locked colors, R2 image refs.

### 2. Stumble
```bash
curl -s https://geostumble-worker.eliothfraijo.workers.dev/stumble
# {"personaId":"becky-002"}
```
10 calls hit all 5 personas randomly.

### 3. Force a rewrite
```bash
BASE=https://geostumble-worker.eliothfraijo.workers.dev
TOKEN=<ADMIN_TOKEN from .dev.vars>
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/nudge/dave-001
# {"version":9,"bytes":4821,"usedFallback":false,"qualityGate":true,"iterations":6,"tokenUsage":8142,"elapsedMs":17420}
```
Refresh the browser — same persona, new page written fresh by Gemini.

### 4. Watch status transitions live
```bash
curl -N https://geostumble-worker.eliothfraijo.workers.dev/p/dave-001/stream
# event: status    data: idle
# event: status    data: editing
# event: status    data: editing:iteration-1
# event: status    data: editing:iteration-2
# event: status    data: editing:iteration-3
# event: status    data: editing:saving
# event: status    data: idle
```

### 5. Cost ledger
```bash
curl -H "Authorization: Bearer $TOKEN" $BASE/admin/cost
# {"totalUsd":0.0412,"cached":false}
```

### 6. Inspect the agent's transcript
```bash
curl -H "Authorization: Bearer $TOKEN" $BASE/admin/debug/transcript/dave-001
# Full system+user prompt, every TOOL CALL, every TOOL RESULT, FINAL state
```

### 7. Prewarm the full fleet
```bash
npm run prewarm
# [prewarm] 5 personas: becky-002, dave-001, harold-005, linda-004, tyler-003
# [prewarm] worker=https://geostumble-worker.eliothfraijo.workers.dev concurrency=5
# [prewarm]   becky-002 v3 bytes=4432 fallback=false 29391ms
# [prewarm]   dave-001  v8 bytes=5083 fallback=false 17642ms
# ...
# [prewarm] done: 5/5 succeeded
```

### 8. Kill-switch drill
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/freeze  # {"frozen":true}
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/nudge/dave-001  # next alarm cycle skips
curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/admin/thaw    # {"frozen":false}
```

---

## Deployment state

| Resource | ID / URL | Status |
|---|---|---|
| Worker | `geostumble-worker` at `*.eliothfraijo.workers.dev` | ✅ active, Version `3ade255...` |
| KV `PAGES` | `75cd531f5bcd42628127d69643b1de47` | ✅ |
| KV `ADMIN` | `b3e3d18ec2cb4d5e9cfb7a3ab4082bd2` | ✅ |
| R2 `geostumble-assets` | `pub-7313ad06136f4e89bec6f10ac19488c8.r2.dev` | ✅ public |
| Neon `geostumble` | `withered-wildflower-95411406` | ✅ 5 personas seeded |
| Secrets | `ADMIN_TOKEN`, `NEON_DATABASE_URL`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` | ✅ pushed via `wrangler secret put` |

---

## Known issues & follow-ups

- **Agent occasionally hallucinates asset keys** not present in the 25-entry seed manifest. Image 404s but page still renders. Resolves once the real overnight asset scrape (`scripts/scrape-assets.ts`) runs — agents will have hundreds of real keys to pick from.
- **Phase 3.2 jitter soak test deferred** — correctness is visible in code; not worth an hour of `wrangler tail` watching for v1.
- **Phase 4 (Jazz)** unblocked; schema scaffolded at `packages/shared/src/jazz-schema.ts`. Needs `npx jazz-run account create` to generate `JAZZ_WORKER_ACCOUNT` / `JAZZ_WORKER_SECRET` before live status + guestbook.
- **Phase 5 (Mux)** has REST client and Option A seed in this PR; end-to-end `recordTinkerSession → muxUpload` wiring lives in a follow-up.
- **`wrangler secret put`:** pipe values with `printf`, not `echo` — trailing newlines break bearer auth in the Worker. Documented in the tracker but calling out here too.

---

## Contract surface

`docs/frontend-worker-integration.md` §2 is **frozen for v1**. Endpoints:
- `GET /health`
- `GET /stumble` → JSON `{ personaId }`
- `GET /p/:id` → `text/html`
- `GET /p/:id/meta` → JSON `{ personaId, name, era, version, muxPlaybackId, status }`
- `GET /p/:id/stream` → SSE `event: status\ndata: <state>\n\n`
- `POST /admin/{nudge,freeze,thaw,cost,smoke/sandbox,debug/transcript/:id}` → bearer-gated

---

## Commit list (11 commits)

```
3ade255 Add Mux env vars to Worker Env interface
e256bce Sweep: commit Mux REST client + demo-upload seed + demo assets
9d643ca Add frontend-worker integration guide
b1350dd Implement Cloudflare Phase 3: fleet of 5 personas, mid-loop reminder
339b799 Upgrade to Gemini 3 flash preview + preserve thought_signature
128d6a6 Implement Cloudflare Phase 2: coding agent end-to-end in prod
5362349 Reduce persona roster from 20 to 5 for hackathon scope
d85411b Fix PersonaDO personaId lookup + mark Phase 1 exit gate passed
1b63362 Complete Cloudflare Phase 1: wire Neon into meta/cost/health
3b4e85d Implement Cloudflare Phase 0: Worker + Sandbox SDK deployed to prod
14ccfb8 Implement Neon Phase 0: schema, client, seed, smoke
```

## Diffstat

~20 files changed, ~9500 insertions across:
- `apps/worker/` — router, DO, sandbox adapter, coding agent, storage, prompts, Dockerfile
- `Implementation/Cloudflare/` — proposal edits + live tracker
- `docs/` — frontend integration guide
- `scripts/` — prewarm
- `packages/shared/` — Jazz schema scaffold for Phase 4 handoff
