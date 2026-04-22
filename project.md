Geostumble — Full Project Spec
Event: Frontier Tech Week Y2K Hackathon — Miami, 2026-04-22, 6 hrs
Audience for this doc: A junior dev who can read TypeScript and has shipped a Next.js app before. Spells out the obvious on purpose.

1. Product overview
Geostumble is StumbleUpon reimagined for 2026. Instead of surfing random real webpages, users click a button and land on a 1999-style personal homepage belonging to a fictional persona. Each persona is an autonomous AI agent living on Cloudflare. The agent has memory, personality, obsessions, and writes/rewrites its own homepage HTML in a real coding sandbox. Stumblers can leave guestbook entries, see other stumblers' presence, and watch a "making of" video clip of the agent coding the page.

One-liner: "StumbleUpon, but every page is an AI agent with a Cloudflare Durable Object for a brain and a coding sandbox for hands."

Why anyone cares: The prompt was "we don't know how to build like this anymore." The answer: we do — we just had to build an AI that doesn't.

2. Goals and non-goals
Goals (must hit by 14:00 on demo day)
A working stumble button on a public URL.
At least 10 distinct personas with authentically Y2K-styled homepages.
At least one persona whose page is verifiably agent-written (shown live or via Mux replay).
Realtime guestbook and presence on every page.
A demo-safe path: always-ready pages, admin nudge, kill-switch.
Five sponsor integrations doing real work: Cloudflare, Neon, Jazz, Mux, Gemini.
Non-goals (out of scope, do not build)
User accounts, sign-in, profiles for stumblers.
Mobile-responsive UI (1024×768 only, on purpose).
Asset generation (we select from a curated library, we don't generate).
Inter-persona communication / automatic webring formation (V2 if time).
Moderation, rate-limiting beyond the kill-switch.
Analytics, cookie banners, GDPR. Please no.
3. System architecture
┌───────────────────────────────────────────────────────────┐
│  Browser                                                  │
│  Vercel-hosted Next.js UI                                 │
│  - /              : landing page + STUMBLE button         │
│  - /s/{id}        : result page (iframe + chrome)         │
│  - iframe ─────► https://p.geostumble.xyz/p/{id}          │
│  - Jazz client subscribes to: persona:{id}                │
└──────────────┬──────────────────────────┬─────────────────┘
               │                          │
               │ fetch                    │ ws (Jazz sync)
               ▼                          ▼
┌─────────────────────────────┐    ┌─────────────────────┐
│  Cloudflare                 │    │  Jazz Cloud         │
│  Worker (router)            │    │  CoValues           │
│    /stumble                 │    │  per persona:       │
│    /p/{id}                  │    │   - status          │
│    /admin/nudge/{id}        │    │   - guestbook list  │
│    /admin/freeze            │    │   - presence map    │
│                             │    └─────────────────────┘
│  Durable Object × N         │
│    class PersonaDO          │
│    ├ alarm() tinker cycle   │
│    ├ fetch() serve HTML     │
│    └ adminNudge()           │
│         │                   │
│         ▼                   │
│  Cloudflare Sandbox         │
│  (per coding session)       │
│    coding agent:            │
│    - write_file             │
│    - read_file              │
│    - run_shell              │
│    - select_asset           │
│         │                   │
│         ▼                   │
│  Output: index.html         │
│         │                   │
│         ▼                   │
│  KV (hot HTML) + R2 (cold)  │
│                             │
│  R2: Y2K asset library      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐    ┌─────────────────────┐
│  Neon (Postgres)            │    │  Mux                │
│  - personas                 │    │  VOD assets per     │
│  - page_snapshots           │    │  coding session     │
│  - webring_edges            │    │                     │
└─────────────────────────────┘    └─────────────────────┘
4. Full stack
Frontend
Framework: Next.js 15 (App Router) on Vercel
Language: TypeScript 5.5+
UI: Tailwind CSS + one hand-written retro.css for CRT/Y2K effects
Realtime client: jazz-react + jazz-browser
Video player: @mux/mux-player-react
Edge compute
Runtime: Cloudflare Workers (Wrangler v3)
Language: TypeScript
Stateful: Durable Objects
Sandboxed exec: @cloudflare/sandbox (Cloudflare Sandbox SDK over Containers)
Storage:
KV — hot page HTML
R2 — asset library + archived pages + session recordings
DO storage — persona memory
Data
Neon Postgres: relational backbone (personas, snapshots, webring edges)
Jazz.tools: collaborative state (guestbook, presence, live status)
AI / agents
LLM: Google Gemini 2.5 Flash (primary) via @google/genai. Fallback: Claude 4 Haiku.
Agent orchestration: hand-rolled tool loop inside the DO. ~150 lines. No LangGraph.
Coding surface: agent writes files inside a Cloudflare Sandbox and calls run_shell to validate HTML with tidy.
Video
Mux VOD: one asset per coding session, embedded as "making of" clip on each page.
5. Accounts, keys, pre-hackathon prep
Create accounts and collect credentials the night before. None of these have fast activation.

Service	Purpose	Credential needed	Notes
Cloudflare	Workers, DO, R2, KV, Sandbox	API token with edit scopes, account ID	Enable Containers/Sandbox SDK on account
Vercel	Next.js hosting	Logged-in CLI	Free tier fine
Neon	Postgres	Connection string, project ID	Use a dedicated branch for the hackathon
Jazz.tools	Sync layer	Cloud sync server URL, worker account secret	Worker account is critical — create via their CLI
Mux	Video	Token ID + token secret (environment access token)	Use the dev environment
Google AI Studio	Gemini API	GEMINI_API_KEY	Flash model, billing enabled
Anthropic (fallback)	Claude API	ANTHROPIC_API_KEY	Only used if Gemini throttles
Domain	geostumble.xyz or similar	DNS access	Optional but judges remember URLs
Environment variables
.env.local (Vercel):

NEXT_PUBLIC_WORKER_URL=https://p.geostumble.xyz
NEXT_PUBLIC_JAZZ_PEER=wss://cloud.jazz.tools/sync
NEXT_PUBLIC_MUX_ENV_KEY=env_xxx
.dev.vars (Wrangler):

NEON_DATABASE_URL=postgres://...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
JAZZ_WORKER_ACCOUNT=...
JAZZ_WORKER_SECRET=...
ADMIN_TOKEN=pick-a-long-random-string
COST_CAP_USD=50
6. Repo layout
geostumble/
├── apps/
│   ├── web/                       # Next.js on Vercel
│   │   ├── app/
│   │   │   ├── page.tsx           # landing + STUMBLE button
│   │   │   ├── s/[id]/page.tsx    # stumble result page
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── StumbleButton.tsx
│   │   │   ├── Guestbook.tsx
│   │   │   ├── PresencePill.tsx
│   │   │   ├── StatusBanner.tsx   # "under construction" live
│   │   │   └── RealPlayerClip.tsx
│   │   ├── lib/jazz.ts            # Jazz browser client config
│   │   ├── styles/retro.css
│   │   └── package.json
│   │
│   └── worker/                    # Cloudflare Worker
│       ├── src/
│       │   ├── index.ts           # router
│       │   ├── persona-do.ts      # PersonaDO class
│       │   ├── coding-agent.ts    # agent tool loop
│       │   ├── sandbox.ts         # sandbox helpers
│       │   ├── recorder.ts        # asciinema-style capture
│       │   ├── mux.ts             # VOD upload helper
│       │   ├── neon.ts            # Neon client
│       │   ├── jazz-writer.ts     # Jazz worker-account client
│       │   ├── prompts/
│       │   │   ├── persona-system.md
│       │   │   └── coding-task.md
│       │   └── schemas/
│       │       └── jazz-coValues.ts
│       └── wrangler.toml
│
├── packages/
│   └── shared/                    # shared types between web + worker
│       └── src/types.ts
│
├── scripts/
│   ├── seed-personas.ts           # insert 20 personas into Neon
│   ├── scrape-assets.ts           # populate R2 asset library
│   ├── smoke.ts                   # end-to-end generation smoke test
│   └── prewarm-demo.ts            # force 10 personas to v2+ pages
│
├── assets/                        # local copies before upload to R2
│   ├── tiles/                     # tiled bg patterns
│   ├── gifs/                      # dancing bananas etc
│   ├── badges/                    # "best viewed in Netscape"
│   ├── wordart/                   # WordArt PNGs
│   └── manifest.json              # tag index
│
└── docs/
    └── SPEC.md                    # this file
7. Data schemas
Neon (Postgres)
CREATE TABLE personas (
  id           TEXT PRIMARY KEY,           -- e.g. "dave-001"
  name         TEXT NOT NULL,              -- "Dave"
  age          INT  NOT NULL,              -- 12
  archetype    TEXT NOT NULL,              -- "pokemon-fan"
  obsessions   TEXT[] NOT NULL,            -- ["Charizard", "Nintendo 64"]
  palette      JSONB NOT NULL,             -- {"bg":"#ff00ff","fg":"#00ffff", ...}
  era          TEXT NOT NULL,              -- "1999-Q3"
  vibe_notes   TEXT NOT NULL,              -- system-prompt injection
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE page_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  persona_id      TEXT REFERENCES personas(id),
  version         INT NOT NULL,
  html_kv_key     TEXT NOT NULL,           -- key into CF KV
  mux_playback_id TEXT,                    -- nullable; populated after Mux upload
  sandbox_log     TEXT,                    -- agent tool-call transcript
  token_cost_usd  NUMERIC(10,4),
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON page_snapshots (persona_id, version DESC);

CREATE TABLE webring_edges (
  src_persona TEXT REFERENCES personas(id),
  dst_persona TEXT REFERENCES personas(id),
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (src_persona, dst_persona)
);

CREATE TABLE cost_ledger (
  id         BIGSERIAL PRIMARY KEY,
  persona_id TEXT,
  kind       TEXT NOT NULL,  -- "gemini" | "mux" | "sandbox"
  amount_usd NUMERIC(10,4) NOT NULL,
  ts         TIMESTAMPTZ DEFAULT now()
);
Jazz CoValues
// schemas/jazz-coValues.ts
import { co, CoList, CoMap } from 'jazz-tools'

export class GuestbookEntry extends CoMap {
  author = co.string       // "anon-42" or freeform
  message = co.string
  color = co.string        // hex, random per stumbler
  createdAt = co.Date
}

export class GuestbookList extends CoList.Of(co.ref(GuestbookEntry)) {}

export class PresenceEntry extends CoMap {
  stumblerId = co.string
  cursor = co.optional.json<{x: number; y: number}>()
  lastSeen = co.Date
}

export class PresenceMap extends CoMap.Record(co.ref(PresenceEntry)) {}

export class PersonaRoom extends CoMap {
  personaId = co.string
  status = co.string       // "idle" | "editing" | "sleeping" | "coding:selecting-bg"
  guestbook = co.ref(GuestbookList)
  presence = co.ref(PresenceMap)
}
One PersonaRoom per persona. ID lookup table lives in a global RoomRegistry CoMap keyed by persona ID, or published on a known URL.

KV layout (Cloudflare)
Key	Value	Notes
page:{personaId}:current	HTML string	served by /p/{id}
page:{personaId}:v{n}	HTML string	history
ready_pool	JSON array of persona IDs with current pages	read by /stumble
asset:manifest	JSON tag index	read by coding agent to pick assets
R2 layout
assets/tiles/{slug}.gif
assets/gifs/{slug}.gif
assets/badges/{slug}.png
assets/wordart/{slug}.png
pages_archive/{personaId}/v{n}.html
sessions/{personaId}/v{n}.cast     # asciinema recording source
8. API surface
Worker routes
GET  /stumble
  → 302 redirect to /p/{randomReadyPersonaId}
GET  /p/:personaId
  → serves HTML from KV (text/html)
  → if persona currently editing, wraps with SSE "under construction" header
  → 404 if persona doesn't exist
GET  /p/:personaId/stream
  → SSE stream of status transitions while editing
  → events: {type: "node", name: "selecting-bg"} etc.
POST /admin/nudge/:personaId
  → Authorization: Bearer {ADMIN_TOKEN}
  → triggers immediate DO.runTinkerCycle()
  → returns {version, estimatedSeconds}
POST /admin/freeze
  → Authorization: Bearer {ADMIN_TOKEN}
  → clears all DO alarms; pauses tinkering network-wide
POST /admin/thaw
  → Authorization: Bearer {ADMIN_TOKEN}
  → restores staggered alarms
GET  /admin/cost
  → returns current spend from cost_ledger
GET  /health
  → {"ok": true, "personaCount": 20, "poolSize": 14}
Next.js API routes (Vercel side, mostly proxies)
GET  /api/stumble
  → fetches Worker /stumble; returns {personaId, personaMeta}
POST /api/guestbook/:personaId
  → authoring from browser, but we write via Jazz so this is unused
  → keep only for demo if Jazz breaks
GET  /api/personas
  → lists personas from Neon for an admin/debug view
9. The PersonaDO class
// apps/worker/src/persona-do.ts
export class PersonaDO implements DurableObject {
  constructor(private state: DurableObjectState, private env: Env) {
    this.state.blockConcurrencyWhile(async () => {
      const persona = await this.state.storage.get<Persona>('persona')
      if (!persona) {
        const id = this.state.id.toString()
        const row = await loadPersonaFromNeon(this.env, id)
        await this.state.storage.put('persona', row)
        await this.state.storage.setAlarm(Date.now() + jitter(60_000, 300_000))
      }
    })
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname.endsWith('/nudge')) return this.adminNudge()
    if (url.pathname.endsWith('/stream')) return this.statusStream()
    return this.serveCurrentPage()
  }

  async alarm() {
    const persona = await this.state.storage.get<Persona>('persona')
    const editProbability = 0.3
    if (Math.random() < editProbability) {
      await this.runTinkerCycle(persona!)
    }
    await this.state.storage.setAlarm(Date.now() + jitter(60_000, 300_000))
  }

  async runTinkerCycle(persona: Persona) {
    if (await this.costCapHit()) return
    await this.setStatus('editing')

    const sandbox = await createSandbox(this.env)
    const recorder = startRecorder(sandbox)

    try {
      const result = await runCodingAgent({
        sandbox,
        persona,
        systemPrompt: await loadPrompt(this.env, 'persona-system'),
        taskPrompt:   await loadPrompt(this.env, 'coding-task'),
        assetManifest: await loadAssetManifest(this.env),
        onStep: (step) => this.setStatus(`editing:${step}`),
      })

      if (!passesQualityGate(result.html)) {
        // one retry
        // ... omitted for brevity
      }

      const version = (await getLatestVersion(this.env, persona.id)) + 1
      await storeHtml(this.env, persona.id, version, result.html)
      await addToReadyPool(this.env, persona.id)

      const muxId = await uploadRecordingToMux(this.env, recorder.output)
      await recordSnapshot(this.env, {
        personaId: persona.id,
        version,
        htmlKvKey: `page:${persona.id}:v${version}`,
        muxPlaybackId: muxId,
        sandboxLog: result.transcript,
        tokenCostUsd: result.cost,
      })
    } finally {
      await sandbox.destroy()
      await this.setStatus('idle')
    }
  }

  private async setStatus(status: string) {
    await writeJazzStatus(this.env, this.state.id.toString(), status)
  }
}

function jitter(minMs: number, maxMs: number) {
  return minMs + Math.random() * (maxMs - minMs)
}
10. Coding agent spec
Tools exposed to the LLM
{
  name: 'write_file',
  description: 'Write a file inside the sandbox workspace.',
  parameters: { path: string, content: string }
}
{
  name: 'read_file',
  description: 'Read a file you previously wrote.',
  parameters: { path: string }
}
{
  name: 'list_assets',
  description: 'List available Y2K assets filtered by tags.',
  parameters: { tags: string[] }
  // returns: [{ key: 'assets/tiles/stars.gif', tags: ['tile','space'] }]
}
{
  name: 'validate_html',
  description: 'Runs tidy on index.html. Returns errors as strings.',
  parameters: {}
}
{
  name: 'done',
  description: 'Submit the final page. Do this when satisfied.',
  parameters: {}
}
System prompt (persona-system.md, abridged)
You are {persona.name}, age {persona.age}. It is {persona.era}.
You are building your personal homepage on the internet.
You are obsessed with: {persona.obsessions}.
Your aesthetic palette: {persona.palette}.
Vibe: {persona.vibe_notes}
RULES you must follow when writing HTML:
- Use ONLY <table> layouts. No flexbox, no grid, no CSS positioning.
- REQUIRED elements: <marquee>, a tiled background image, a hit counter,
  a "last updated" date between 1998 and 2001, at least one <blink>-style
  element (you may simulate with CSS animation).
- Use <font face="Comic Sans MS">, <font face="Impact">, or similar era
  fonts. Colors from your palette ONLY.
- Do NOT write responsive CSS. 1024×768 is the only resolution.
- Include an animated GIF or WordArt you picked from list_assets.
- Do NOT write JavaScript unless the joke genuinely demands it.
Write files to /workspace/index.html. Use list_assets to choose images.
Reference them as <img src="https://assets.geostumble.xyz/{key}">.
Start by listing assets with relevant tags. Then write index.html.
Then validate_html. Then done.
You have 3 iterations maximum.
Loop pseudocode
async function runCodingAgent(ctx) {
  const messages = [
    { role: 'system', content: ctx.systemPrompt },
    { role: 'user',   content: ctx.taskPrompt },
  ]
  let cost = 0
  for (let i = 0; i < 3; i++) {
    ctx.onStep(`iteration-${i}`)
    const resp = await gemini.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      tools: TOOLS,
    })
    cost += resp.usage.totalTokens * GEMINI_FLASH_PRICE
    const call = resp.functionCalls?.[0]
    if (!call || call.name === 'done') break
    const result = await executeTool(ctx.sandbox, call)
    messages.push({ role: 'model', parts: [{ functionCall: call }] })
    messages.push({ role: 'tool',  parts: [{ functionResponse: result }] })
  }
  const html = await ctx.sandbox.readFile('/workspace/index.html')
  return { html, transcript: serialize(messages), cost }
}
Quality gate
function passesQualityGate(html: string): boolean {
  const checks = [
    html.includes('<table'),
    /<marquee/i.test(html),
    /background(-image)?[:=]/i.test(html),
    /Comic Sans|Impact|Arial Black/i.test(html),
    html.length > 1500,
    html.length < 25000,
    !/flex|grid|@media/i.test(html),
  ]
  return checks.filter(Boolean).length >= 5
}
11. Persona seed data
20 hand-written personas. Examples:

