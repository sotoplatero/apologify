# Social Studio

Standalone tool to turn Apologify's **real** designs into social images and
publish them via Post Bridge. It never replicates templates: it asks the app to
render the actual `.astro` design (single source of truth, zero drift) and
screenshots the result. The tool only needs an app URL + a shared key.

## How it works

1. The app exposes `POST /api/social-card`, protected by `x-studio-key`
   (== `STUDIO_API_KEY`). Given `{ theme, title, to, message, sender }` it
   renders the real design and returns self-contained HTML (CSS inlined).
2. The studio POSTs content + key, screenshots the HTML with Puppeteer at
   1080×1350 / 1080 / 1920, and publishes via Post Bridge (draft by default).
3. The design catalog comes from the app's `GET /api/designs.json` — nothing
   is hardcoded, so new app designs appear automatically.

## Setup
```bash
cd social-studio
npm install                 # also downloads Chromium (Puppeteer)
cp .env.example .env        # set APP_URL, STUDIO_API_KEY (must match the app), + optional keys
```
The app must be reachable at `APP_URL` (default `http://localhost:4321`) when
generating — run it with `pnpm dev` / `pnpm preview`. Set the same
`STUDIO_API_KEY` in the app's `.env` and here.

## Usage
```bash
npm run studio -- --list
npm run studio -- --scenario random --dry-run
npm run studio -- --design typewriter --recipient "my partner" --topic "I forgot our anniversary" --tone sincere
npm run studio -- --scenario birthday --schedule "2026-07-06T14:00:00Z"
npm run studio -- --scenario birthday --publish     # live (asks to confirm)
```

Defaults to a **draft** in Post Bridge unless `--publish`. Content is English.
Add scenarios by editing `scenarios.json`. Designs are the app's — add them in
the app and they show up here via `/api/designs.json`.

## No API key — write the content yourself (or via your coding agent)

Skip the Anthropic call entirely with `--content <file>`. Provide a JSON file
and the tool just renders + publishes it (no `ANTHROPIC_API_KEY` needed). This
is the intended path when you run the tool through a Claude Code agent: the
agent writes the JSON, then invokes the tool.

```bash
npm run studio -- --scenario flaked --design sticky-note --content out/content.json --dry-run
```

`content.json` shape (the greeting "Dear X," / "To X," is derived by the app
from the scenario recipient — don't include it):
```json
{
  "title": "I Bailed. Again.",
  "paragraphs": ["First paragraph… supports **bold** and *italic*.", "Second paragraph."],
  "senderName": "Sam",
  "captions": {
    "default": "Instagram/Facebook caption ending with a CTA to apologify.com",
    "x": "tweet under 280 chars + apologify.com",
    "linkedin": "slightly more polished caption + apologify.com",
    "hashtags": ["#Apology", "#Apologify"]
  }
}
```

## Test
```bash
npm test
```
