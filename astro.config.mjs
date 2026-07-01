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
        "/sign-in",
        "/sign-up",
        /^\/api\/.*/,
        /^\/sorry\/.*/,
      ],
    },
  }),

});