[
  {
    "id": "dave-001",
    "name": "Dave",
    "age": 12,
    "archetype": "pokemon-fan",
    "obsessions": ["Charizard", "Pokemon Red", "Nintendo 64", "GameShark codes"],
    "palette": {"bg":"#000080","fg":"#ffff00","link":"#00ffff","vlink":"#ff00ff"},
    "era": "1999-Q3",
    "vibe_notes": "Ends sentences with multiple exclamation points. Types in ALL CAPS for excitement. Brags about Pokedex completion."
  },
  {
    "id": "becky-002",
    "name": "Becky",
    "age": 15,
    "archetype": "angsty-poet",
    "obsessions": ["Evanescence", "black nail polish", "Edgar Allan Poe"],
    "palette": {"bg":"#000000","fg":"#8b0000","link":"#dc143c","vlink":"#4b0082"},
    "era": "2001-Q1",
    "vibe_notes": "Writes free verse. Quotes Poe incorrectly. Has a shrine to 'her darkness'."
  }
]
Create 18 more. Variety: fishing dad, horse girl, wrestling fan, Linkin Park kid, Beanie Babies mom, ham radio grandpa, FFVIII walkthrough guy, Tamagotchi obsessive, webring librarian, AIM chatroom moderator, GeoCities neighborhood evangelist, etc.

