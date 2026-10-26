# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apologify.com is an Astro web app that turns a written apology into a **beautiful, shareable web page**. The core flow:

1. The user says who the apology is for and what happened, and picks a tone.
2. AI writes a sincere, personal apology about that specific moment.
3. The user picks a **design** (one of 13 full-page templates) and previews it live.
4. They publish it and **send** the link (WhatsApp/SMS/email/QR/story image).
5. The recipient opens a sealed **envelope**, reads it, likes it and can answer **"I forgive you" / "I need some time"** — the sender sees that on the dashboard and gets an email.

Around the product: a **legacy library of example letters** (`/examples`, SEO), generated **articles** (`/articles`), a US-facing **`/sorry-card`** landing and an original-data **study** (`/research/why-people-apologize`).

## Tech Stack

- **Framework**: Astro 7 (`output: 'static'` + on-demand routes), Vercel adapter with ISR. `trailingSlash: 'never'`.
- **UI**: Astro components + Svelte 5 islands (generator, recipient actions, owner bar, publish, theme picker). Preact/React also installed.
- **Styling**: Tailwind CSS + DaisyUI. Custom DaisyUI theme **`apology`** ("ink on paper": paper `#FAF7F1`, ink `#241F1A`, postmark-red primary `#C1272D`, ink-blue accent `#2C4A6E`, sage secondary; square buttons, 0.25rem boxes) in `tailwind.config.mjs`, set via `<html data-theme="apology">` in `src/layouts/LayoutBase.astro`. The site chrome shares Apology News's language (magazine layout, hairlines, small tracked caps, red only for the main action): `Layout.astro` scopes it under `.site` (Jost for UI, Spectral set light for every h1–h3 and for `.prose`, `.btn` as square caps, helpers `.caps` / `.ap-link`, tokens `--ap-*`). Avoid pills, gradient washes, icon cards, eyebrow labels and emoji icons. Brand mark: a postmark-red wax seal with a Spectral italic "A" — `public/seal.svg` (embossed seal: logo in header, footer, sign-in; keep it ≥40px) and the favicon set (`favicon.svg`/`.ico`/PNGs: flat seal, also used small in the News masthead; apple/android icons: embossed seal on paper). Fonts (one Google Fonts link in `LayoutBase`): **Spectral** (display + reading) and **Jost** (UI) everywhere, plus Dancing Script (signatures) and Anton (Keep Calm, Newspaper). Tailwind `font-display`/`font-serif` = Spectral, `font-sans` = Jost; the share images (`shareImage.ts`) use the same pair.
- **AI**: apology generation runs on **Claude Haiku 4.5** via `src/lib/server/anthropic.js` (`ANTHROPIC_API_KEY`). OpenAI is only used by local scripts (news covers). The model is defined in `anthropic.js` — do NOT change it without the owner's say-so.
- **Database**: Turso (libsql) — `src/lib/turso.ts`.
- **Auth**: better-auth (`src/lib/auth.ts` / `auth-client.ts`), Google sign-in. Required only to publish.
- **Email**: Resend REST API (`src/lib/server/notify.ts`), domain `apologify.com` verified (DNS at Namecheap).
- **Share images**: `@vercel/og` (satori) in `src/lib/server/shareImage.ts`.
- **Analytics**: Vercel Web Analytics (`src/components/VercelAnalytics.astro`, in `LayoutBase`). UTM params show up as `utmSource`/`utmCampaign`.
- **Package manager**: pnpm. `node_modules` was installed with **pnpm 10.33.0**; the global pnpm 11 wants to relink the store, so add deps with `CI=true npx -y pnpm@10.33.0 add <pkg>`.

## Development Commands

```bash
pnpm install                 # install deps (see pnpm note above)
npx astro dev                # dev server, runs as a background daemon on localhost:4321
npx astro dev status|logs|stop
npx astro check              # type-check
npx astro build              # production build (the real gate before deploy)
pnpm db:init-pages           # init / migrate apology_pages (adds columns idempotently)
node scripts/research/analyze-apologies.mjs   # regenerate the apology study data
```

`pnpm build` = `astro check && astro build`. Deploys: push to `main` → Vercel production (check with `gh api repos/sotoplatero/apologify/commits/<sha>/status`). After large edits the dev server's HMR can get stuck — `npx astro dev stop` and start again; it's not a code error if `astro check`/`astro build` pass. Production is behind Vercel's bot checkpoint for non-browser clients (curl gets 429) — test production from a real browser.

## Architecture

### Apology pages (the product)

