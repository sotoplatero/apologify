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
  integrations: [ tailwind(), sitemap(), svelte(), preact(), sitemapCopier()],
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
      ],
    },
  }),

});