12. Asset library
Pre-scrape the night before. Target: ~200 assets, tagged.

Manifest entry shape
{
  "key": "assets/tiles/stars-blue.gif",
  "kind": "tile",
  "tags": ["space", "dark", "blue", "glittery"],
  "source": "webdesignmuseum.org/...",
  "bytes": 3421,
  "w": 100,
  "h": 100
}
Categories
Kind	Count target	Example tags
tile	60	stars, flames, water, clouds, rainbow, checkered
gif	80	dancing-banana, under-construction, new, hot, email, guestbook
badge	20	netscape, ie4, best-viewed-800x600, webring
wordart	30	names, "welcome", "my page"
counter	10	hit-counter digit fonts
Scrape sources
webdesignmuseum.org
archive.org/wayback via curl with a 1999–2001 snapshot date
GifCities: gifcities.org (internet archive project, explicit Geocities gifs)
Textfiles.com for era-appropriate ASCII
Respect robots, don't hammer. Batch overnight.

Script: scripts/scrape-assets.ts
// outline
// 1. hit each source index
// 2. download matching files
// 3. classify with filename heuristics + a small Gemini pass for edge cases
// 4. upload to R2 with key asset/{kind}/{slug}
// 5. write manifest.json and upload to R2:asset:manifest
13. Frontend UI detail
/ landing page
Black background, lime #00ff00 text, monospace.
Giant CRT-flicker banner: GEOSTUMBLE — the internet before the internet was ruined.
Scrolling <marquee> along the top with fake sponsor credits.
Big beveled button (border-style: outset) labeled *** STUMBLE! ***.
Small footer: "powered by Cloudflare, Neon, Jazz, Mux, Gemini".
/s/[id] result page
Layout: fixed-width 1024px frame, centered.

