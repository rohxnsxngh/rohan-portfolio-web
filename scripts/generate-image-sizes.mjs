/**
 * Records the intrinsic dimensions of every image in public/images.
 *
 * Astro's <Image> needs explicit width/height for a string `src`, and the
 * gallery images come from content frontmatter as plain paths. The two ways to
 * get dimensions at render time both fail here:
 *
 *   - `inferSize` HTTP-probes the src, and a root-relative path has no host.
 *   - Reading the file from disk works locally but not in production: public/
 *     is served by Vercel's CDN and is not part of the serverless function's
 *     filesystem.
 *
 * So the sizes are resolved once at build time into a JSON module that gets
 * bundled with the function. Passing real dimensions (rather than a guessed
 * aspect ratio) keeps the `h-auto` galleries laid out exactly as before and
 * reserves the right box, so optimising these images costs no layout shift.
 */
import { readdir, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_IMAGES = join(ROOT, 'public', 'images');
const OUT = join(ROOT, 'src', 'data', 'imageSizes.json');

const RASTER = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const sizes = {};
let scanned = 0;
let failed = 0;

for await (const file of walk(PUBLIC_IMAGES)) {
  if (!RASTER.has(extname(file).toLowerCase())) continue;
  scanned++;
  // Key by the URL the site actually requests, e.g. /images/project/foo.png
  const key = '/' + relative(join(ROOT, 'public'), file).split(/[\\/]/).join('/');
  try {
    const { width, height } = await sharp(file).metadata();
    if (width && height) sizes[key] = [width, height];
    else failed++;
  } catch {
    failed++;
  }
}

const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));

await mkdir(join(ROOT, 'src', 'data'), { recursive: true });
await writeFile(OUT, JSON.stringify(sorted, null, 2) + '\n');

console.log(
  `[image-sizes] ${Object.keys(sorted).length} of ${scanned} images measured` +
  (failed ? ` (${failed} unreadable)` : '')
);
