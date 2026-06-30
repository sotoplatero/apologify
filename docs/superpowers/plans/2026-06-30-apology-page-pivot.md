# Apology Website Generator Pivot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Apologify's AI **text-letter** generator with an AI **apology-website** generator. Every generation produces a themed web page the creator shares by link. Pages are **private by default** (`noindex`, link-only) so anonymous users get a frictionless flow; **publishing publicly (indexable, listed, in the sitemap) requires signing in** — this is the anti-abuse gate. Works for a person ("sorry website for my girlfriend") and for a company apologizing publicly ("To our customers"). A "Made with apologify.com" watermark on free pages drives the viral/SEO loop.

**Architecture:** Delete the text-generator flow (`createLetter` + `RecipientGenerator.svelte`). All `/generator/[recipient]` pages use a new `ApologyPageBuilder` posting to a new `createApologyPage` action. The action calls OpenAI (model untouched) for the apology body, builds an SEO slug, and stores the page in a new `apology_pages` Turso table with `visibility` (`private`|`public`) and `owner_id`. Auth is **Better Auth** (self-hosted on the existing Turso DB): anonymous creations are always `private`; `public` requires an authenticated user. Because Better Auth is just API routes + a server-side session read (no Astro integration that forces SSR), `output: 'static'` is preserved unchanged. The public route `/sorry/[slug]` is `noindex` when private and fully indexable when public; a `/sorry` gallery + dynamic sitemap expose only public pages. The legacy SEO library (`/examples`, `/articles`) is kept untouched. Monetization (final phase) is a one-time Stripe unlock removing the watermark + enabling premium themes.

**Tech Stack:** Astro 5 (`output: 'static'` + per-route `prerender = false`), Svelte islands, Tailwind + DaisyUI, Turso (`@libsql/client`), `astro:actions`, `slugify`, Better Auth (`better-auth` + `@libsql/kysely-libsql` + `kysely`, on the existing Turso DB), OpenAI SDK (existing `callOpenAIChatCompletion`), Stripe (final phase). Pure-logic tests use Node's built-in `node --test` (zero new deps).

## Global Constraints

