import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://rohansingh.io",
  integrations: [
    tailwind(),
    sitemap(),
  ],
  image: {
    // Use sharp for local image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  content: {
    collections: {
      blogs: "src/content/blogs",
    },
  },
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true, // Uses Vercel's image optimization in production
  }),
  vite: {
    resolve: {
      alias: {
        "@images": "/public/images",
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
      },
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-vendor': ['three'],
          }
        }
      }
    }
  },
});