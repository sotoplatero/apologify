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
      exclude: [ "/generator" ]
    },
  }),

});