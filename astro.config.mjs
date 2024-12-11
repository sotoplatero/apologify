import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

import svelte from '@astrojs/svelte';

import preact from '@astrojs/preact';

import vercel from '@astrojs/vercel';
import db from '@astrojs/db';
// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: "https://apologify.com",
  integrations: [tailwind(), sitemap(), svelte(), preact(), db()],
  adapter: vercel({ 
    isr: true,
  }),
});