┌─────────────────────────────────────────────────────────┐
│  [< STUMBLE AGAIN]   [saved: 0]  👀 3 stumblers here   │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬─────────────────────────────┐ │
│ │                       │  📓 GUESTBOOK               │ │
│ │   iframe              │  ─────────────              │ │
│ │   src=/p/{id}         │  > hey dave cool page       │ │
│ │                       │  > charizard is the best    │ │
│ │                       │                             │ │
│ │                       │  [leave a note...]          │ │
│ │                       │                             │ │
│ │                       │  📡 MAKING OF               │ │
│ │                       │  <mux-player ... />         │ │
│ └───────────────────────┴─────────────────────────────┘ │
│  Status: Dave is idle. (or "Dave is picking a tile...")│
└─────────────────────────────────────────────────────────┘
Components
<StumbleButton /> — calls /api/stumble, navigates to /s/{id}.
<Guestbook personaId={id} /> — Jazz subscription to PersonaRoom.guestbook, renders a scrollable list, adds entry via CoList.push.
<PresencePill personaId={id} /> — Jazz presence count.
<StatusBanner personaId={id} /> — subscribes to PersonaRoom.status. Shows "UNDER CONSTRUCTION 🚧 Dave is picking a background tile…" when non-idle.
<RealPlayerClip playbackId={muxId} /> — @mux/mux-player-react inside a table styled as RealPlayer 8. image-rendering: pixelated to keep the Y2K feel.
14. Demo-day controls
Pre-warm script
scripts/prewarm-demo.ts — calls /admin/nudge/{id} for 10 chosen personas, waits for each to finish, verifies quality gate, pushes to ready pool. Run at 09:45.

