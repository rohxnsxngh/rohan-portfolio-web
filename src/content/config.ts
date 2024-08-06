import { defineCollection, z } from 'astro:content';

export const blogCollection = {
  blogs: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      date: z.date(),
      author: z.string(),
      image: z.string(),
      tag: z.array(z.string()),
    }),
  }),
};