- **NEVER change the OpenAI model.** `src/lib/server/openai.js` uses `gpt-5-mini`; the model is owned by the user. Reuse `callOpenAIChatCompletion` as-is.
- **Remove the text-letter generator completely** — the `createLetter` action and `RecipientGenerator.svelte` are deleted.
- **Keep the legacy SEO library untouched:** `/examples/*`, `/articles/*`, the `letters` table, `Letter.svelte`, `database.ts`, `letters.ts`. Do not delete or modify them.
- **Privacy-by-default + publish-gate:** generated pages default to `visibility = 'private'` (`noindex`, shareable by link only). A page may be `'public'` (indexable, in `/sorry` gallery + sitemap) **only when created by an authenticated user** (Better Auth); store that user's id in `owner_id` for accountability. Anonymous requests for `public` are silently downgraded to `private`.
- **Auth is Better Auth** (`better-auth`), persisted in the existing Turso DB via the Kysely libsql dialect. Env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, reusing the existing `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`. Keep `output: 'static'`; every auth-touching route is `prerender = false` so the middleware runs and populates `Astro.locals.user` / `Astro.locals.session`. The server auth config reads env via `process.env` (works in both the Astro server runtime and the `@better-auth/cli`).
- **Two audiences, one product:** *person* (named recipient) and *public* (company / "our customers") — a content/tone distinction, independent of `visibility`.
- **Moderation guard** runs on every creation via the existing `normalizeContext` + URL-block refinement; keep them in the new action.
- **No new runtime dependency beyond Better Auth** (`better-auth`, `@libsql/kysely-libsql`, `kysely`) until the monetization phase (which adds `stripe`).
- **Pure-logic files are plain `.js` with JSDoc** so `node --test` runs with no transpiler.
- **Tailwind only**, matching the existing purple (`purple-600`), rounded-`xl`/`2xl` aesthetic.
- Manual verification assumes `pnpm` + `.env` with `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENAI_API_KEY`, `PUBLIC_SITE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

---

## File Structure

**Create:**
- `src/lib/slug.js` (+ `src/lib/slug.test.js`) — `randomSuffix`, `buildApologySlug`, `isLikelySlug`.
- `src/lib/themes.js` (+ `src/lib/themes.test.js`) — theme registry.
- `src/lib/apologyPages.ts` — Turso CRUD (with `visibility` + `owner_id`).
- `src/lib/auth.ts` — Better Auth server instance (Kysely libsql dialect, email+password).
- `src/lib/auth-client.ts` — Better Auth Svelte client (`createAuthClient`).
- `src/pages/api/auth/[...all].ts` — Better Auth catch-all handler.
- `src/middleware.ts` — populates `Astro.locals.user` / `Astro.locals.session` from the session.
- `src/pages/sign-in.astro`, `src/pages/sign-up.astro` — pages hosting the auth form island.
- `src/components/AuthForm.svelte` — email/password sign-in & sign-up form.
- `src/components/HeaderAuth.svelte` — client island showing Sign in / account state.
- `src/pages/sorry/[slug].astro` — themed apology page (noindex if private, indexable if public).
- `src/pages/sorry/index.astro` — public gallery (public pages only).
- `src/pages/sitemap-pages.xml.ts` — dynamic sitemap of public `/sorry/[slug]` URLs.
- `src/components/ApologyPageBuilder.svelte` — generator UI.
- `src/components/ApologyShareResult.svelte` — share panel.
- `scripts/init-apology-pages.js` — migration.

**Modify:**
- `src/env.d.ts` — declare `App.Locals` (`user`, `session`) types.
- `src/layouts/LayoutBase.astro` + `src/layouts/Layout.astro` — add `noindex` prop.
- `src/components/Header.astro` — mount `HeaderAuth.svelte` island.
- `src/lib/apologyData.js` — add `public` recipient + contexts.
- `src/actions/index.ts` — remove `createLetter`; add `createApologyPage` (auth-gated visibility).
- `src/pages/generator/[recipient].astro` — builder for all recipients; pass `isSignedIn`; reword.
- `src/pages/generator/index.astro` — reword hub.
- `package.json` — add `db:init-pages`; (final phase) `stripe`.
- `.env.example` — Better Auth + site + (final phase) Stripe vars.

**Delete:** `src/components/RecipientGenerator.svelte`.

**Keep untouched:** `Letter.svelte`, `src/pages/examples/**`, `src/pages/articles/**`, `db.ts`, `letters.ts`, `database.ts`.

---

## Phase 0 — Remove text generator + foundations

### Task 1: Remove the text-letter generator

**Files:** Modify `src/actions/index.ts`; Delete `src/components/RecipientGenerator.svelte`.

**Interfaces:** Produces a `src/actions/index.ts` with no `createLetter` action and no `generateLetter`/`saveGeneratedLetter` import; **keeps** `normalizeContext`, `urlPattern`, and the `defineAction`/`z`/`ActionError`/`callOpenAIChatCompletion` imports (reused later).

- [ ] **Step 1: Confirm no other importers of the component**

Run: `grep -rn "RecipientGenerator" src/`
Expected: only its own file and `src/pages/generator/[recipient].astro` (rewired in Task 12).

- [ ] **Step 2: Remove `createLetter` + `generateLetter` + unused import**

In `src/actions/index.ts`: delete the `createLetter: defineAction({ ... })` entry (leave `export const server = { }`), delete the `generateLetter` function, and delete `import { saveGeneratedLetter } from '../lib/db';`. Keep `normalizeContext`, `urlPattern`, and the other imports.

- [ ] **Step 3: Delete the component**

Run: `git rm src/components/RecipientGenerator.svelte`

- [ ] **Step 4: Commit** (build is verified after Task 12 rewires the generator page)

```bash
git add src/actions/index.ts
git commit -m "refactor: remove text-letter generator (createLetter + RecipientGenerator)"
```

---

### Task 2: Add `noindex` support to the layout

**Files:** Modify `src/layouts/LayoutBase.astro`, `src/layouts/Layout.astro`.

**Interfaces:** Produces `Layout`/`LayoutBase` accepting optional `noindex?: boolean` (default `false`); when `true`, head includes `<meta name="robots" content="noindex,nofollow">`.

- [ ] **Step 1: Update `LayoutBase.astro`**

Add `noindex?: boolean;` to `interface Props`, add `noindex = false` to the props destructure, and inside `<head>` add:

```astro
{noindex && <meta name="robots" content="noindex,nofollow" />}
```

- [ ] **Step 2: Pass through `Layout.astro`**

Add `noindex?: boolean;` to its `Props`, `noindex = false` to the destructure, and forward `noindex={noindex}` to `<LayoutBase ...>`.

- [ ] **Step 3: Verify**

Run: `pnpm astro check`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/LayoutBase.astro src/layouts/Layout.astro
git commit -m "feat(layout): add optional noindex prop"
```

---

### Task 3: SEO slug builder (TDD)

**Files:** Create `src/lib/slug.js`, `src/lib/slug.test.js`.

**Interfaces:** `randomSuffix(length=6): string` (base36); `buildApologySlug({recipientName?, recipient, title}): string`; `isLikelySlug(value): boolean`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/slug.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomSuffix, buildApologySlug, isLikelySlug } from './slug.js';

test('randomSuffix is base36 of requested length and varies', () => {
  const a = randomSuffix(6);
  assert.equal(a.length, 6);
  assert.match(a, /^[0-9a-z]+$/);
  assert.notEqual(randomSuffix(6), randomSuffix(6));
});

test('buildApologySlug uses name + title and ends with a suffix', () => {
  const s = buildApologySlug({ recipientName: 'Mia', recipient: 'girlfriend', title: 'Forgetting Our Anniversary' });
  assert.match(s, /^mia-forgetting-our-anniversary-[0-9a-z]{6}$/);
});

test('buildApologySlug falls back to recipient when no name', () => {
  const s = buildApologySlug({ recipient: 'customers', title: 'Service Outage Apology' });
  assert.match(s, /^customers-service-outage-apology-[0-9a-z]{6}$/);
});

test('isLikelySlug validates kebab-case', () => {
  assert.equal(isLikelySlug('mia-forgetting-our-anniversary-ab12cd'), true);
  assert.equal(isLikelySlug('Has Space'), false);
  assert.equal(isLikelySlug('x'), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test src/lib/slug.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/slug.js`:

```js
import slugify from 'slugify';

/** @param {number} length @returns {string} */
export function randomSuffix(length = 6) {
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** @param {{recipientName?:string, recipient:string, title:string}} parts @returns {string} */
export function buildApologySlug(parts) {
  const lead = parts.recipientName && parts.recipientName.trim() ? parts.recipientName : parts.recipient;
  const base = slugify(`${lead} ${parts.title}`, { lower: true, strict: true }).slice(0, 60).replace(/-+$/, '');
  return `${base}-${randomSuffix(6)}`;
}

/** @param {string} value @returns {boolean} */
export function isLikelySlug(value) {
  return typeof value === 'string' && /^[a-z0-9-]{3,90}$/.test(value);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test src/lib/slug.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/slug.js src/lib/slug.test.js
git commit -m "feat(lib): add SEO apology-slug builder with tests"
```

---

### Task 4: Theme registry (TDD)

**Files:** Create `src/lib/themes.js`, `src/lib/themes.test.js`.

**Interfaces:** `THEMES`, `listThemes()`, `resolveTheme(id)` (fallback `classic`), `isPremiumTheme(id)`. Free: `classic`, `cute-duck`, `formal`. Premium: `hearts`, `starry`, `petals`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/themes.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listThemes, resolveTheme, isPremiumTheme } from './themes.js';

test('listThemes includes free + premium + formal', () => {
  const ids = listThemes().map((t) => t.id);
  assert.ok(ids.includes('classic'));
  assert.ok(ids.includes('cute-duck'));
  assert.ok(ids.includes('formal'));
  assert.ok(ids.includes('hearts'));
});

test('resolveTheme falls back to classic on unknown id', () => {
  assert.equal(resolveTheme('nope').id, 'classic');
  assert.equal(resolveTheme('formal').id, 'formal');
});

test('isPremiumTheme distinguishes free from premium', () => {
  assert.equal(isPremiumTheme('classic'), false);
  assert.equal(isPremiumTheme('formal'), false);
  assert.equal(isPremiumTheme('hearts'), true);
  assert.equal(isPremiumTheme('unknown'), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test src/lib/themes.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/themes.js`:

```js
/**
 * @typedef {Object} Theme
 * @property {string} id @property {string} label @property {string} emoji
 * @property {boolean} premium @property {string} bgClass @property {string} accentClass @property {string} font
 */

/** @type {Theme[]} */
export const THEMES = [
  { id: 'classic',   label: 'Classic',          emoji: '💌', premium: false, bgClass: 'bg-gradient-to-br from-purple-100 via-white to-pink-100',      accentClass: 'text-purple-700',  font: 'font-serif' },
  { id: 'cute-duck', label: 'Cute Duck',        emoji: '🐤', premium: false, bgClass: 'bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100',  accentClass: 'text-amber-700',   font: 'font-sans' },
  { id: 'formal',    label: 'Formal Statement', emoji: '🏛️', premium: false, bgClass: 'bg-gradient-to-br from-slate-100 via-white to-gray-100',       accentClass: 'text-slate-800',   font: 'font-serif' },
  { id: 'hearts',    label: 'Floating Hearts',  emoji: '💕', premium: true,  bgClass: 'bg-gradient-to-br from-rose-200 via-pink-100 to-red-100',       accentClass: 'text-rose-700',    font: 'font-serif' },
  { id: 'starry',    label: 'Starry Night',     emoji: '🌙', premium: true,  bgClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900', accentClass: 'text-indigo-200',  font: 'font-serif' },
  { id: 'petals',    label: 'Falling Petals',   emoji: '🌸', premium: true,  bgClass: 'bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100',    accentClass: 'text-fuchsia-700', font: 'font-sans' },
];

export function listThemes() {
  return THEMES.map(({ id, label, emoji, premium }) => ({ id, label, emoji, premium }));
}
/** @param {string} id @returns {Theme} */
export function resolveTheme(id) { return THEMES.find((t) => t.id === id) || THEMES[0]; }
/** @param {string} id @returns {boolean} */
export function isPremiumTheme(id) { const t = THEMES.find((x) => x.id === id); return t ? t.premium : false; }
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test src/lib/themes.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/themes.js src/lib/themes.test.js
git commit -m "feat(lib): add apology-page theme registry with tests"
```

---

### Task 5: `apology_pages` table + data access (visibility + owner)

**Files:** Create `scripts/init-apology-pages.js`, `src/lib/apologyPages.ts`; Modify `package.json`.

**Interfaces:**
- `interface ApologyPage { id?: number; slug: string; recipient: string; recipientName: string | null; senderName: string | null; audience: 'person' | 'public'; visibility: 'private' | 'public'; ownerId: string | null; message: string; title: string; theme: string; tone: string; isPaid: boolean; createdAt?: string; }`
- `saveApologyPage(data): Promise<number>` (data omits `id`,`isPaid`,`createdAt`)
- `getApologyPageBySlug(slug): Promise<ApologyPage | null>` (returns regardless of visibility)
- `getRecentPublicPages(limit): Promise<ApologyPage[]>` (visibility='public' only)
- `getAllPublicSlugs(): Promise<{ slug: string; createdAt?: string }[]>` (visibility='public' only)
- `markApologyPagePaid(slug): Promise<void>`

- [ ] **Step 1: Write the migration**

Create `scripts/init-apology-pages.js`:

```js
import { createClient } from "@libsql/client/web";
import 'dotenv/config';

const turso = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

async function init() {
  console.log('🚀 Creating apology_pages table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS apology_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      recipient TEXT NOT NULL,
      recipient_name TEXT DEFAULT NULL,
      sender_name TEXT DEFAULT NULL,
      audience TEXT NOT NULL DEFAULT 'person',
      visibility TEXT NOT NULL DEFAULT 'private',
      owner_id TEXT DEFAULT NULL,
      message TEXT NOT NULL,
      title TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT 'classic',
      tone TEXT NOT NULL DEFAULT 'heartfelt',
      is_paid INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_apology_pages_slug ON apology_pages(slug)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_apology_pages_visibility ON apology_pages(visibility, created_at)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_apology_pages_owner ON apology_pages(owner_id)`);
  console.log('✅ apology_pages ready');
}
init().catch((e) => { console.error('❌', e); process.exit(1); });
```

- [ ] **Step 2: Add the script**

In `package.json` `"scripts"`, add: `"db:init-pages": "node ./scripts/init-apology-pages.js",`

- [ ] **Step 3: Run the migration**

Run: `pnpm db:init-pages`
Expected: `✅ apology_pages ready`.

- [ ] **Step 4: Write the data-access module**

Create `src/lib/apologyPages.ts`:

```ts
import { turso } from './turso';

