import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  // Each article lives at src/content/articles/<slug>/index.md.
  // generateId strips "/index.md" so the entry id stays the directory name
  // (preserving existing /articles/<slug> URLs that rank in search).
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/articles',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/i, '').replace(/\.mdx?$/i, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    photographer: z.string().optional(),
    photographerUrl: z.string().optional(),
  }),
});

export const collections = { articles };
