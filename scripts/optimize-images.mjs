/**
 * Shrinks the source photos in public/images to what the site can serve.
 *
 * Nothing is ever rendered wider than 1920px (MAX_WIDTH in
 * src/utils/imageSize.ts), yet phone and camera originals land here at 4032px
 * and 4-8MB. Every Vercel deployment stores public/ twice (the copied file and
 * the _astro asset Astro emits for imported images) and keeps up to ten
 * deployments, so a 4MB photo costs ~80MB of the team's Deployment Storage
 * while the optimizer only ever reads its first 1920 columns.
 *
 *   node scripts/optimize-images.mjs            rewrite oversized files in place
 *   node scripts/optimize-images.mjs --dry-run  report what would change
 *
 * Idempotent: a file is only rewritten when it is wider than MAX_WIDTH, or is
 * over MIN_BYTES and the re-encode saves at least MIN_SAVING. Run
 * `npm run image-sizes` afterwards so src/data/imageSizes.json records the new
 * intrinsic dimensions.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC_IMAGES = join(ROOT, 'public', 'images');
const MAX_WIDTH = 1920;
const MIN_SAVING = 0.15;
// Below this a file is already web-sized; re-encoding it only risks detail.
const MIN_BYTES = 300 * 1024;
const DRY_RUN = process.argv.includes('--dry-run');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

let before = 0;
let after = 0;
for await (const file of walk(PUBLIC_IMAGES)) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

  const input = await readFile(file);
  const { width } = await sharp(input).metadata();
  if (width <= MAX_WIDTH && input.length < MIN_BYTES) continue;

  // rotate() bakes EXIF orientation into the pixels before the metadata is
  // dropped, so portrait phone shots stay upright.
  const pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const output = ext === '.png'
    ? await pipeline.png({ compressionLevel: 9, palette: false }).toBuffer()
    : await pipeline.jpeg({ quality: 84, mozjpeg: true }).toBuffer();

  if (width <= MAX_WIDTH && output.length > input.length * (1 - MIN_SAVING)) continue;

  before += input.length;
  after += output.length;
  console.log(`${relative(ROOT, file)}: ${(input.length / 1024).toFixed(0)}K -> ${(output.length / 1024).toFixed(0)}K`);
  if (!DRY_RUN) await writeFile(file, output);
}
console.log(`[optimize-images] ${(before / 2 ** 20).toFixed(1)}MB -> ${(after / 2 ** 20).toFixed(1)}MB${DRY_RUN ? ' (dry run)' : ''}`);
