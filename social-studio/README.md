# Social Studio

Standalone tool to turn Apologify designs into social images and publish them
via Post Bridge. Independent of the Astro app — its own deps, runs offline for
rendering, only hits the network for AI content and publishing.

## Setup
```bash
cd social-studio
npm install                 # also downloads Chromium (Puppeteer)
cp .env.example .env        # set ANTHROPIC_API_KEY and POST_BRIDGE_API_KEY
```

## Usage
```bash
npm run studio -- --list
npm run studio -- --scenario random --dry-run
npm run studio -- --design typewriter --recipient "my partner" --topic "I forgot our anniversary" --tone sincere
npm run studio -- --scenario birthday --schedule "2026-07-06T14:00:00Z"
npm run studio -- --scenario birthday --publish     # live (asks to confirm)
```

Defaults to a **draft** in Post Bridge unless `--publish`. Content is English.
Add scenarios by editing `scenarios.json`. Add designs by porting a template
into `templates/<id>.html` and registering it in `src/templates.mjs`.

## No API key — write the content yourself (or via your coding agent)

Skip the Anthropic call entirely with `--content <file>`. Provide a JSON file
and the tool just renders + publishes it (no `ANTHROPIC_API_KEY` needed). This
is the intended path when you run the tool through a Claude Code agent: the
agent writes the JSON, then invokes the tool.

```bash
npm run studio -- --scenario flaked --design sticky-note --content out/content.json --dry-run
```

`content.json` shape (the `heading` "Dear X," / "To X," is derived from the
scenario recipient — don't include it):
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
