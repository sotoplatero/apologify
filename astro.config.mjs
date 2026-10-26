import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

import svelte from '@astrojs/svelte';

import preact from '@astrojs/preact';

import vercel from '@astrojs/vercel';
import { sitemapCopier } from './sitemap-copier.ts';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: "https://apologify.com",
  // One canonical URL per page: /examples/teacher/ and /examples/teacher both
  // returned 200 and Google split signals between them. Never use a trailing
  // slash; the Vercel adapter 308-redirects the slashed form.
  trailingSlash: 'never',
  build: { format: 'file' },
  // Guides live in the blog; the short-lived standalone page moved there.
  redirects: {
    '/apology-letter': { status: 301, destination: '/articles/how-to-write-an-apology-letter' },
  },
  integrations: [
    tailwind(),
    sitemap({
      // Keep noindex / private / utility routes out of the sitemap.
      filter: (page) =>
        !/\/(dashboard|publish|customize|demo|sign-in|sign-up|studio|404|500)(\/|$)/.test(new URL(page).pathname),
    }),
    svelte(),
    preact(),
    sitemapCopier(),
  ],
  adapter: vercel({
    // Allow slow generations to finish (default was ~10s → timeouts). Needs a
    // Vercel plan that permits longer functions; capped by the plan otherwise.
    maxDuration: 60,
    isr: {
      // Never ISR-cache auth, session, or per-user/dynamic routes — a cached
      // OAuth endpoint returns a stale `state` (→ "state_not_found" on the
      // callback) and a cached /api/auth/get-session leaks/staled sessions.
      exclude: [
        "/generator",
        "/examples",
        "/dashboard",
        "/publish",
        "/customize",
        "/demo",
        "/studio/card",
        "/sign-in",
        "/sign-up",
        /^\/api\/.*/,
        /^\/sorry\/.*/,
        // Astro actions are POSTs with per-request results; ISR cached the
        // first createApologyPage response and replayed it to every user.
        /^\/_actions\/.*/,
        /^\/_server-islands\/.*/,
      ],
    },
  }),

});