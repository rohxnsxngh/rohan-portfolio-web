/**
 * Fails the build if any local asset reference does not resolve to a real file,
 * if an image is served raw instead of through the optimizer, or if a
 * referenced image is bigger than it has any business being.
 *
 * A broken image does not fail a build, throw, or log anything. It renders a
 * torn-image glyph on the live site and nothing anywhere tells you. The only
 * reason the last one was caught is that someone happened to screenshot it.
 * This turns that whole class of defect into a build error.
 *
 * Checks the two ways this site references local assets:
 *   @images/foo.png   the Vite alias used in markdown and components
 *   /images/foo.png   a plain public/ URL
 *
 * Skips external URLs, data URIs, anything containing a template expression,
 * and references inside HTML comments (which never render).
 *
 * Two further rules, added after the biorobotics page was found shipping 20.5
 * MB of camera originals to phones:
 *
 *   1. No raw <img> from public/. A markdown image written as `![](/images/..)`
 *      or a literal `<img src="/images/..">` bypasses astro:assets entirely, so
 *      it gets no srcset, no width/height, no lazy loading and the full original
 *      file. The `@images/` alias is the same file through the optimizer.
 *
 *   2. No referenced image over 1 MB. Anything that size is a camera original
 *      that should be downscaled before it is committed; the optimizer hides
 *      the cost from the browser but not from deploy weight or optimizer time.
 *      The originals that were already in the repo when the rule arrived are
 *      listed in KNOWN_OVERSIZED so the rule bites new additions and growth
 *      rather than blocking every build until they are resized. Shrink one of
 *      them and remove its entry.
 *
 * Pass `--built` after `astro build` to also scan the emitted HTML for raw
 * `<img src="/images/` tags, which catches the same defect from any source the
 * static scan does not know about (a component computing the path, say).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const SCAN_DIRS = ['src/content', 'src/pages', 'src/components', 'src/layouts'];
const SCAN_EXT = new Set(['.md', '.mdx', '.astro']);
const BUILT_DIRS = ['.vercel/output/static', 'dist'];

// Referenced from markdown/JSX/HTML. Deliberately narrow: only local paths.
const PATTERNS = [
  /@images\/[A-Za-z0-9._\-/]+/g,
  /(?<!@)\/images\/[A-Za-z0-9._\-/]+/g,
  /\/(?:models|videos|fonts)\/[A-Za-z0-9._\-/]+/g,
];

// A literal <img> pointing at public/images. Shared between the source scan
// and the --built scan so the two cannot drift on what counts as raw; sharing
// one /g instance is safe because matchAll clones the regex before iterating.
const RAW_IMG_TAG = /<img[^>]*\ssrc=["']\/images\//g;

// Ways an image ends up as a bare <img> that never touches the optimizer.
const RAW_IMAGE_PATTERNS = [
  { re: /!\[[^\]]*\]\(\/images\/[^)]*\)/g, why: 'markdown image with a /images/ path; use @images/ so it goes through astro:assets' },
  { re: RAW_IMG_TAG, why: 'literal <img src="/images/..."> bypasses the optimizer' },
];

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const MAX_IMAGE_BYTES = 1_000_000;

// Originals that predate the size rule, all referenced only through the
// optimizer (markdown @images/ or frontmatter <Image>), so the browser never
// downloads them as-is. Sizes are recorded so growth still fails.
const KNOWN_OVERSIZED = new Map([
  ['/images/experience/octapulse/photo_50575.jpg', 8_647_052],
  ['/images/experience/octapulse/photo_52203.jpg', 5_854_699],
  ['/images/experience/octapulse/photo_51731.jpg', 4_739_888],
  ['/images/project/BiobotTBone.JPG', 3_636_785],
  ['/images/project/StrandbeestPrototype.png', 3_631_122],
  ['/images/project/BiobotGroupPicture.JPG', 3_624_622],
  ['/images/project/BiobotMesh.png', 3_597_283],
  ['/images/project/BiobotWaterside.JPG', 3_589_716],
  ['/images/project/BiobotCFD2.png', 2_660_515],
  ['/images/project/BiobotBaby.JPG', 2_636_438],
  ['/images/project/MachineLearningBaseballMapping.png', 1_881_254],
  ['/images/project/HansAubsLab.png', 1_384_862],
]);

const scanBuilt = process.argv.includes('--built');

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** Strip comments so commented-out references are not flagged. */
function stripComments(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, '')   // HTML / markdown
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
    .replace(/^[ \t]*\/\/.*$/gm, '');  // JS line comments
}

/** Public URL for a reference, e.g. @images/a.png and /images/a.png both give /images/a.png. */
function toPublicUrl(ref) {
  const clean = ref.split('?')[0].split('#')[0];
  if (clean.startsWith('@images/')) return '/images/' + clean.slice('@images/'.length);
  return clean;
}