export interface ApologyPage {
  id?: number; slug: string; recipient: string; recipientName: string | null; senderName: string | null;
  audience: 'person' | 'public'; visibility: 'private' | 'public'; ownerId: string | null;
  message: string; title: string; theme: string; tone: string; isPaid: boolean; createdAt?: string;
}

function rowToPage(row: any): ApologyPage {
  return {
    id: row.id, slug: row.slug, recipient: row.recipient,
    recipientName: row.recipient_name ?? null, senderName: row.sender_name ?? null,
    audience: row.audience === 'public' ? 'public' : 'person',
    visibility: row.visibility === 'public' ? 'public' : 'private',
    ownerId: row.owner_id ?? null,
    message: row.message, title: row.title, theme: row.theme, tone: row.tone,
    isPaid: Number(row.is_paid) === 1, createdAt: row.created_at,
  };
}

export async function saveApologyPage(data: {
  slug: string; recipient: string; recipientName?: string | null; senderName?: string | null;
  audience: 'person' | 'public'; visibility: 'private' | 'public'; ownerId?: string | null;
  message: string; title: string; theme: string; tone: string;
}): Promise<number> {
  if (!turso) { console.warn('Turso not configured, page not saved'); return -1; }
  const result = await turso.execute({
    sql: `INSERT INTO apology_pages (slug, recipient, recipient_name, sender_name, audience, visibility, owner_id, message, title, theme, tone, is_paid)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    args: [data.slug, data.recipient, data.recipientName ?? null, data.senderName ?? null,
           data.audience, data.visibility, data.ownerId ?? null, data.message, data.title, data.theme, data.tone],
  });
  return Number(result.lastInsertRowid);
}

export async function getApologyPageBySlug(slug: string): Promise<ApologyPage | null> {
  if (!turso) return null;
  const r = await turso.execute({ sql: 'SELECT * FROM apology_pages WHERE slug = ? LIMIT 1', args: [slug] });
  return r.rows.length ? rowToPage(r.rows[0]) : null;
}

export async function getRecentPublicPages(limit: number): Promise<ApologyPage[]> {
  if (!turso) return [];
  const r = await turso.execute({ sql: "SELECT * FROM apology_pages WHERE visibility = 'public' ORDER BY created_at DESC LIMIT ?", args: [limit] });
  return r.rows.map(rowToPage);
}

export async function getAllPublicSlugs(): Promise<{ slug: string; createdAt?: string }[]> {
  if (!turso) return [];
  const r = await turso.execute("SELECT slug, created_at FROM apology_pages WHERE visibility = 'public' ORDER BY created_at DESC");
  return r.rows.map((row: any) => ({ slug: row.slug, createdAt: row.created_at }));
}

export async function markApologyPagePaid(slug: string): Promise<void> {
  if (!turso) throw new Error('Turso not configured');
  await turso.execute({ sql: 'UPDATE apology_pages SET is_paid = 1 WHERE slug = ?', args: [slug] });
}
```

- [ ] **Step 5: Type-check**

Run: `pnpm astro check`
Expected: no errors referencing `apologyPages.ts`.

- [ ] **Step 6: Commit**

```bash
git add scripts/init-apology-pages.js src/lib/apologyPages.ts package.json
git commit -m "feat(db): add apology_pages table with visibility + owner"
```

---

## Phase 1 — Auth (Better Auth)

### Task 6: Wire Better Auth (server, DB schema, middleware, client)

**Files:** Create `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/pages/api/auth/[...all].ts`, `src/middleware.ts`; Modify `src/env.d.ts`, `.env.example`, `package.json` (deps).

**Interfaces:** Produces `auth` (server instance) and `authClient` (Svelte client); `Astro.locals.user` / `Astro.locals.session` populated on `prerender = false` routes; Better Auth tables (`user`, `session`, `account`, `verification`) created in the Turso DB.

- [ ] **Step 1: Install dependencies**

Run: `pnpm add better-auth @libsql/kysely-libsql kysely`
Expected: all three appear in `package.json` dependencies.

- [ ] **Step 2: Create the server auth instance**

Create `src/lib/auth.ts`:

```ts
import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

// Read env from Vite (Astro runtime) or process.env (better-auth CLI / Node).
const E: Record<string, string | undefined> =
  (typeof import.meta !== "undefined" && (import.meta as any).env) || process.env;

export const auth = betterAuth({
  database: {
    dialect: new LibsqlDialect({
      url: E.TURSO_DATABASE_URL as string,
      authToken: E.TURSO_AUTH_TOKEN,
    }),
    type: "sqlite",
  },
  emailAndPassword: { enabled: true },
  secret: E.BETTER_AUTH_SECRET,
  baseURL: E.BETTER_AUTH_URL,
});
```

- [ ] **Step 3: Declare `App.Locals` types**

In `src/env.d.ts`, add (keep any existing `/// <reference ... />` lines):

```ts
import type { auth } from "./lib/auth";
type BetterAuthSession = typeof auth.$Infer.Session;
declare global {
  namespace App {
    interface Locals {
      user: BetterAuthSession["user"] | null;
      session: BetterAuthSession["session"] | null;
    }
  }
}
```

- [ ] **Step 4: Create the catch-all API route**

Create `src/pages/api/auth/[...all].ts`:

```ts
import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";

export const prerender = false;
export const ALL: APIRoute = async (ctx) => auth.handler(ctx.request);
```

- [ ] **Step 5: Create the middleware**

Create `src/middleware.ts`:

```ts
import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({ headers: context.request.headers });
  context.locals.user = session?.user ?? null;
  context.locals.session = session?.session ?? null;
  return next();
});
```

- [ ] **Step 6: Create the Svelte auth client**

Create `src/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/svelte";
export const authClient = createAuthClient();
```

- [ ] **Step 7: Add env vars**

In `.env.example` add:

```
PUBLIC_SITE_URL=https://apologify.com
BETTER_AUTH_URL=http://localhost:4321
BETTER_AUTH_SECRET=replace-with-a-long-random-string
```

In `.env`, set `BETTER_AUTH_URL` (local: `http://localhost:4321`; prod: `https://apologify.com`) and a real `BETTER_AUTH_SECRET` (generate with `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`). `TURSO_*` already exist.

- [ ] **Step 8: Generate + run the Better Auth schema migration**

Run: `npx @better-auth/cli@latest generate --config src/lib/auth.ts -y`
Then: `npx @better-auth/cli@latest migrate --config src/lib/auth.ts -y`
Expected: creates `user`, `session`, `account`, `verification` tables in the Turso DB (the CLI uses the same Kysely libsql dialect). Verify with:
`node -e "import('dotenv/config').then(async()=>{const {createClient}=await import('@libsql/client/web');const t=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});const r=await t.execute(\"SELECT name FROM sqlite_master WHERE type='table'\");console.log(r.rows.map(x=>x.name));})"`
Expected: list includes `user`, `session`, `account`, `verification`.

- [ ] **Step 9: Verify session wiring on an on-demand route**

Add a temporary `src/pages/whoami.astro`:

```astro
---
export const prerender = false;
const user = Astro.locals.user;
---
<pre>{JSON.stringify({ user })}</pre>
```

Run: `pnpm build && pnpm preview`, open `http://localhost:4321/whoami`.
Expected: `{"user":null}` (signed out), no server error — confirming middleware + `locals.user` work under `output: 'static'`. Also confirm `GET http://localhost:4321/api/auth/ok` returns a Better Auth response (not 404).

- [ ] **Step 10: Remove the probe and commit**

```bash
git rm src/pages/whoami.astro
git add src/lib/auth.ts src/lib/auth-client.ts src/pages/api/auth/[...all].ts src/middleware.ts src/env.d.ts .env.example package.json pnpm-lock.yaml
git commit -m "feat(auth): wire Better Auth (Turso/Kysely) + session middleware"
```

---

### Task 7: Auth forms, sign-in/up pages, header control

**Files:** Create `src/components/AuthForm.svelte`, `src/components/HeaderAuth.svelte`, `src/pages/sign-in.astro`, `src/pages/sign-up.astro`; Modify `src/components/Header.astro`.

**Interfaces:** Consumes `authClient` (Task 6). `AuthForm` props: `mode: 'signin' | 'signup'`, `redirectUrl: string`. `HeaderAuth` shows "Sign in" when signed out and "Sign out" when signed in (via `authClient.useSession()`).

- [ ] **Step 1: Create `AuthForm.svelte`**

```svelte
<script lang="ts">
  import { authClient } from "../lib/auth-client";
  export let mode: "signin" | "signup" = "signin";
  export let redirectUrl = "/generator";

  let name = "", email = "", password = "", error = "", loading = false;

  async function submit() {
    loading = true; error = "";
    const handlers = {
      onSuccess: () => { window.location.href = redirectUrl; },
      onError: (ctx: any) => { error = ctx.error?.message || "Something went wrong."; loading = false; },
    };
    if (mode === "signup") await authClient.signUp.email({ name, email, password }, handlers);
    else await authClient.signIn.email({ email, password }, handlers);
  }
</script>

<form on:submit|preventDefault={submit} class="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
  <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
  {#if mode === "signup"}
    <input bind:value={name} placeholder="Name" required class="w-full mb-3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
  {/if}
  <input bind:value={email} type="email" placeholder="Email" required class="w-full mb-3 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
  <input bind:value={password} type="password" placeholder="Password (min 8 chars)" minlength="8" required class="w-full mb-4 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
  {#if error}<div class="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>{/if}
  <button type="submit" disabled={loading} class="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all">
    {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
  </button>
  <p class="text-center text-sm text-gray-500 mt-4">
    {#if mode === "signup"}Already have an account? <a href="/sign-in" class="text-purple-600 underline">Sign in</a>
    {:else}No account? <a href="/sign-up" class="text-purple-600 underline">Create one</a>{/if}
  </p>
</form>
```

- [ ] **Step 2: Create `HeaderAuth.svelte`**

```svelte
<script lang="ts">
  import { authClient } from "../lib/auth-client";
  const session = authClient.useSession();
  async function signOut() { await authClient.signOut(); window.location.reload(); }
</script>

{#if $session.data}
  <button on:click={signOut} class="text-sm font-medium text-purple-700 hover:text-purple-900">Sign out</button>
{:else}
  <a href="/sign-in" class="text-sm font-medium text-purple-700 hover:text-purple-900">Sign in</a>
{/if}
```

- [ ] **Step 3: Create the sign-in / sign-up pages**

`src/pages/sign-in.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import AuthForm from "../components/AuthForm.svelte";
export const prerender = false;
const redirect = Astro.url.searchParams.get("redirect_url") || "/generator";
---
<Layout title="Sign in — Apologify" noindex={true}>
  <main class="max-w-md mx-auto px-4 py-16 flex justify-center">
    <AuthForm client:load mode="signin" redirectUrl={redirect} />
  </main>
</Layout>
```

`src/pages/sign-up.astro`:

```astro
---
import Layout from "../layouts/Layout.astro";
import AuthForm from "../components/AuthForm.svelte";
export const prerender = false;
const redirect = Astro.url.searchParams.get("redirect_url") || "/generator";
---
<Layout title="Create account — Apologify" noindex={true}>
  <main class="max-w-md mx-auto px-4 py-16 flex justify-center">
    <AuthForm client:load mode="signup" redirectUrl={redirect} />
  </main>
</Layout>
```

- [ ] **Step 4: Mount `HeaderAuth` in `Header.astro`**

In `src/components/Header.astro` frontmatter add `import HeaderAuth from "./HeaderAuth.svelte";`, and in the nav add `<HeaderAuth client:load />` where the auth control should appear.

- [ ] **Step 5: Validate the Svelte components with the autofixer**

Run the `svelte` MCP `svelte-autofixer` on `AuthForm.svelte` and `HeaderAuth.svelte`; apply fixes; re-run until clean.

- [ ] **Step 6: Verify end-to-end**

Run: `pnpm build && pnpm preview`. Visit `/sign-up`, create a test account → redirected to `/generator`, header shows "Sign out". Reload — still signed in. Click "Sign out" → header shows "Sign in". Visit `/sign-in` and log back in.

- [ ] **Step 7: Commit**

```bash
git add src/components/AuthForm.svelte src/components/HeaderAuth.svelte src/pages/sign-in.astro src/pages/sign-up.astro src/components/Header.astro
git commit -m "feat(auth): email/password auth forms, sign-in/up pages, header control"
```

---

## Phase 2 — Web-apology generator

### Task 8: Add the `public` recipient to `apologyData.js`

**Files:** Modify `src/lib/apologyData.js`.

**Interfaces:** `recipients` includes `{ value: 'public', label: 'The Public / Customers' }`; `contextsByRecipient.public` exists.

- [ ] **Step 1: Add the recipient** to `ALL_RECIPIENTS` (professional group):

```js
  { value: 'public', label: 'The Public / Customers', categories: ['professional'], hasGeneratorPage: true },
```

- [ ] **Step 2: Add contexts** to `contextsByRecipient`:

```js
  public: [
    { label: "Service outage", text: "Our service was down and it disrupted our customers" },
    { label: "Data incident", text: "We experienced a security incident affecting user data" },
    { label: "Product defect", text: "We shipped a defect that affected our customers" },
    { label: "Offensive content", text: "We published content that offended our community" },
    { label: "Billing error", text: "We made a billing error that overcharged customers" },
    { label: "Shipping delays", text: "We failed to deliver orders on time" },
    { label: "Broken promise", text: "We failed to deliver on a public commitment we made" },
    { label: "Poor handling", text: "We mishandled a situation and our community was hurt by it" },
  ],
```

- [ ] **Step 3: Verify**

Run: `node -e "import('./src/lib/apologyData.js').then(m=>console.log(m.recipients.find(r=>r.value==='public')))"`
Expected: `{ value: 'public', label: 'The Public / Customers' }`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/apologyData.js
git commit -m "feat(data): add public/company audience recipient and contexts"
```

---

### Task 9: `createApologyPage` action (auth-gated visibility)

**Files:** Modify `src/actions/index.ts`.

**Interfaces:**
- Consumes `callOpenAIChatCompletion`, `normalizeContext`, `urlPattern`, `saveApologyPage` (T5), `buildApologySlug` (T3), `isPremiumTheme` (T4), and `context.locals.user` (Better Auth, populated by middleware).
- Input `{ relationship, recipientName?, senderName?, audience, requestedVisibility, context, tone, theme }`. Returns `{ slug, title, visibility, saved }`.
- Visibility rule: `public` is honored only when `locals.user` exists; otherwise forced to `private`. `owner_id` = `locals.user?.id ?? null`.

- [ ] **Step 1: Add imports**

```ts
import { saveApologyPage } from '../lib/apologyPages';
import { buildApologySlug } from '../lib/slug.js';
import { isPremiumTheme } from '../lib/themes.js';
```

(If `slugify` is now unused, remove its import.)

- [ ] **Step 2: Add the generation helper** (append at bottom):

```ts
async function generateApologyContent(input: {
  relationship: string; recipientName?: string; audience: 'person' | 'public'; tone: string; context: string;
}): Promise<{ title: string; message: string }> {
  const { relationship, recipientName, audience, tone, context } = input;
  const isPublic = audience === 'public';
  const who = isPublic ? 'the public / our customers'
    : (recipientName ? `${relationship} named ${recipientName}` : relationship);
  const systemPrompt = isPublic
    ? `You write sincere public apology statements for organizations, published on a public web page. Take clear accountability, avoid corporate weasel words and non-apologies, state concrete corrective actions. No greeting, no signature.`
    : `You write short, sincere, heartfelt personal apology messages read on a page shared privately with one recipient. Write like a real person, never corporate. No greeting, no signature.`;
  const userPrompt = `Write an apology to ${who}.
Tone: ${tone}.
What happened: ${context}

Respond with a valid JSON object (no markdown fences) with exactly two keys:
- "title": a concise 4-8 word summary of the reason (no recipient).
- "message": ${isPublic ? '120-200 words, 2-3 short paragraphs' : '90-160 words, 2 short paragraphs'} separated by blank lines. Own the mistake, show understanding of impact, ${isPublic ? 'state concrete corrective steps' : 'be warm and specific'}. No "Dear ..." greeting, no sign-off.

Respond with the JSON now:`;
  const response = await callOpenAIChatCompletion({ systemPrompt, userPrompt });
  if (!response) throw new Error('Empty response from OpenAI');
  try {
    const cleaned = response.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.title && parsed.message) return { title: String(parsed.title), message: String(parsed.message) };
  } catch (_) {}
  const fallbackTitle = context.length > 50 ? context.slice(0, 47) + '...' : context;
  return { title: fallbackTitle, message: response.trim() };
}
```

- [ ] **Step 3: Add the action** inside `server` (note the second `context` handler arg for `locals`):

```ts
  createApologyPage: defineAction({
    accept: 'form',
    input: z.object({
      relationship: z.string().min(1).max(100),
      recipientName: z.string().max(60).optional().transform((v) => (v ? v.trim() : undefined)),
      senderName: z.string().max(80).optional().transform((v) => (v ? v.trim() : undefined)),
      audience: z.enum(['person', 'public']).default('person'),
      requestedVisibility: z.enum(['private', 'public']).default('private'),
      context: z.string().transform(normalizeContext).pipe(
        z.string().min(20, "Please describe what happened (at least 20 characters)").max(1000)
          .refine((val) => !urlPattern.test(val), "URLs are not allowed")
      ),
      tone: z.string().min(1).max(50),
      theme: z.string().min(1).max(40),
    }),
    handler: async (input, context) => {
      try {
        const userId = context.locals.user?.id ?? null;
        const visibility: 'private' | 'public' =
          input.requestedVisibility === 'public' && userId ? 'public' : 'private';

        const { title, message } = await generateApologyContent({
          relationship: input.relationship, recipientName: input.recipientName,
          audience: input.audience, tone: input.tone, context: input.context,
        });
        const slug = buildApologySlug({ recipientName: input.recipientName, recipient: input.relationship, title });
        const theme = isPremiumTheme(input.theme) ? 'classic' : input.theme;
        try {
          await saveApologyPage({
            slug, recipient: input.relationship,
            recipientName: input.recipientName ?? null, senderName: input.senderName ?? null,
            audience: input.audience, visibility, ownerId: userId ?? null,
            message, title, theme, tone: input.tone,
          });
          return { slug, title, visibility, saved: true };
        } catch (dbError) {
          console.error('Failed to save apology page:', dbError);
          return { slug, title, visibility, saved: false };
        }
      } catch (error) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create your apology page. Please try again.',
        });
      }
    },
  }),
