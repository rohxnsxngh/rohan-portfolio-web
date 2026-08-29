/**
 * Adds Cache-Control headers for everything served out of public/.
 *
 * Why this is a post-build script and not vercel.json: @astrojs/vercel builds
 * against the Build Output API and writes .vercel/output/config.json itself.
 * That file is authoritative for routing, and the adapter reads vercel.json
 * only to cross-check `trailingSlash` — a `headers` block there is silently
 * ignored. The adapter hardcodes exactly one caching route, for its own
 * content-hashed /_astro/ bundles, so every asset in public/ fell through to
 * Vercel's default of `public, max-age=0, must-revalidate`.
 *
 * That default meant a revalidation round trip for every model, image, video
 * and font on every page load, and a full re-download of the ~7MB hero model
 * whenever the cache was evicted.
 *
 * These paths are not content-hashed, so `immutable` would be wrong here:
 * replacing an asset in place would leave cached browsers pinned to the old
 * bytes. A week of freshness plus a month of stale-while-revalidate removes
 * the per-load round trip while still picking replacements up on its own.
 */
import { readFile, writeFile } from 'node:fs/promises';

const CONFIG_PATH = new URL('../.vercel/output/config.json', import.meta.url);

const CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=2592000';

// `continue: true` matches how the adapter applies its own /_astro/ header:
// set the header, then carry on to `handle: "filesystem"` so the file is
// still actually served.
const CACHE_ROUTES = [
  {
    src: '^/(models|videos|fonts|images)/(.*)$',
    headers: { 'cache-control': CACHE_CONTROL },
    continue: true,
  },
  {
    src: '^/(.*)\\.(svg|jpg|jpeg|png|webp|avif|gif|ico|pdf|mp4|webm)$',
    headers: { 'cache-control': CACHE_CONTROL },
    continue: true,
  },
];

const MARKER = 'cache-control';

const config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));

if (!Array.isArray(config.routes)) {
  throw new Error('.vercel/output/config.json has no routes array — did the adapter change?');
}

// Header routes must land before `handle: "filesystem"`; anything after it is
// only consulted once the static file lookup has already missed.
const filesystemIndex = config.routes.findIndex((r) => r.handle === 'filesystem');
if (filesystemIndex === -1) {
  throw new Error('.vercel/output/config.json has no filesystem handler — did the adapter change?');
}

const alreadyApplied = config.routes.some(
  (r) => r.headers && MARKER in r.headers && /models\|videos/.test(r.src ?? '')
);

if (alreadyApplied) {
  console.log('[cache-headers] already present, skipping');
} else {
  config.routes.splice(filesystemIndex, 0, ...CACHE_ROUTES);
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`[cache-headers] applied "${CACHE_CONTROL}" to public/ assets`);
}
