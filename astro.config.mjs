import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

import svelte from '@astrojs/svelte';

import preact from '@astrojs/preact';

import vercel from '@astrojs/vercel/serverless';

import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  site: "https://apologify.com",
  integrations: [tailwind(), sitemap(), svelte(), preact()],
  adapter: vercel({ 
    isr: true,
  }),
});