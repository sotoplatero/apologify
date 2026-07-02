# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Apologify.com is an Astro web app that turns a written apology into a **beautiful, shareable web page**. The core flow:

1. The user says who the apology is for and what happened, and picks a tone.
2. AI writes a sincere, personal apology.
3. The user picks a **design** (one of ~21 distinct full-page templates) and previews it live.
4. They publish it as its own page and share the link; the recipient can read it and **like** it (a heart).

The product also keeps a **legacy library of example apology letters** (static + generated) under `/examples`, used mainly as SEO content that funnels into the builder.

## Tech Stack

- **Framework**: Astro 5, hybrid rendering (static + SSR). Vercel adapter.
- **UI**: Astro components + Svelte islands for interactivity (generator, like button, publish, theme picker). Preact/React also available.
- **Styling**: Tailwind CSS + DaisyUI. The brand shell uses a **custom DaisyUI theme `apology`** ("ink on paper" — warm paper base, fountain-pen-ink-blue primary, postmark-red accent, sage success). Defined in `tailwind.config.mjs`; set via `<html data-theme="apology">` in `src/layouts/LayoutBase.astro`. Fonts: Fraunces (display), Lora (body serif), Inter (UI sans), Dancing Script (script), Anton (poster).
- **AI**: Apology generation runs on **Claude Haiku 4.5** via `src/lib/server/anthropic.js` (`ANTHROPIC_API_KEY`). Article generation (`pnpm injest`) still uses OpenAI. The model is defined in `anthropic.js` — do NOT change it without the owner's say-so.
- **Database**: Turso (libsql) — `src/lib/turso.ts`.
- **Auth**: better-auth (`src/lib/auth.ts` / `auth-client.ts`). Email + optional social. Required only to publish publicly.
- **Package manager**: pnpm.

## Development Commands

```bash
pnpm install          # install deps
pnpm dev              # dev server (localhost:4321)
pnpm build            # production build (astro check + astro build) — the real gate before deploy
pnpm build:remote     # build against the remote DB
pnpm preview          # preview the production build
pnpm astro check      # type-check only
pnpm db:init          # init legacy user_letters table
pnpm db:init-pages    # init / migrate the apology_pages table (adds columns idempotently)
pnpm injest           # generate articles
```

Note: after large edits the Astro dev server's HMR can get into a bad state (500s / stale CSS). If that happens, restart it (`npx astro dev stop` then `pnpm dev`) — it is not a code error if `astro check` / `pnpm build` pass.

## Architecture

### Apology pages (the current product)

Stored in the **`apology_pages`** Turso table. Data access + types live in **`src/lib/apologyPages.ts`** (`ApologyPage` interface). Key columns: `slug`, `recipient`, `recipient_name`, `sender_name`, `visibility` (`private`|`public`), `owner_id`, `message`, `title`, `theme`, `tone`, `accepted_at`, `likes`, `created_at`.

Key functions in `apologyPages.ts`:
- `saveApologyPage(...)` — insert a page.
- `getApologyPageBySlug(slug)` — fetch one (anyone with the link can view; drafts are `noindex`).
- `publishApologyPage(slug, userId, theme?)` — make public + claim ownership (owner or unowned only).
- `updatePageTheme(slug, ownerId, theme)` — change design (owner-only).
- `likeApology(slug)` / `getApologyLikes(slug)` — like counter.
- `getPublishedPagesByOwner(ownerId)` — the dashboard list (published only).
- `getRecentPublicPages` / `getAllPublicSlugs` — public directory / sitemap.

### Generation & publish flow

1. `ApologyGenerator.svelte` (on `/generator` and `/generator/[recipient]`) collects: who it's for, what happened, tone, signature.
2. Submits Astro action `createApologyPage` (`src/actions/index.ts`) → calls OpenAI (`src/lib/server/openai.js`) → saves a **private draft** to `apology_pages`, returns the slug.
3. Step 2 is a full-screen editor: a live preview (`/sorry/[slug]?preview=1&theme=…` in an iframe) + a design picker (thumbnail grid on desktop, horizontal filmstrip bottom-sheet on mobile). Body scroll is locked while open.
4. **Publish** (in the editor) calls the `publishApologyPage` action directly:
   - signed in → publishes and goes to `/dashboard` (one click);
   - anonymous → redirected to `/sign-up?redirect_url=/publish?...`; after auth, `/publish` completes it.
5. The live page is `/sorry/[slug]`, rendered with the chosen template; the recipient can **like** it.

### Designs / templates