```

- [ ] **Step 4: Type-check**

Run: `pnpm astro check`
Expected: no errors in `src/actions/index.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/actions/index.ts
git commit -m "feat(actions): add createApologyPage with auth-gated public visibility"
```

---

### Task 10: The `/sorry/[slug]` page (noindex private / indexable public)

**Files:** Create `src/pages/sorry/[slug].astro`.

**Interfaces:** Consumes `getApologyPageBySlug` (T5), `resolveTheme` (T4), `isLikelySlug` (T3), `Layout` `noindex` (T2). `prerender = false`. Missing/invalid slug → `/404`. `noindex = page.visibility !== 'public'`. Renders themed content; free pages show the watermark.

- [ ] **Step 1: Create the page**

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getApologyPageBySlug } from "../../lib/apologyPages";
import { resolveTheme } from "../../lib/themes.js";
import { isLikelySlug } from "../../lib/slug.js";

export const prerender = false;

const { slug } = Astro.params;
if (!slug || !isLikelySlug(slug)) return Astro.redirect("/404");
const page = await getApologyPageBySlug(slug);
if (!page) return Astro.redirect("/404");

const theme = resolveTheme(page.theme);
const isPublic = page.audience === "public";
const noindex = page.visibility !== "public";
const heading = isPublic
  ? `An apology from ${page.senderName || "us"}`
  : page.recipientName ? `Dear ${page.recipientName},` : "I'm sorry.";
const paragraphs = page.message.split(/\n{2,}/).filter(Boolean);
const title = `${page.title} — An Apology | Apologify`;
const description = (isPublic ? `A public apology: ${page.title}. ` :
  `A personal apology${page.recipientName ? " for " + page.recipientName : ""}: ${page.title}. `)
  .concat("Made on apologify.com.").slice(0, 160);
const canonicalUrl = new URL(Astro.url.pathname, Astro.site).href;
const pageSchema = {
  "@context": "https://schema.org", "@type": "CreativeWork",
  headline: `${page.title} — Apology`, description, genre: page.tone,
  dateCreated: page.createdAt ? new Date(page.createdAt).toISOString() : undefined,
  author: { "@type": "Organization", name: "Apologify" },
  publisher: { "@type": "Organization", name: "Apologify", url: "https://apologify.com" },
};
---

<Layout title={title} description={description} canonicalUrl={canonicalUrl} schema={[pageSchema]} noindex={noindex}>
  <section class={`min-h-[80vh] ${theme.bgClass} ${theme.font} flex items-center justify-center px-4 py-16 -mx-4`}>
    <article class="max-w-xl w-full bg-white/70 backdrop-blur rounded-3xl shadow-xl p-8 md:p-12 text-center">
      <h1 class={`text-3xl md:text-4xl font-bold mb-6 ${theme.accentClass}`} style="text-wrap: balance;">{heading}</h1>
      <div class="space-y-4 text-lg text-gray-700 leading-relaxed text-left">
        {paragraphs.map((p) => <p>{p}</p>)}
      </div>
      {page.senderName && !isPublic && (<p class={`mt-8 text-xl ${theme.accentClass}`}>— {page.senderName}</p>)}
    </article>
  </section>
  {!page.isPaid && (
    <div class="text-center py-6">
      <a href="/generator" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-600 transition-colors">
        Made with 💜 apologify.com — make your own
      </a>
    </div>
  )}
</Layout>
```

