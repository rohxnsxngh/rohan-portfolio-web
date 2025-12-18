import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    author: z.string(),
    image: z.string(),
    status: z.string().optional(),
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
    kaggle: z.string().optional(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string()
    })).optional(),
  }),
});

const researchCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    status: z.enum(['completed', 'in-progress', 'coming-soon']),
    image: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    github: z.string().optional(),
    paper: z.string().optional(),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string()
    })).optional(),
  }),
});

const experienceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    company: z.string(),
    description: z.string(),
    date: z.string(),
    endDate: z.string().optional(),
    location: z.string(),
    tags: z.array(z.string()),
    images: z.array(z.object({
      src: z.string(),
      alt: z.string()
    })).optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
  'project': projectCollection,
  'research': researchCollection,
  'experience': experienceCollection,
};