- Each design is a self-contained full-page Astro component in `src/components/templates/` receiving `{ title, heading, paragraphs, senderName, slug, acceptedAt, preview }`. They hardcode their own colors/motion (each is its own visual world) and include `@media (prefers-reduced-motion: reduce)`.
- The catalog is `src/lib/themes.js` (`THEMES` array: `id`, `label`, `emoji`, `premium`, `bgClass`). `listThemes()`, `resolveTheme()`, `isPremiumTheme()`.
- The **template map** (id → component) is duplicated in `src/pages/sorry/[slug].astro` and `src/pages/demo.astro` — **add new templates in both**.
- `src/pages/demo.astro` (`/demo?theme=`) renders any template with fixed sample content (no DB) — used for previews and thumbnails.
- Thumbnails: `public/designs/<id>.jpg`, ~820×1040, captured from `/demo?theme=<id>&bare=1` (the `&bare=1` hides the "Use this design" CTA; also remove the `astro-dev-toolbar` element before screenshotting). Used by the picker, the home grid, and `/designs`.
- **Premium/paywall is deferred**: all designs are currently `premium: false`. `publishApologyPage`/`updateApologyTheme` still downgrade `premium: true` themes to `classic`, so when monetization ships, flip the flags and add the paywall.

### Legacy letters library (still live, mostly SEO)

- Static examples in `src/content/letters/` (JSON by recipient). Generated ones in the `user_letters` Turso table (`src/lib/db.ts`).
- `src/lib/letters.ts` unifies both; `src/lib/database.ts` queries static content collections.
- Surfaces at `/examples`, `/examples/[recipient]`, `/examples/[recipient]/[slug]` and feeds the home "Made in the open" section. This is the older system; the strategic direction is for public apology pages to become the living example library.

### Articles

Markdown under `src/content/articles/` (loaded via `src/lib/articles`). Generated by `injest.js` (patterns in `src/lib/patterns.js`, prompts in `src/lib/prompts.js`, Unsplash images). Routes: `/articles/[slug]`, `/articles/[...page]`.

### Key routes

- `/` — homepage (hero with a live product mockup, "why a page", **designs grid (3×2)**, how it works, "made in the open", recipients, FAQ, articles, CTA).
- `/generator`, `/generator/[recipient]` — the builder (SEO landing per recipient prefills it).
- `/designs` — **gallery of all designs** (indexable); cards open `/demo?theme=`.
- `/sorry/[slug]` — the live apology page (public = indexable; draft/preview = `noindex`).
- `/customize?slug=` — change an existing page's design (owner-only).
- `/publish?slug=&theme=` — publish confirmation / post-sign-up completion.
- `/dashboard` — the owner's **published** pages (change design / view).
- `/demo?theme=` — sample-content preview (`noindex`).
- `/examples*`, `/articles*` — legacy library + blog.

`noindex`: `/demo`, `/customize`, `/publish`, `/sign-in`, `/sign-up`, `/dashboard`, and non-public `/sorry` pages. `/designs` and public pages are indexable.

## Important Files

- `src/actions/index.ts` — actions: `createApologyPage`, `publishApologyPage`, `likeApology`, `getApologyLikes`, `updateApologyTheme` (+ `generateApologyContent` prompt).
- `src/lib/apologyPages.ts` — apology-page DB layer + types.
- `src/lib/themes.js` — design catalog.
- `src/lib/server/anthropic.js` — apology LLM (Claude Haiku 4.5; model configured here).
- `src/lib/display.js` — `apologyHeading()` / `apologyParagraphsHtml()` (shared render helpers).
- `src/components/ApologyGenerator.svelte` — the builder + editor.
- `src/components/CustomizeTheme.svelte` — change-design editor.
- `src/components/ApologyActions.svelte` — the recipient's like + share.
- `src/components/templates/*` — the ~21 design templates.
- `scripts/init-apology-pages.js` — apology_pages schema/migrations.

## Environment Variables

See `.env.example`:
- `OPENAI_API_KEY` — apology generation.
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — database.
- better-auth secrets (see `src/lib/auth.ts`) — auth / publishing.
- `UNSPLASH_ACCESS_KEY` — article generation only.

## Setup

1. `pnpm install`
2. Set `.env` (OpenAI, Turso, auth).
3. `pnpm db:init && pnpm db:init-pages`
4. `pnpm dev`

## Testing & Validation

- No formal test suite. Run **`pnpm build`** before deploying — it runs `astro check` and the full Vercel build, the real production gate.
- Manually test the generator → publish → like flow; `pnpm preview` to check the production build locally.

## Common Patterns

### Add a new design template

1. Create `src/components/templates/XxxTemplate.astro` following the props contract above (include motion + `prefers-reduced-motion`; hardcode its palette).
2. Register it in `src/lib/themes.js` (`id`, `label`, `emoji`, `premium`, `bgClass`).
3. Add the `id → component` entry to **both** `src/pages/sorry/[slug].astro` and `src/pages/demo.astro`.
4. Generate `public/designs/<id>.jpg` by screenshotting `/demo?theme=<id>&bare=1` (~820×1040, remove `astro-dev-toolbar` first; `&bare=1` hides the "Use this design" CTA).

### Change / regenerate a page's design

Owner-only via `updateApologyTheme` (action) → `updatePageTheme` (db). UI at `/customize?slug=`.

### Moderation

Public pages are user content — delete via a `apology_pages` query by slug/owner (add a helper if needed). Keep the public directory clean since it is indexable and reusable.

### Modifying the generator

- Validation: Zod schema in `createApologyPage` (`src/actions/index.ts`).
- Prompt: `generateApologyContent()` in the same file.
- UI: `ApologyGenerator.svelte`.