- [ ] **Step 2: Insert one private and one public test row**

```bash
node -e "import('dotenv/config').then(async()=>{const {createClient}=await import('@libsql/client/web');const t=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});const ins=(a)=>t.execute({sql:'INSERT INTO apology_pages (slug,recipient,recipient_name,sender_name,audience,visibility,owner_id,message,title,theme,tone,is_paid) VALUES (?,?,?,?,?,?,?,?,?,?,?,0)',args:a});await ins(['mia-anniversary-priv01','girlfriend','Mia','Sam','person','private',null,'I was wrong and I am truly sorry.\n\nYou deserve better and I will do better.','Forgetting Our Anniversary','cute-duck','heartfelt']);await ins(['acme-outage-pub01','public',null,'Acme Inc.','public','public','user_test','We let you down during the outage.\n\nHere is what we are doing to fix it.','Service Outage Apology','formal','professional']);console.log('inserted');})"
```

Expected: `inserted`.

- [ ] **Step 3: Build, preview, verify both**

Run: `pnpm build && pnpm preview`
- `/sorry/mia-anniversary-priv01` → cute-duck card; view source **has** `noindex,nofollow`.
- `/sorry/acme-outage-pub01` → formal card "An apology from Acme Inc."; view source has **no** noindex meta, has title/description/schema.
- `/sorry/bad slug!!` → 404.

