# Task: Harvest ~200 authentic Y2K web assets for Geostumble

You are harvesting image assets from late-1990s and early-2000s websites to seed
a hackathon project. Assets must look *authentically* period-accurate. Do NOT
accept 2020s "retro-style" recreations.

The assets you produce will be consumed by an LLM coding agent that calls
`list_assets({ tags: string[] })`. It can only ask for tags that exist in your
controlled vocabulary (see §5). Inventing tags breaks the downstream consumer.

---

## 1. Output layout — create this BEFORE downloading anything

```
./assets/
├── tiles/              # final home, one file per accepted tile
├── gifs/
├── badges/
├── wordart/
├── counters/
├── _raw/               # untriaged downloads, deleted or moved within 60s
├── _rejected/          # failed quality checks + sibling .reason.txt
├── _state/
│   ├── tag-vocab.json  # write this FIRST from §5; single source of truth
│   ├── progress.json   # checkpoint: counts, seen hashes, last source cursor
│   └── seen-hashes.txt # one SHA256 per line, append-only
├── manifest.json       # roll-up, written LAST
└── harvest-report.md   # written LAST, after manifest
```

Every accepted asset has a sidecar at `{path}.meta.json` written at acceptance
time. The manifest is rebuilt from sidecars at the end — it is disposable,
sidecars are the source of truth. If you crash, re-running regenerates the
manifest from what's on disk.

---

## 2. Per-asset pipeline (follow this order for every candidate)

Do NOT batch download then triage. Do each asset end-to-end so state stays
consistent:

1. **Discover** — pick a candidate URL from a source in §4.
2. **Dedupe check** — HEAD request; if response hints at a content hash you
   already have, skip. Otherwise proceed.
3. **Download** to `_raw/{tempname}`. Cap at 500 KB; abort mid-stream if exceeded.
4. **Hash** — SHA256 the bytes. If hash is in `_state/seen-hashes.txt`,
   delete `_raw/` copy and skip. Else append hash.
5. **Validate** (§6). On any reject: move to `_rejected/{slug}` with
   `_rejected/{slug}.reason.txt`. Do not count against quota.
6. **Classify** into one of `tile|gif|badge|wordart|counter` using §7.
7. **Tag** using §5 vocabulary (3–6 tags). If you can't hit 3 tags from the
   vocab, reject with reason `insufficient-tag-fit`.
8. **Move** from `_raw/` to `{kind}/{slug}.{ext}` using §8 naming.
9. **Write sidecar** `{path}.meta.json` (schema in §9) — BEFORE moving to the
   next asset. This is atomic: sidecar must exist for every file in a kind/
   folder.
10. **Update progress** — increment the per-kind counter in
    `_state/progress.json` and flush to disk.

If step 9 fails or is interrupted, on next run delete any orphan files
(file present, sidecar missing) from kind/ folders before resuming.

---

## 3. Target inventory

Minimums. Over-collect freely; under-collection fails the task.

| Kind     | Min | What it is |
|----------|-----|------------|
| tiles    | 60  | Seamlessly-tiling backgrounds, 50×50 to 200×200, GIF/JPG. Stars, flames, clouds, water, checker, marble, paper. |
| gifs     | 80  | Animated decorative GIFs. Dancing bananas, "under construction", blinking NEW/HOT, spinning mail, waving flags, flaming skulls. |
| badges   | 20  | Static "Best viewed in Netscape/IE 4", "Webring", "HTML 4.0 compliant"; 88×31 buttons especially. |
| wordart  | 30  | WordArt-style text graphics. "WELCOME", "MY PAGE", "GUESTBOOK", names. Transparent PNG preferred. |
| counters | 10  | LED-style 0–9 digit strips for hit counters. |

Total floor: **200**.

---

## 4. Sources, in priority order

Work through top to bottom. Stop a source once its category quota is met.

1. **GifCities** — https://gifcities.org/ — Internet Archive's GeoCities GIF
   search. Primary source for `gifs` and `wordart`. Queries:
   `dancing banana`, `under construction`, `new`, `hot`, `cool`, `email`,
   `mail`, `webring`, `welcome`, `guestbook`, `hit counter`. Take 5–15 per
   query.
