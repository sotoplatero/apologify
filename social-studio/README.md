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

## Test
```bash
npm test
```
