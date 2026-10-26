# Pending / open decisions

## Articles: content layer vs import.meta.glob

**Current state (commit `e2d3248`):**
- Article markdown lives in `src/data/articles/<slug>/index.md`.
- It's loaded via `src/lib/articles.ts` using Vite `import.meta.glob` (static, bundled).
- `src/content.config.ts` (Astro content collections / `getCollection`) was **removed**, along with the dead `src/lib/insertRelatedLinksMarkdown.js`.

**Why we moved off the content layer:**
- In the Astro 7.0.4 **dev server (background daemon)**, `getCollection('articles')` returned an empty collection even though `astro build`/`astro sync` populated the data store and generated all pages. Result: `/articles` and article slugs 404'd in dev.
- This is **not confirmed to be an Astro bug** — it may be expected dev content-layer sync behavior (the docs note you sometimes have to sync with `s + Enter` in the running dev server). We did not file/verify it as a bug.
- Articles are plain local static markdown, so `import.meta.glob` is the simpler, deterministic fit (works the same in dev, build, and serverless).

**Pending decision (revisit later):**
- Whether to reinstate Astro content collections for **Zod schema validation** of article frontmatter.
- If we do: recreate `src/content.config.ts` with the `glob()` loader pointing at `./src/data/articles`, and re-confirm whether the dev-daemon empty-collection behavior still occurs on the Astro version in use.
- Fully reversible via git history (the deleted config + helper are in the commit before `e2d3248`).

## Idea: weekly apology-news newsletter (news.apologify.com)

**Status:** superseded (2026-10-25) — now planned on-site at `/news` with an n8n back end. See `docs/newsletter/PLAN.md`.

**Concept:** curated weekly roundup of public apologies (celebrities, brands, athletes, politicians, governments), Axios-style: headline, 2–3 line summary, link to the source, plus **one-line verdict** per item (e.g. "Lawyered statement; never names the act"). The verdict is the differentiator — a plain summary is a commodity.

**Agreed approach (no code):**
- Run on a newsletter platform (beehiiv or Substack) with custom domain `news.apologify.com` via a CNAME in Namecheap (Namecheap MCP is connected). Check whether the custom domain needs a paid plan.
- Weekly cadence; AI-assisted shortlist + draft summaries, human pick and verdicts (~1–2 h/week).
- Summaries in our own words + link; never copy paragraphs.
- Best-fit audience: PR / crisis-comms people (professional use) on top of the curious reader.

**Expectations:** low SEO value (summaries of others' news; a subdomain passes little authority — use `apologify.com/news` instead if SEO matters). Value is brand + owned audience; growth is slow (hundreds of subs in the first months).

**Test:** 8 weekly issues. Keep going if open rate > 40% and subscribers grow week over week.

**Next step when resumed:** design the issue format and write a sample issue with real news from that week; then set up the platform + DNS and add a subscribe link on apologify.com.