- [ ] **Step 4: Commit**

```bash
git add src/pages/sorry/[slug].astro
git commit -m "feat(pages): /sorry/[slug] page — noindex when private, indexable when public"
```

---

### Task 11: Builder + share components

**Files:** Create `src/components/ApologyShareResult.svelte`, `src/components/ApologyPageBuilder.svelte`.

**Interfaces:**
- Consumes `actions.createApologyPage` (T9), `tones` + `contextsByRecipient` (apologyData), `listThemes` (T4), `PUBLIC_SITE_URL` env.
- `ApologyShareResult` props: `slug`, `visibility`. Builds `shareUrl = ${origin}/sorry/${slug}`; copy + WhatsApp + open + restart; if `visibility === 'public'` shows a "Listed publicly" note.
- `ApologyPageBuilder` props: `recipient`, `defaultTone`, `audience: 'person'|'public'`, `isSignedIn: boolean`, `signUpUrl: string`. Has a "Publish publicly (findable on Google)" checkbox; if `!isSignedIn`, the checkbox is replaced by a sign-up link and `requestedVisibility` stays `private`.

- [ ] **Step 1: Create `ApologyShareResult.svelte`**

```svelte
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let slug: string;
  export let visibility: "private" | "public" = "private";
  const dispatch = createEventDispatcher();
  const origin =
    (import.meta.env.PUBLIC_SITE_URL as string) ||
    (typeof window !== "undefined" ? window.location.origin : "https://apologify.com");
  $: shareUrl = `${origin}/sorry/${slug}`;
  $: waUrl = `https://wa.me/?text=${encodeURIComponent("I made this for you 💜 " + shareUrl)}`;
  let copied = false;
  async function copy() {
    try { await navigator.clipboard.writeText(shareUrl); copied = true; setTimeout(() => (copied = false), 2000); } catch (_) {}
  }
</script>

<div class="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 text-center">
  <h2 class="text-2xl font-bold text-gray-900 mb-2">Your apology page is ready 💜</h2>
  <p class="text-gray-500 mb-6">
    Share this link.{visibility === "public" ? " It’s also listed publicly and can be found on Google." : " Only people with the link can see it."}
  </p>
  <div class="flex items-center gap-2 mb-4">
    <input class="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm bg-gray-50" value={shareUrl} readonly />
    <button on:click={copy} class="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium whitespace-nowrap">{copied ? "Copied!" : "Copy link"}</button>
  </div>
  <div class="flex flex-col sm:flex-row gap-3">
    <a href={waUrl} target="_blank" rel="noopener" class="flex-1 px-5 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">Share on WhatsApp</a>
    <a href={shareUrl} target="_blank" rel="noopener" class="flex-1 px-5 py-3 bg-white text-purple-700 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-colors font-medium">Open page</a>
  </div>
  <button on:click={() => dispatch("restart")} class="mt-6 text-sm text-gray-400 hover:text-purple-600">Create another</button>
</div>
```

- [ ] **Step 2: Create `ApologyPageBuilder.svelte`**

```svelte
<script lang="ts">
  import { actions } from "astro:actions";
  import { tones, contextsByRecipient } from "../lib/apologyData.js";
  import { listThemes } from "../lib/themes.js";
  import ApologyShareResult from "./ApologyShareResult.svelte";

  export let recipient: string;
  export let defaultTone: string;
  export let audience: "person" | "public" = "person";
  export let isSignedIn = false;
  export let signUpUrl = "/sign-up";

  $: contexts = contextsByRecipient[recipient as keyof typeof contextsByRecipient] || [];
  const themes = listThemes();
  const isPublicAudience = audience === "public";

  let recipientName = "";
  let senderName = "";
  let context = "";
  let selectedTone = defaultTone;
  let selectedTheme = isPublicAudience ? "formal" : "classic";
  let publishPublic = false;
  let isGenerating = false;
  let error = "";
  let slug = "";
  let resultVisibility: "private" | "public" = "private";

  async function submit() {
    if (context.trim().length < 20) { error = "Please describe what happened (at least 20 characters)."; return; }
    isGenerating = true; error = "";
    try {
      const fd = new FormData();
      fd.append("relationship", recipient);
      if (recipientName.trim()) fd.append("recipientName", recipientName.trim());
      if (senderName.trim()) fd.append("senderName", senderName.trim());
      fd.append("audience", audience);
      fd.append("requestedVisibility", isSignedIn && publishPublic ? "public" : "private");
      fd.append("context", context);
      fd.append("tone", selectedTone);
      fd.append("theme", selectedTheme);
      const { data, error: actionError } = await actions.createApologyPage(fd);
      if (actionError) error = actionError.message;
      else if (data) { slug = data.slug; resultVisibility = data.visibility; }
    } catch (e) { error = "Something went wrong. Please try again."; console.error(e); }
    finally { isGenerating = false; }
  }

  function restart() {
    slug = ""; context = ""; recipientName = ""; senderName = "";
    selectedTone = defaultTone; selectedTheme = isPublicAudience ? "formal" : "classic";
    publishPublic = false; error = "";
  }
</script>

