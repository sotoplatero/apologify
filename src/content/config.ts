import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    photographer: z.string().optional(),
    photographerUrl: z.string().optional(),
    // ... otros campos que puedas tener
  }),
});

export const collections = {
  'articles': articlesCollection,
};