2. **Web Design Museum** — https://www.webdesignmuseum.org/ — GeoCities/Y2K
   galleries. Harvest embedded decorations, not full-page screenshots.
3. **textfiles.com** — http://textfiles.com/art/ — image-format only.
4. **Wayback Machine** — https://web.archive.org/ — 1999-01-01 to 2001-12-31
   snapshots. Seeds: `web.archive.org/web/2000*/geocities.com`,
   `.../angelfire.com`, `.../tripod.com`. Skip page chrome (nav, logos).
5. **Google Images (last resort)** — only with `"geocities"` or `"1999 web"` in
   the query. Aggressively reject modern vaporwave/synthwave.

---

## 5. Tag vocabulary — write to `_state/tag-vocab.json` FIRST

This file is the contract with the downstream coding agent. Do not invent
tags. If a tag you want isn't here, reject the asset.

```json
{
  "color":    ["black","white","red","orange","yellow","green","blue","purple","pink","rainbow","neon","pastel","dark","bright","metallic"],
  "theme":    ["space","fire","water","nature","ocean","sky","stars","hearts","flowers","skulls","animals","cartoon","cyber","techno","glitter","holographic","geometric","checkered","marble","wood","paper","grid"],
  "mood":     ["cute","edgy","cheerful","creepy","serious","silly","romantic","nostalgic","aggressive"],
  "function": ["welcome","new","hot","cool","email","guestbook","webring","construction","hit-counter","blinking","spinning","waving","dancing"],
  "era":      ["early-web","late-90s","y2k","aol-era","geocities","angelfire"]
}
```

**Tagging rules:**
- 3–6 tags total per asset, drawn from any of the five groups.
- At least 1 tag from `color` OR `theme`.
- `function` tags apply to `gifs` and `counters` only.
- `era` tags are optional but encouraged when provenance is clear.

---

## 6. Quality filters (reject before classify)

Reject if ANY holds. Write the matched rule name into `.reason.txt`.

| Rule name                | Condition |
|--------------------------|-----------|
| `forbidden-filename`     | URL/filename contains `logo`, `banner_ad`, `header`, `nav` |
| `too-large-dimensions`   | width > 800 OR height > 600 (tiles exempt from height limit only if ≤ 600 width) |
| `too-large-bytes`        | file size > 500 KB |
| `svg-anachronism`        | MIME is image/svg+xml |
| `modern-timestamp`       | embedded metadata shows year > 2005 with no period-evidence |
| `photograph`             | photo (not a tiling pattern) |
| `retro-fake`             | 2020s "retro aesthetic": chrome bevels, clean vaporwave palettes, Windows-95-mockup-made-with-Figma look |
| `no-provenance`          | can't record a `source_url` |
| `insufficient-tag-fit`   | fewer than 3 tags from the vocabulary apply |

---

## 7. Classification decision tree (kind = ?)

Apply in order; first match wins.

1. Filename/alt-text contains `counter` OR image is a strip of LED-style
   digits 0–9 → **counter**.
2. Dimensions ≈ 88×31 OR filename/alt-text contains `netscape`, `ie4`,
   `webring`, `html4`, `powered-by`, `best-viewed` → **badge**.
3. File is GIF AND has >1 frame (animated) → **gif**.
4. File is PNG with alpha AND contains rendered text (letters visible) →
   **wordart**.
5. Dimensions ≤ 256×256 AND aspect ratio between 0.5 and 2.0 AND filename
   context suggests tiling (`tile`, `bg`, `background`, `pattern`, or
   dimensions are an obvious power-of-2 square) → **tile**.
6. Else: if animated → **gif**; if static with readable text → **wordart**;
   otherwise **reject** with reason `unclassifiable`.

