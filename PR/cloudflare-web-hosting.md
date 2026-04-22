# apps/web on Cloudflare — OpenNext bundle live alongside the Worker

Wires `apps/web` (Next 15 App Router) to deploy as a Cloudflare Worker via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), so the whole stack — frontend + agent worker — sits on Cloudflare instead of splitting across Vercel + Cloudflare. Live and verified at the URL below.

**Live URL:** https://geostumble-web.eliothfraijo.workers.dev
**Base commit:** `09d469d` (Frontend V1)
**Tip:** `580c0c4`

---

## Summary

- **Net new files:** 2 (`apps/web/open-next.config.ts`, `apps/web/wrangler.jsonc`)
- **Touched files:** 4 (`next.config.ts`, `package.json`, `package-lock.json`, `app/api/stumble/route.ts`, `.gitignore`)
- **New deploy command:** `cd apps/web && npm run deploy`
- **Bundle size:** 2.3 KB worker entry + ~1.8 MB static assets, 28 ms cold start
- **No contract changes** — `/api/stumble` still proxies the agent worker; `lib/worker.ts` still reads `NEXT_PUBLIC_WORKER_URL`

---

## What's in it

### Adapter wiring
- [`apps/web/open-next.config.ts`](../apps/web/open-next.config.ts) — minimal `defineCloudflareConfig()`. No incremental cache, no R2, no overrides — defaults are correct for this app.
- [`apps/web/wrangler.jsonc`](../apps/web/wrangler.jsonc) — Worker config:
  - `compatibility_date = "2025-03-01"`, `compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]`
  - `assets.binding = "ASSETS"` pointing at `.open-next/assets`
  - `vars.NEXT_PUBLIC_WORKER_URL` pinned to the live agent worker so prod builds inline the right URL
- [`apps/web/next.config.ts`](../apps/web/next.config.ts) — added `initOpenNextCloudflareForDev()` so `next dev` can reach Cloudflare bindings if we add any later. Safe no-op otherwise.
- [`apps/web/package.json`](../apps/web/package.json) — new scripts:
  - `preview` → `opennextjs-cloudflare build && opennextjs-cloudflare preview`
  - `deploy` → `opennextjs-cloudflare build && opennextjs-cloudflare deploy`
  - `cf-typegen` → generates `cloudflare-env.d.ts` from `wrangler.jsonc`
- [`.gitignore`](../.gitignore) — `.open-next/` and `cloudflare-env.d.ts`
- New deps: `@opennextjs/cloudflare ^1.19.3`, `wrangler ^4.84.1` (devDep)

### One existing-code fix
- [`apps/web/app/api/stumble/route.ts`](../apps/web/app/api/stumble/route.ts) — removed `export const runtime = 'edge'`. OpenNext rejects per-route edge runtime (it would require bundling that route into a separate function). On Cloudflare the entire host is already the edge runtime, so the flag is redundant. The `force-dynamic` export stays.

---

## How to test

### 1. Local build + preview (no deploy)
```bash
cd apps/web
npm install
npm run preview   # builds OpenNext bundle, serves via wrangler dev
```
Hit http://localhost:8787/ — should render the Stumble landing page.

### 2. Deploy
```bash
cd apps/web
npm run deploy
# → https://geostumble-web.eliothfraijo.workers.dev
```
Requires `npx wrangler login` once with an account that has `workers (write)`.

### 3. Smoke the live deploy
```bash
WEB=https://geostumble-web.eliothfraijo.workers.dev

curl -s -o /dev/null -w "/ → %{http_code}\n" $WEB/
# / → 200

curl -s $WEB/api/stumble
# {"personaId":"dave-001"}

curl -s -o /dev/null -w "/s/dave-001 → %{http_code}\n" $WEB/s/dave-001
# /s/dave-001 → 200
```
The `/s/[id]` page SSRs, fetches `getPersonaMeta`, and iframes `geostumble-worker.eliothfraijo.workers.dev/p/dave-001`. End-to-end works against the live agent worker.

---

## Deployment state

| Resource | ID / URL | Status |
|---|---|---|
| Worker | `geostumble-web` at `*.eliothfraijo.workers.dev` | ✅ active, version `e0dcbb9a-ea28-402f-9065-c494f32b695e` |
| Static assets | `.open-next/assets` → ASSETS binding | ✅ 23 files, 4.4 MiB / 901 KiB gzip |
| Vars | `NEXT_PUBLIC_WORKER_URL = https://geostumble-worker.eliothfraijo.workers.dev` | ✅ |
| Cold start | 28 ms | ✅ |

---

## Known issues & follow-ups

- **Frontend V1 added 4 routes** (`/iterations`, `/iterations/[iterationId]`, `/s/[id]`, `/stumble`). All build and ship clean under OpenNext. The dynamic ones (`/iterations/[iterationId]`, `/s/[id]`, `/api/stumble`) run server-side in the Worker; the rest prerender as static assets.
- **No custom domain** — same as the agent worker, stays on `*.workers.dev` for v1.
- **No incremental cache** wired up yet. App is fully `force-dynamic` or static, so no Vercel-style ISR/data cache is in play. If we add `revalidate`, we'll need to add an R2 bucket + `incremental_cache` to `open-next.config.ts`.
- **Vercel decommissioning is out of scope.** This PR only proves the Cloudflare path works; the existing Vercel deploy (if any) keeps running until the team flips DNS.

---

## Contract stability

Zero changes to the v1-frozen Worker contract in [`docs/frontend-worker-integration.md`](../docs/frontend-worker-integration.md). The agent worker is the same upstream from both Vercel and Cloudflare hosts — only the platform serving `apps/web` changes.

---

## Commits (2 net)

```
580c0c4 Drop edge runtime flag from /api/stumble for Cloudflare build
041b6ac Wire apps/web for Cloudflare hosting via OpenNext
```
