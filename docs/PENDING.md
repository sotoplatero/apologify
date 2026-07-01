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