Set `tileable: true` only for kind=`tile`.
Set `animated: true` only if frame count > 1 (verify, don't guess).

---

## 8. Naming

kebab-case, descriptive, stable. Extension matches actual MIME.

```
tiles/stars-blue-glitter.gif
gifs/dancing-banana-original.gif
gifs/under-construction-orange-sign.gif
badges/best-viewed-netscape-4.gif
wordart/welcome-rainbow.png
counters/led-red-7seg.gif
```

Collisions: append `-2`, `-3`, …

---

## 9. Sidecar schema — `{path}.meta.json`

Written at acceptance. One per accepted asset. Field names match SPEC.md §12
so `scripts/upload-assets.ts` can consume without remapping.

```json
{
  "key":         "assets/tiles/stars-blue-glitter.gif",
  "kind":        "tile",
  "tags":        ["blue", "stars", "space", "glitter", "dark"],
  "source":      "https://gifcities.org/...",
  "bytes":       3421,
  "w":           100,
  "h":           100,
  "mime":        "image/gif",
  "animated":    false,
  "tileable":    true,
  "archive_date": "2000-08-14",
  "sha256":      "abc123...",
  "flagged":     false,
  "notes":       ""
}
```

Required: `key`, `kind`, `tags`, `source`, `bytes`, `w`, `h`, `mime`,
`animated`, `tileable`, `sha256`. All measured from the file, never guessed.
Set `flagged: true` for ambiguous-era assets you want reviewed; leave a note.

---

## 10. Manifest — `manifest.json`, written LAST

After all sidecars exist, scan every `{kind}/*.meta.json`, concatenate into:

```json
{
  "generated_at": "2026-04-21T23:00:00Z",
  "total": 214,
  "by_kind": {"tile": 62, "gif": 84, "badge": 22, "wordart": 34, "counter": 12},
  "tag_vocab_ref": "_state/tag-vocab.json",
  "assets": [ /* sidecar contents, one per asset */ ]
}
```

---

## 11. Sample-first gate (MANDATORY)

Before bulk harvest:

1. Collect exactly **10 assets** end-to-end (2 per kind), all sidecars written.
2. Write `_state/sample-ready.txt` with one line per asset (path + tags).
3. **STOP**. Print: `SAMPLE READY — review ./assets/_state/sample-ready.txt`.
4. Wait for an explicit `GO` file at `_state/GO` before continuing. If running
   headless, continue after printing the stop message — but print it.

This catches taxonomy mistakes at 10 assets instead of 200.

---

## 12. Behavior

- **Rate limit:** ≤ 1 request per second per domain.
- **User-Agent:** `GeostumbleHackathonBot/1.0 (+eliothfraijo@gmail.com)`
- **robots.txt:** respect. Skip disallowed paths.
- **Retries:** max 2 on 404/403/timeout, then move on.
- **Dedupe:** by SHA256, via `_state/seen-hashes.txt`.
- **Provenance:** every sidecar MUST have `source`. No source → reject.
- **Resumability:** on start, if `_state/progress.json` exists, load counts
  and seen-hashes, skip kinds already at minimum, continue others.
- **Budget:** stop after 90 min wall-clock OR 5 GB downloaded, whichever first.
- **No uploads.** Do NOT push anything to R2, KV, or any remote. Local only.

---

## 13. Reporting — `harvest-report.md`

Write after `manifest.json`.

- Final count per kind vs minimum.
- Rejection count, top 5 rejection reasons.
- Sources that returned nothing useful (for retry).
- Sources that blocked you (429/403 patterns).
- Top 10 best finds (subjective; list paths).
- Flagged assets (ambiguous era): paths + notes.
- Any tag in the vocab that was never used — may indicate a gap.

---

## 14. Success criteria

Done when all are true:

- [ ] `_state/tag-vocab.json` matches §5 verbatim.
- [ ] `_state/sample-ready.txt` exists and sample was 10 assets across 5 kinds.
- [ ] `manifest.json` lists ≥ 200 assets.
- [ ] Every kind hits its minimum (§3).
- [ ] Every asset file has a matching `.meta.json` sidecar; no orphans.
- [ ] Every sidecar has all required fields (§9), including non-empty `source`
      and `sha256`.
- [ ] `_rejected/` contains `.reason.txt` for every rejected file.
- [ ] Zero duplicate SHA256 in manifest.
- [ ] Zero assets > 500 KB.
- [ ] All tags in all sidecars are members of `_state/tag-vocab.json`.
- [ ] `harvest-report.md` written.

Begin with §1 (create dirs), §5 (write tag-vocab), then §11 (sample of 10).
Report progress every 25 accepted assets.