Admin panel (minimum)
One page at /admin behind ADMIN_TOKEN, with:

List of personas + status + last version + token cost.
"Nudge" button per persona.
Global "Freeze" / "Thaw" buttons.
Live spend counter.
Manual "Mark as ready" toggle if a page passed the gate but didn't auto-pool.
Kill-switch
costCapHit() inside DO checks cost_ledger sum against COST_CAP_USD. When hit: freeze alarms, surface a banner in /admin, page still serves from KV.

15. Demo script (90 seconds, rehearsed twice)
Open geostumble.xyz on main screen. Read banner aloud.
"Hands up if you miss StumbleUpon." (beat)
Explain the pitch from §1 in one breath.
Click STUMBLE. Land on Dave. Show marquee, dancing banana, hit counter.
Show guestbook already populated; leave an entry live. "👀 2 stumblers here" updates.
Click STUMBLE. Land on Becky. Same mechanics, very different vibe — proves variety.
Pre-nudged: Click STUMBLE. Land on Tyler mid-edit. Point at the "UNDER CONSTRUCTION" banner narrating the agent. Page materializes.
Click "📡 Making of". Mux 240p clip plays showing Tyler coding in asciinema.
Closing line from the pitch. Thanks.
16. Ship order (hour-by-hour)
Night before
not done
Accounts + keys collected
not done
Scrape script run → ~200 assets in R2 + manifest
not done
Neon schema migrated + 20 personas seeded
not done
Jazz worker account created + sync server URL confirmed
not done
Cloudflare Sandbox SDK smoke test: one page generated end to end, no UI
not done
Repo skeleton pushed; both apps deploy cleanly to their targets
Hour 0 (09:30–10:30) — scaffolds
not done
Worker routes + PersonaDO stub
not done
Vercel landing + stumble button hitting Worker
not done
/p/{id} serves a hardcoded HTML from KV
Hour 1 (10:30–11:30) — one persona
not done
DO loads persona from Neon
not done
runTinkerCycle → Sandbox → coding agent → HTML in KV
not done
Manually trigger via /admin/nudge/dave-001
not done
Verify page displays
Hour 2 (11:30–12:30) — scale
not done
All 20 personas seeded into DOs
not done
Alarms staggered
not done
/stumble picks random ready persona
not done
Lunch at desk
Hour 3 (12:30–13:30) — realtime
not done
Jazz CoValues created for each persona
not done
DO writes status via Jazz worker account
not done
Vercel subscribes to guestbook + presence + status
Hour 4 (13:30–14:30) — polish + Mux
not done
Recorder captures agent session
not done
Mux upload after each cycle
not done
Real Player embed on /s/{id}
not done
retro.css CRT effects on Vercel UI
Hour 5 (14:30–15:30) — demo prep
not done
Prewarm 10 personas
not done
Rehearse admin nudge for "live coding" beat
not done
Cost check, kill-switch armed
not done
Screenshot / record a backup demo in case of stage wifi failure
Hour 6 (15:30–16:00) — submit + present
not done
Devpost submission with screenshots
not done
Present
not done
Water, deep breath
17. Risks and fallbacks
Risk	Detection	Fallback
Cloudflare Sandbox SDK unfamiliar and eats an hour	Hour 1 end: no page generated	Swap to E2B or Daytona; preserve DO as brain
Jazz worker-account writes fail	Hour 3: status doesn't update in UI	Replace with SSE straight from Worker for status; keep Jazz browser-side for guestbook only
Gemini rate-limit mid-demo	429 in logs	Env-switch to Claude Haiku; costs go up, demo continues
Coding agent produces broken HTML	Quality gate fails twice	Fallback template (hardcoded HTML with slot substitution from persona card)
Mux upload flaky	Missing playback IDs	Hide the RealPlayer embed if muxPlaybackId null; page still works
Cost runaway	cost_ledger > $50	costCapHit freezes; demo uses prewarmed pool
Stage wifi dies	Obvious	Recorded video backup of full demo loop; laptop hotspot as tertiary
Neon cold-start latency on DO init	Hour 2: first request slow	Add 2-minute warm-up on deploy, keep connection pool; accept cold start for personas not in demo set
18. Post-event checklist (do not skip)
not done
Rotate all API keys (hackathons leak them).
not done
Archive final HTML snapshots to R2 pages_archive/.
not done
Keep Mux assets; delete after 7 days to avoid charges.
not done
Export Neon data, snapshot DB branch.
not done
Tweet the thing. Link the demo URL. Tag the sponsors you integrated. This is where you earn follow-on opportunities more than from the prize itself.
19. Glossary (for the junior dev)
Durable Object (DO): A stateful Cloudflare Worker — single-instance, addressable by ID, with built-in storage and alarms. Think: one always-on little process per "thing" (here, per persona).
Alarm: A scheduled wakeup for a DO. You call storage.setAlarm(timestamp), Cloudflare calls your alarm() method at that time. Used for background work without a cron.
KV: Cloudflare's edge key-value store. Eventually consistent, fast reads, cheap. We use it for hot HTML.
R2: S3-compatible object storage on Cloudflare. No egress fees. We use it for assets + archives.
Sandbox SDK: Cloudflare's container-backed runtime for running arbitrary code (like an LLM-driven coding agent) with a real filesystem and shell.
CoValue / CoList / CoMap: Jazz's CRDT primitives. Multiple clients read/write the same "CoValue" and the framework handles sync and merge.
SSE: Server-Sent Events. One-way HTTP streaming from server to browser. Simpler than WebSocket when the server just needs to push updates.
VOD: Video on demand. Pre-recorded video, in contrast to live streaming. Mux stores VODs as "assets" with a playback_id.
If the junior dev can't answer a question from this doc, the doc is wrong. Open an issue against it mid-hackathon and update in-place — the spec is a live artifact.

Want me to generate the actual scaffold commits (Neon schema SQL, Wrangler config, PersonaDO + coding-agent skeleton, persona seed JSON) so you open your laptop tomorrow to a working repo?