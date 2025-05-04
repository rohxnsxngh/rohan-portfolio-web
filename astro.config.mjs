import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import image from '@astrojs/image';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    }),
  ],
  content: {
    collections: {
      blogs: "src/content/blogs",
    },
  },
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true,
  }),
  vite: {
    resolve: {
      alias: {
        "@images": "/src/images",
        "@models": "/src/models",
        "three": "three",
      },
    },
    optimizeDeps: {
      include: ['three']
    },
    build: {
      commonjsOptions: {
        include: [/three/, /three\/examples\/jsm\/*/]
      }
    }
  },
});