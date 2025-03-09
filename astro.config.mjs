import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

import tailwind from "@astrojs/tailwind";
import { remarkImagePlugin } from "./src/plugins/remarkImagePlugin.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [remarkImagePlugin],
  },
  content: {
    collections: {
      blogs: "src/content/blogs",
    },
  },
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  vite: {
    resolve: {
      alias: {
        "@images": "/src/images",
      },
    },
  },
});
