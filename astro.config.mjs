import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import sitemap from '@astrojs/sitemap';

import svelte from '@astrojs/svelte';

import preact from '@astrojs/preact';

<<<<<<< HEAD
// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  integrations: [tailwind(), sitemap(), svelte(), preact()],
});
=======
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  site: "https://bestapologyletters.com",
  integrations: [tailwind(), sitemap(), svelte(), preact()],
  adapter: vercel({ 
    isr: true,
  }),
});
>>>>>>> 9e8397bf111f97dd3f713ae402fe641f10d33e4a