{#if !slug}
  <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
    <form on:submit|preventDefault={submit}>
      <div class="grid sm:grid-cols-2 gap-4 mb-5">
        {#if !isPublicAudience}
          <div>
            <label for="rname" class="font-semibold text-gray-900 block mb-2">Their name <span class="text-gray-400 font-normal">(optional)</span></label>
            <input id="rname" bind:value={recipientName} maxlength="60" placeholder="e.g. Mia" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        {/if}
        <div>
          <label for="sname" class="font-semibold text-gray-900 block mb-2">{isPublicAudience ? "Company / your name" : "Your name"} <span class="text-gray-400 font-normal">(optional)</span></label>
          <input id="sname" bind:value={senderName} maxlength="80" placeholder={isPublicAudience ? "e.g. Acme Inc." : "e.g. Sam"} class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
        </div>
      </div>

      <div class="mb-5">
        <div class="flex items-baseline justify-between mb-2">
          <label for="ctx" class="font-semibold text-gray-900">What happened?</label>
          <span class="text-xs text-gray-400 tabular-nums">{context.length}/500</span>
        </div>
        <textarea id="ctx" bind:value={context} maxlength="500" name="context" autocomplete="off" placeholder="Describe what happened and why you want to apologize..." class="w-full h-28 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
        {#if contexts.length}
          <div class="flex flex-wrap gap-2 mt-2">
            {#each contexts.slice(0, 6) as c}
              <button type="button" on:click={() => (context = typeof c === "string" ? c : c.text)} class="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100">{typeof c === "string" ? c : c.label}</button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mb-5">
        <label for="tone" class="font-semibold text-gray-900 block mb-2">Tone</label>
        <select id="tone" bind:value={selectedTone} name="tone" class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
          {#each tones as t (t.value)}<option value={t.value}>{t.emoji} {t.label}</option>{/each}
        </select>
      </div>

      <div class="mb-5">
        <span class="font-semibold text-gray-900 block mb-2">Theme</span>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {#each themes as th}
            <button type="button" on:click={() => (selectedTheme = th.id)} class="relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all {selectedTheme === th.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}">
              <span class="text-2xl">{th.emoji}</span>
              <span class="text-xs text-gray-700">{th.label}</span>
              {#if th.premium}<span class="absolute top-1 right-1 text-[10px] bg-amber-400 text-white px-1 rounded">PRO</span>{/if}
            </button>
          {/each}
        </div>
        <p class="text-xs text-gray-400 mt-2">PRO themes preview as Classic on the free plan.</p>
      </div>

      <div class="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
        {#if isSignedIn}
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" bind:checked={publishPublic} class="mt-1 w-4 h-4 accent-purple-600" />
            <span class="text-sm text-gray-700"><strong>Publish publicly</strong> — make this findable on Google and listed on Apologify. Leave off to keep it private (link-only).</span>
          </label>
        {:else}
          <p class="text-sm text-gray-600">Your page will be <strong>private</strong> (only people with the link can see it). Want it public and findable on Google? <a href={signUpUrl} class="text-purple-600 underline">Create a free account</a>.</p>
        {/if}
      </div>

      {#if error}<div class="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm" role="alert">{error}</div>{/if}

      <button type="submit" disabled={isGenerating || context.trim().length < 20} class="w-full px-6 py-4 bg-purple-600 text-white text-lg font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
        {isGenerating ? "Creating your page..." : "Create my apology page"}
      </button>
    </form>
  </div>
{:else}
  <ApologyShareResult {slug} visibility={resultVisibility} on:restart={restart} />
{/if}
```

- [ ] **Step 3: Validate both with the Svelte MCP autofixer**

Run the `svelte` MCP `svelte-autofixer` on both files; apply fixes; re-run until clean.

- [ ] **Step 4: Type-check**

Run: `pnpm astro check`
Expected: no errors in the two components.

- [ ] **Step 5: Commit**

```bash
git add src/components/ApologyShareResult.svelte src/components/ApologyPageBuilder.svelte
git commit -m "feat(components): apology website builder + share result with publish gate"
```

---

### Task 12: Rewire `/generator/[recipient]` to the builder

**Files:** Modify `src/pages/generator/[recipient].astro`.

**Interfaces:** Consumes `ApologyPageBuilder` (T11), updated `recipients` (T8), `Astro.locals.user`. Uses `ApologyPageBuilder` for all recipients; `audience = recipient === 'public' ? 'public' : 'person'`; `isSignedIn = !!Astro.locals.user`. Rewords copy to "apology website".

- [ ] **Step 1: Update the frontmatter**

Replace `import RecipientGenerator ...` with:

```astro
import ApologyPageBuilder from "../../components/ApologyPageBuilder.svelte";

const audience = recipient === "public" ? "public" : "person";
const isSignedIn = !!Astro.locals.user;
```

Ensure the file has `export const prerender = false;` in the frontmatter (add it if missing — required so the middleware populates `Astro.locals.user`).

- [ ] **Step 2: Reword meta default**

Replace the `const meta = recipientMeta[recipient] || { ... }` fallback with:

```astro
const meta = recipientMeta[recipient] || {
  title: `Apology Website Builder for ${recipientLabel} — Free Sorry Page`,
  description: `Make a shareable apology website for your ${recipientLabel.toLowerCase()} in seconds and send the link. Free, no signup to create. Pick a theme and share instantly.`,
  keywords: `sorry website for ${recipient}, apology website for ${recipient}, apology page, sorry link`,
};
```

- [ ] **Step 3: Reword the hero** — badge → `Free Apology Website Builder`; H1 and subhead:

```astro
<h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-5" style="text-wrap: balance;">
  {recipient === "public" ? "Public Apology Website Builder" : `Sorry Page Builder for ${recipientLabel}`}
</h1>
<p class="text-lg text-gray-500 max-w-2xl mx-auto mb-8" style="text-wrap: balance;">
  {recipient === "public"
    ? "Publish a sincere public apology as its own web page in seconds, then share the link anywhere."
    : `Make a cute, shareable apology website for your ${recipientLabel.toLowerCase()} in seconds — then send them the link. Free, instant.`}
</p>
```

- [ ] **Step 4: Replace the component usage**

```astro
<ApologyPageBuilder client:load recipient={recipient} defaultTone={defaultTone} audience={audience} isSignedIn={isSignedIn} signUpUrl={`/sign-up?redirect_url=/generator/${recipient}`} />
```

- [ ] **Step 5: Build and verify**

Run: `pnpm build && pnpm preview`
- Signed out at `/generator/girlfriend` → builder shows the "private — create account to publish" note; submit → share panel says "Only people with the link can see it"; the `/sorry/<slug>` page is `noindex`.
- Sign in, reload `/generator/public` → "Publish publicly" checkbox present; check it, submit → share panel says "listed publicly"; `/sorry/<slug>` is indexable.
- `/generator/boss` → builder (no letter form).

- [ ] **Step 6: Commit**

```bash
git add src/pages/generator/[recipient].astro
git commit -m "feat(generator): all recipients build apology websites; publish gated by sign-in"
```

---

## Phase 3 — Discovery (public pages only)

### Task 13: `/sorry` gallery + dynamic sitemap + hub reword

**Files:** Create `src/pages/sorry/index.astro`, `src/pages/sitemap-pages.xml.ts`; Modify `src/pages/generator/index.astro`; create/modify `public/robots.txt`.

**Interfaces:** Consumes `getRecentPublicPages` + `getAllPublicSlugs` (T5). Gallery and sitemap include **public pages only**.

- [ ] **Step 1: Create the gallery**

`src/pages/sorry/index.astro`:

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getRecentPublicPages } from "../../lib/apologyPages";
export const prerender = false;
const pages = await getRecentPublicPages(48);
---
<Layout title="Apology Websites — Real Sorry Pages | Apologify" description="Browse public apology websites made on Apologify. Make your own shareable sorry page in seconds.">
  <main class="max-w-screen-lg mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-center mb-3">Apology Websites</h1>
    <p class="text-center text-gray-500 mb-10">Make your own in seconds — <a href="/generator" class="text-purple-600 underline">start here</a>.</p>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((p) => (
        <a href={`/sorry/${p.slug}`} class="block bg-white rounded-xl border border-gray-200 hover:border-purple-400 p-5 shadow-sm hover:shadow-md transition-all">
          <h2 class="font-semibold text-gray-800 line-clamp-1">{p.title}</h2>
          <p class="text-sm text-gray-500 mt-1 line-clamp-2">{p.message.slice(0, 120)}…</p>
          <span class="inline-block mt-3 text-xs px-2 py-1 bg-gray-100 rounded">{p.audience === "public" ? "Public apology" : p.recipient}</span>
        </a>
      ))}
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: Create the dynamic sitemap**

`src/pages/sitemap-pages.xml.ts`:

```ts
import type { APIRoute } from 'astro';
import { getAllPublicSlugs } from '../lib/apologyPages';
export const prerender = false;
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href || 'https://apologify.com/').replace(/\/$/, '');
  const slugs = await getAllPublicSlugs();
  const urls = slugs.map((s) => {
    const lastmod = s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString();
    return `<url><loc>${base}/sorry/${s.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
  }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } });
};
```

- [ ] **Step 3: Reword the hub** in `src/pages/generator/index.astro` — H1 → "Apology Website Builder"; subhead → "Create a shareable apology page for anyone — or a public statement for your company." Keep the recipient grid/links.

- [ ] **Step 4: robots.txt**

Ensure `public/robots.txt` exists with at least:

```
User-agent: *
Allow: /
Sitemap: https://apologify.com/sitemap-index.xml
Sitemap: https://apologify.com/sitemap-pages.xml
```

- [ ] **Step 5: Build and verify**

Run: `pnpm build && pnpm preview`
- `/sorry` → lists only public test page(s) (the private one is absent).
- `/sitemap-pages.xml` → valid XML with only the public slug.
- `/generator` → reworded.

- [ ] **Step 6: Commit**

```bash
git add src/pages/sorry/index.astro src/pages/sitemap-pages.xml.ts src/pages/generator/index.astro public/robots.txt
git commit -m "feat(seo): public /sorry gallery + dynamic sitemap (public pages only)"
```

---

## Phase 4 — Moderation guard

### Task 14: Content guard on creation

**Files:** Modify `src/actions/index.ts`.

**Interfaces:** Adds `containsBlockedContent(text): boolean`; the `createApologyPage` handler throws `BAD_REQUEST` when triggered. Conservative denylist (spam/abuse floor; registration already gates the indexable surface).

- [ ] **Step 1: Add the helper near `normalizeContext`**

```ts
const BLOCKED = ['<<slur1>>', '<<slur2>>']; // replace with a real conservative denylist before launch
function containsBlockedContent(text: string): boolean {
  const t = text.toLowerCase();
  return BLOCKED.some((w) => w && t.includes(w));
}
```

- [ ] **Step 2: Enforce at the top of the handler** (first lines, before OpenAI):

```ts
if (containsBlockedContent(input.context)) {
  throw new ActionError({ code: 'BAD_REQUEST', message: 'This content can’t be turned into a page.' });
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm astro check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/actions/index.ts
git commit -m "feat(moderation): conservative content guard on apology creation"
```

---

## Phase 5 — Monetization (premium unlock)

> Ship Phases 0–4 first. This adds a one-time $5 unlock removing the watermark + enabling premium themes per page, via a Stripe Payment Link + server-side session verification (no webhook infra). Removing the "Made with apologify.com" badge is itself the paid value — especially for companies on a public page.

### Task 15: Stripe unlock flow

**Files:** Modify `package.json` (add `stripe`), `.env.example`; Create `src/pages/api/unlock.ts`; Modify `src/pages/sorry/[slug].astro`, `src/components/ApologyShareResult.svelte`.

**Interfaces:** Consumes `getApologyPageBySlug`, `markApologyPagePaid` (T5). Payment Link success URL `${PUBLIC_SITE_URL}/sorry/{slug}?session_id={CHECKOUT_SESSION_ID}` with `?client_reference_id=<slug>`.

- [ ] **Step 1: Add the dependency**

Run: `pnpm add stripe`

- [ ] **Step 2: Document env** in `.env.example`:

```
PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/xxxx
STRIPE_SECRET_KEY=sk_live_xxxx
```

- [ ] **Step 3: Create `src/pages/api/unlock.ts`**

```ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getApologyPageBySlug, markApologyPagePaid } from '../../lib/apologyPages';
export const prerender = false;
export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  const sessionId = url.searchParams.get('session_id');
  if (!slug || !sessionId) return new Response(JSON.stringify({ ok: false }), { status: 400 });
  const key = import.meta.env.STRIPE_SECRET_KEY;
  if (!key) return new Response(JSON.stringify({ ok: false }), { status: 500 });
  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status === 'paid' && session.client_reference_id === slug) {
    const page = await getApologyPageBySlug(slug);
    if (page) await markApologyPagePaid(slug);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  return new Response(JSON.stringify({ ok: false }), { status: 402 });
};
```

- [ ] **Step 4: Handle the paid return** in `src/pages/sorry/[slug].astro` frontmatter, after loading `page`:

```astro
const sessionId = Astro.url.searchParams.get("session_id");
if (sessionId && page && !page.isPaid) {
  const verifyUrl = new URL("/api/unlock", Astro.url.origin);
  verifyUrl.searchParams.set("slug", slug);
  verifyUrl.searchParams.set("session_id", sessionId);
  await fetch(verifyUrl).catch(() => {});
  return Astro.redirect(`/sorry/${slug}`);
}
```

- [ ] **Step 5: Add the unlock CTA** in `ApologyShareResult.svelte`:

```svelte
{#if import.meta.env.PUBLIC_STRIPE_PAYMENT_LINK}
  <a href={`${import.meta.env.PUBLIC_STRIPE_PAYMENT_LINK}?client_reference_id=${slug}`} class="mt-4 block px-5 py-3 bg-amber-400 text-amber-900 rounded-xl hover:bg-amber-300 transition-colors font-semibold">Remove watermark & unlock premium themes — $5</a>
{/if}
```

- [ ] **Step 6: Verify in Stripe test mode**

Test `STRIPE_SECRET_KEY` + test Payment Link. `pnpm build && pnpm preview`, create page, click unlock, pay `4242 4242 4242 4242`. Confirm return to `/sorry/<slug>`, watermark gone, `is_paid = 1`.

- [ ] **Step 7: Commit**

```bash
git add package.json .env.example src/pages/api/unlock.ts src/pages/sorry/[slug].astro src/components/ApologyShareResult.svelte
git commit -m "feat(monetize): one-time Stripe unlock removes watermark + premium themes"
```

---

## Self-Review

**Spec coverage:**
- Remove text generator → Task 1. ✅
- Apology-website generator for all recipients → Tasks 11, 12. ✅
- Company public apology → Tasks 8 (recipient), 9 (prompt), 10 (render), 12 (builder). ✅
- **Publish-requires-registration gate** → Tasks 6–7 (Better Auth), Task 9 (auth-gated visibility), Task 11 (UI gate), Task 12 (`isSignedIn`). ✅
- Private-by-default, indexable only when public → Task 5 (`visibility` default `private`), Task 10 (`noindex` logic), Task 13 (gallery/sitemap public-only). ✅
- Keep legacy SEO library untouched → Global Constraints; no task modifies it. ✅
- Moderation floor → Task 14. ✅
- Watermark loop + monetization → Task 10 + Task 15. ✅
- Model untouched → Global Constraints; Task 9 reuses `callOpenAIChatCompletion`. ✅

**Placeholder scan:** Only the intentional, flagged `BLOCKED` denylist (Task 14, "replace before launch"); all other steps have concrete code/commands. ✅

**Type consistency:** `ApologyPage` fields, `audience: 'person'|'public'`, and `visibility: 'private'|'public'` are consistent across `apologyPages.ts`, `/sorry/[slug].astro`, `/sorry/index.astro`, `sitemap-pages.xml.ts`, and the action. Action returns `{ slug, title, visibility, saved }`; builder consumes `data.slug` + `data.visibility`; `ApologyShareResult` props `slug`+`visibility` match. `getRecentPublicPages`/`getAllPublicSlugs`/`buildApologySlug`/`isLikelySlug`/`resolveTheme`/`isPremiumTheme`/`listThemes` signatures match producers/consumers. Better Auth session is read as `locals.user` in Task 9 (action context, `locals.user?.id`) and Task 12 (page, `!!Astro.locals.user`), typed via `App.Locals` in Task 6. ✅

**Auth/SSR note:** Better Auth needs no Astro integration and no SSR-mode change — it is API routes (`/api/auth/[...all]`) plus a middleware session read. `output: 'static'` is preserved; auth-consuming routes are `prerender = false` so the middleware runs. Task 6 Step 9 includes an explicit `locals.user` + `/api/auth` verification probe. ✅

**Known adaptation:** No component/page test harness exists. Pure logic (Tasks 3, 4) uses real `node --test`; everything else uses explicit `pnpm build && pnpm preview` manual verification.