function toDiskPath(ref) {
  return join(PUBLIC, toPublicUrl(ref).replace(/^\//, ''));
}

function fmtBytes(n) {
  return (n / 1_000_000).toFixed(2) + ' MB';
}

const problems = [];
const raw = [];
const oversized = [];
const grandfathered = [];
let checked = 0;

// A file is measured once no matter how many places reference it.
const measured = new Map();

for (const dir of SCAN_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    if (!SCAN_EXT.has(extname(file))) continue;
    const text = stripComments(await readFile(file, 'utf8'));
    const rel = file.slice(ROOT.length);

    for (const { re, why } of RAW_IMAGE_PATTERNS) {
      for (const match of text.matchAll(re)) {
        if (match[0].includes('${') || match[0].includes('{')) continue;
        raw.push({ file: rel, snippet: match[0].slice(0, 100), why });
      }
    }

    const seen = new Set();
    for (const pattern of PATTERNS) {
      for (const match of text.matchAll(pattern)) {
        const ref = match[0];
        // A template expression means the path is computed; cannot verify statically.
        if (ref.includes('${') || ref.includes('{')) continue;
        // Directory-only references (a trailing slash) are not assets.
        if (ref.endsWith('/')) continue;
        // Must look like a file with an extension.
        if (!extname(ref)) continue;
        if (seen.has(ref)) continue;
        seen.add(ref);

        checked++;
        const disk = toDiskPath(ref);
        if (!existsSync(disk)) {
          problems.push({ file: rel, ref });
          continue;
        }

        if (!RASTER_EXT.has(extname(ref).toLowerCase())) continue;
        const url = toPublicUrl(ref);
        if (!measured.has(url)) measured.set(url, (await stat(disk)).size);
        const size = measured.get(url);
        if (size <= MAX_IMAGE_BYTES) continue;

        const allowed = KNOWN_OVERSIZED.get(url);
        if (allowed !== undefined && size <= allowed) {
          if (!grandfathered.some((g) => g.url === url)) grandfathered.push({ url, size });
        } else if (!oversized.some((o) => o.url === url)) {
          oversized.push({ url, size, file: rel, grew: allowed !== undefined });
        }
      }
    }
  }
}

// Optional post-build pass over the emitted HTML.
const rawBuilt = [];
if (scanBuilt) {
  const outDir = BUILT_DIRS.map((d) => join(ROOT, d)).find((d) => existsSync(d));
  if (!outDir) {
    console.error('[verify-assets] --built given but no build output found in ' + BUILT_DIRS.join(' or '));
    process.exit(1);
  }
  for await (const file of walk(outDir)) {
    if (extname(file) !== '.html') continue;
    const html = await readFile(file, 'utf8');
    for (const match of html.matchAll(RAW_IMG_TAG)) {
      rawBuilt.push({ file: file.slice(ROOT.length), snippet: match[0].slice(0, 100) });
    }
  }
}

let failed = false;

if (problems.length) {
  failed = true;
  console.error(`\n[verify-assets] ${problems.length} broken asset reference(s):\n`);
  for (const p of problems) console.error(`  ${p.ref}\n    referenced by ${p.file}`);
  console.error('\nEvery reference above points at a file that does not exist in public/.');
}

if (raw.length) {
  failed = true;
  console.error(`\n[verify-assets] ${raw.length} image(s) served raw from public/, bypassing astro:assets:\n`);
  for (const r of raw) console.error(`  ${r.snippet}\n    in ${r.file}: ${r.why}`);
  console.error('\nA raw <img> gets no srcset, no width/height and no lazy loading, and ships the full original file.');
}

if (rawBuilt.length) {
  failed = true;
  console.error(`\n[verify-assets] ${rawBuilt.length} raw <img src="/images/..."> tag(s) in the build output:\n`);
  for (const r of rawBuilt) console.error(`  ${r.snippet}\n    in ${r.file}`);
}

if (oversized.length) {
  failed = true;
  console.error(`\n[verify-assets] ${oversized.length} referenced image(s) over ${fmtBytes(MAX_IMAGE_BYTES)}:\n`);
  for (const o of oversized) {
    console.error(`  ${o.url}  ${fmtBytes(o.size)}${o.grew ? '  (grew past its recorded size)' : ''}\n    referenced by ${o.file}`);
  }
  console.error('\nDownscale these to at most 2000px on the long side before committing them; a camera original is never needed at full size.');
}

if (failed) process.exit(1);

console.log(
  `[verify-assets] ${checked} local asset references, all resolve; none served raw` +
  (scanBuilt ? `; build output clean` : ''),
);
if (grandfathered.length) {
  console.log(
    `[verify-assets] ${grandfathered.length} pre-existing original(s) over ${fmtBytes(MAX_IMAGE_BYTES)} still allowed (${fmtBytes(
      grandfathered.reduce((n, g) => n + g.size, 0),
    )} total); downscale and drop them from KNOWN_OVERSIZED`,
  );
}