Table **`apology_pages`**; data access + types in **`src/lib/apologyPages.ts`** (`ApologyPage`). Columns: `slug`, `recipient`, `recipient_name`, `sender_name`, `visibility` (`private`|`public`), `owner_id`, `message`, `title`, `theme`, `tone`, `is_paid`, `accepted_at` (legacy), `likes`, `opened_at`, `response` (`forgiven`|`not_yet`), `responded_at`, `created_at`. Like dedup in `page_likes` (salted IP+UA hash).

Key functions: `saveApologyPage`, `getApologyPageBySlug`, `publishApologyPage` (owner or unowned only), `updatePageTheme` (owner-only), `likeApology`, `markApologyOpened` (first non-owner open only), `respondToApology` (owner can't answer their own), `getPublishedPagesByOwner`, `getRecentPublicPages`, `getAllPublicSlugs`.

### Generation, publish & send flow

1. `ApologyGenerator.svelte` (on `/generator` and `/generator/[recipient]`) collects who / what happened / tone / signature.
2. Action `createApologyPage` (`src/actions/index.ts`) → moderation pre-check → `generateApologyContent()` (Claude Haiku via `callLLM`) → moderation post-check → saves a **private draft**, returns the slug.
3. Full-screen editor: live preview iframe (`/sorry/[slug]?preview=1&theme=…`) + design picker.
4. **Publish** calls `publishApologyPage`: signed in → `/sorry/[slug]?published=1`; anonymous → `/sign-up?redirect_url=/publish?...`, and `/publish` finishes it.
5. On `/sorry/[slug]`, the **owner** sees `OwnerBar.svelte`: the **"Send it"** panel (editable teaser message, WhatsApp/Telegram/SMS/own-email links, copy, native share, QR code, story teaser). It opens automatically after publishing (and via `?send=1`). It is the one place to share — the dashboard just links to the page (Open).
6. The **recipient** sees `EnvelopeReveal.astro` (tap to open, once per session; records `opened_at`), then the template, whose `ApologyActions.svelte` runs: heart/like → "I forgive you ❤️" / "I need some time" → "Share to your story" / "Make your own apology". Templates whose heart label already says "forgive" count the like as the answer.
7. `notifyOwner()` emails the owner on first open and on each answer (no-op without `RESEND_API_KEY` + `EMAIL_FROM`). `/dashboard` shows Not opened / Opened / Forgiven / Needs time.

### Share images

- `/og/[slug].png` (1200×630, the page's `og:image`) and `/story/[slug].png` (1080×1920): recipient name + title + sender on a sealed envelope — **never the apology text**.
- satori rejects `undefined` style values and `inset`; the envelope is an inline SVG.

### Designs / templates

- Each design is a self-contained full-page Astro component in `src/components/templates/` receiving `{ title, heading, paragraphs, senderName, slug, acceptedAt, preview }`, with its own palette/motion and `@media (prefers-reduced-motion: reduce)`.
- Catalog: `src/lib/themes.js` (`THEMES`: `id`, `label`, `emoji`, `premium`, `bgClass`, `retired?`; `listThemes()` = live designs only, `resolveTheme()`, `canonicalThemeId()`, `isPremiumTheme()`). 13 live designs: Letter (`classic`), Editorial, Handwritten, Velvet, Night (`starry`), Minimal, Postcard, Watercolor, Statement (`formal`), Newspaper, Swiss, Cute (`cute-duck`), Boarding Pass.
- **Retired designs**: still used by saved pages → kept with `retired: true` (hidden from pickers, still render: `keep-calm`, `zine`); unused → deleted, with an alias in `RETIRED_ALIASES` (ransom, constructivist, letterpress, typewriter, telegram, sticky-note, mixtape, chalkboard, illuminated) so old ids render the closest live design. Check `SELECT theme, COUNT(*) FROM apology_pages GROUP BY theme` before deleting a design.
- The **template map** (id → component) lives once in `src/components/templates/registry.ts` (`templateFor(id)`), used by `/sorry/[slug]`, `/demo` and `/studio/card`.
- `/demo?theme=` renders any template with sample content (no DB). Thumbnails: `public/designs/<id>.jpg` (~820×1040) from `/demo?theme=<id>&bare=1` (remove `astro-dev-toolbar` first).
- **Premium/paywall is deferred**: all designs are `premium: false`; publish/update still downgrade premium themes to `classic`. Charging requires Vercel Pro (Hobby is non-commercial).

### Example letters library (legacy, SEO)

- Live table **`letters`** (`source`: `static` seed | `generated`), accessed via `src/lib/db.ts` / `src/lib/letters.ts`. `user_letters` is the old pre-migration table — not read by the site.
- Routes: `/examples`, `/examples/[...page]`, `/examples/[recipient]`, `/examples/[recipient]/[slug]` (SSR, ISR-cached).
- The directory is letters only: no guides or editorial intros, and no filters (`/examples?recipient=X` 301s to `/examples/X`; `?tone=`/`?q=` 301 to `/examples`). How-to/SEO content goes in the blog; a recipient page links to `/articles/how-to-write-an-apology-letter-to-a-<recipient>` when that article exists.
- `src/lib/recipients.js`: `normalizeRecipient()` maps legacy free-text recipients ("Boyfriend ", "gf") to canonical ids for 301s; `recipientLabel()`. Full recipient list: `allRecipients` in `src/lib/apologyData.js` (`recipients` = only those with generator pages).
- **Pruned letters**: `letters.unlisted = 1` (not indexed by Google or not a genuine apology, and no search clicks) → page answers **410 Gone**; every listing/count/related/sitemap query filters `unlisted = 0`. Reversible: `node scripts/unlist-letters.js --restore scripts/research/unlisted-letters.json`.

### Articles

Markdown in `src/data/articles/<slug>/index.md`, loaded with `import.meta.glob` in `src/lib/articles.ts` (not content collections — see `docs/PENDING.md`). The old generator script (`injest.js`) was removed. Routes: `/articles/[slug]`, `/articles/[...page]`. 42 thin, never-indexed articles were removed (git history keeps them).

### Apology News (`/news`)

Weekly newsletter of public apologies scored 0–5 in half points (signed-in readers vote their own 0–5 score; `news_votes`). It has its **own magazine layout** in the site's palette: airy, hairlines, the app's warm paper/ink, red used sparingly, Spectral display at a light weight + Jost UI, small quiet "x/5" scores, still-life cover photos via `src/layouts/NewsLayout.astro` (own masthead/footer, tokens `--an-*` on `.an`). Product context: `PRODUCT.md`. One folder per issue: `src/data/news/<YYYY>-w<NN>/issue.json` (+ optional `body.md`), with a `slug` and a cover `image` in `public/news/<slug>.webp`; loaded and Zod-validated in `src/lib/news.ts` (a malformed issue fails the build). Pages: `/news` (newsletter home + signup), `/news/[slug]` (the issue as a post), `/news/rss.xml`; fallback share image `/news-og/[slug].png`. Signup is double opt-in: `/api/news/subscribe` emails a signed link, `/api/news/confirm` adds the contact to the Resend segment (`src/lib/server/newsletter.ts`; needs `RESEND_SEGMENT_ID`, `NEWS_SIGNING_SECRET`). Covers: `node scripts/news-cover.mjs <week>` (gpt-image-2.5-flare). Issues are produced by the n8n workflow "Apology News: Draft" (source in `n8n/`), which opens a PR; merging publishes. Email goes out via "Apology News: Send". Plan, rubric and prompts: `docs/newsletter/`.

### Research

- `/research/why-people-apologize`: 845 genuine apologies classified into 14 reasons (Claude Haiku 4.5). Data: `src/data/apology-study.json` (aggregates only) produced by `scripts/research/analyze-apologies.mjs`; the per-letter cache in `scripts/research/.cache/` is gitignored and never committed. Charts: `src/components/research/BarChart.astro` (bar blue `#2F5E99` + red highlight, validated against the paper surface).
- Shareable chart: `public/research/why-people-apologize-chart.png`. Outreach copy and target list: `docs/outreach/apology-study.md`.

### Social Studio

`social-studio/` is a standalone CLI that renders the real designs to social images via the app (`POST /api/social-card` + gated `/studio/card`, key `STUDIO_API_KEY`) and publishes via Post Bridge. See `social-studio/README.md`.

### Key routes

- `/` — homepage. `/generator`, `/generator/[recipient]` — builder (recipient landings target "sorry website for {recipient}", with real example links + FAQs).
- `/sorry/[slug]` — the live page (public = indexable; draft/preview = `noindex`). `/og/[slug].png`, `/story/[slug].png` — share images.
- `/sorry-card` — US "sorry card" landing. `/research/why-people-apologize` — study. `/designs` — design gallery.
- `/customize?slug=` (owner), `/publish?slug=&theme=`, `/dashboard` (owner's published pages + status; Open / Design / Unpublish), `/demo?theme=`.
- `/examples*`, `/articles*` — legacy library + blog.

`noindex`: `/demo`, `/customize`, `/publish`, `/sign-in`, `/sign-up`, `/dashboard`, `/404`, and non-public `/sorry` pages.

### URLs, caching & sitemaps (gotchas)

- `trailingSlash: 'never'` — Vercel 308-redirects `/x/` → `/x`; canonicals are slash-less and query-free (normalized in `LayoutBase.astro`). Never link with a trailing slash.
- Every on-demand route not in the ISR `exclude` list (`astro.config.mjs`) is **cached forever per deploy**, and ISR ignores the query string. Anything per-request (actions, auth, APIs, drafts) must be excluded — `/_actions/*` was once cached and served one user's apology to everyone for months. Images that vary by query need separate paths (hence `/og/` vs `/story/`).
- Sitemaps: `sitemap-index.xml` (static, @astrojs/sitemap, filtered), `sitemap-examples.xml` (DB letters, `unlisted = 0`), `sitemap-pages.xml` (public `/sorry` pages). All in `public/robots.txt` and submitted in Search Console.
- Legacy `/examples/<free-text recipient>/<slug>` URLs 301 to the canonical letter; unknown ones `Astro.rewrite('/404')` (real 404; `404.astro` is on-demand so rewrites work).

## Important Files

- `src/actions/index.ts` — actions: `createApologyPage` (+ `generateApologyContent` prompt), `publishApologyPage`, `likeApology`, `getApologyLikes` (likes + response + names), `markApologyOpened`, `respondToApology`, `updateApologyTheme`, `unpublishApology`.
- `src/lib/apologyPages.ts` — apology-page DB layer + types.
- `src/lib/server/anthropic.js` — apology LLM (Claude Haiku 4.5).
- `src/lib/server/notify.ts` — owner emails (Resend). `src/lib/server/shareImage.ts` — OG/story images. `src/lib/server/moderation.ts` — content gate.
- `src/components/ApologyGenerator.svelte` — builder + editor. `OwnerBar.svelte` — send panel. `ApologyActions.svelte` — recipient like/answer/share. `EnvelopeReveal.astro` — tap-to-open envelope.
- `src/lib/themes.js` — design catalog. `src/lib/display.js` — `apologyHeading()` / `apologyParagraphsHtml()`.
- `scripts/init-apology-pages.js` — apology_pages schema/migrations. `scripts/unlist-letters.js` — prune/restore letters.
- `docs/PENDING.md` — open decisions and parked ideas.

## Environment Variables

See `.env.example`:
- `ANTHROPIC_API_KEY` — apology generation (and the research script).
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — database.
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — auth.
- `RESEND_API_KEY`, `EMAIL_FROM` (`Apologify <hello@apologify.com>`) — owner notifications.
- `STUDIO_API_KEY` — Social Studio render endpoint.
- `OPENAI_API_KEY` — local scripts only (news covers).

Production env vars live in Vercel (project `damian-sotos-projects/apologify`); the CLI is linked (`.vercel/`, `.env.local` only holds `VERCEL_OIDC_TOKEN`).

## Testing & Validation

- No formal test suite (a few `*.test.js` helpers). Run `npx astro check` and `npx astro build` before pushing.
- Manually test generator → publish → send → (incognito) open envelope → like → answer, and confirm the owner email.
- For visual checks, render with Puppeteer from `social-studio/node_modules/puppeteer` against the local dev server (desktop 1440 + mobile 390).
- Test data in production DB: insert a throwaway page, test, then delete it (and its `page_likes` rows).

## Common Patterns

### Add a new design template

1. Create `src/components/templates/XxxTemplate.astro` following the props contract (motion + `prefers-reduced-motion`; hardcode its palette).
2. Register it in `src/lib/themes.js`.
3. Add the `id → component` entry to `src/components/templates/registry.ts`.
4. Generate `public/designs/<id>.jpg` from `/demo?theme=<id>&bare=1` (820×1040, JPEG).

### Add a column to apology_pages

Add an idempotent `ALTER TABLE` to `scripts/init-apology-pages.js`, run `pnpm db:init-pages` **before** deploying code that reads it, then extend `ApologyPage` + `rowToPage` in `src/lib/apologyPages.ts`.

### Moderation

Public pages are user content — delete via an `apology_pages` query by slug/owner. Keep the public directory clean; it is indexable. Example letters are pruned with `unlisted`, not deleted.

### Modifying the generator

- Validation: Zod schema in `createApologyPage`. Prompt: `generateApologyContent()`. UI: `ApologyGenerator.svelte`.
- Apologies must recount the actual wrongdoing, specifically — never generic.
