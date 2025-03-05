import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    author: z.string(),
    image: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    status: z.enum(['completed', 'in-progress', 'coming-soon']),
    image: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    github: z.string().optional(),
    demo: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
  'project': projectCollection,
};
