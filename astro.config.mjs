import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  content: {
    collections: {
      blogs: "src/content/blogs",
    },
  },
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
});
