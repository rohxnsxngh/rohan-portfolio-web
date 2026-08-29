import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // Must be the domain the site is actually served from: `site` is what the
  // sitemap lists and what Astro.site resolves OG/Twitter image URLs against.
  // This previously pointed at rohansingh.io, which now 301s to an unrelated
  // site — so the sitemap advertised URLs on a domain this site does not own
  // and every social preview requested its image from there.
  site: "https://www.rohxnsxngh.com",
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
      include: ['three', 'gsap', 'lenis']
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
            'gsap-vendor': ['gsap'],
          }
        }
      }
    }
  },
});