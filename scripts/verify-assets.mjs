/**
 * Fails the build if any local asset reference does not resolve to a real file.
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
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const SCAN_DIRS = ['src/content', 'src/pages', 'src/components', 'src/layouts'];
const SCAN_EXT = new Set(['.md', '.mdx', '.astro']);

// Referenced from markdown/JSX/HTML. Deliberately narrow: only local paths.
const PATTERNS = [
  /@images\/[A-Za-z0-9._\-/]+/g,
  /(?<!@)\/images\/[A-Za-z0-9._\-/]+/g,
  /\/(?:models|videos|fonts)\/[A-Za-z0-9._\-/]+/g,
];

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

function toDiskPath(ref) {
  const clean = ref.split('?')[0].split('#')[0];
  if (clean.startsWith('@images/')) return join(PUBLIC, 'images', clean.slice('@images/'.length));
  return join(PUBLIC, clean.replace(/^\//, ''));
}

const problems = [];
let checked = 0;

for (const dir of SCAN_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    if (!SCAN_EXT.has(extname(file))) continue;
    const raw = stripComments(await readFile(file, 'utf8'));

    const seen = new Set();
    for (const pattern of PATTERNS) {
      for (const match of raw.matchAll(pattern)) {
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
        if (!existsSync(toDiskPath(ref))) {
          problems.push({ file: file.slice(ROOT.length), ref });
        }
      }
    }
  }
}

if (problems.length) {
  console.error(`\n[verify-assets] ${problems.length} broken asset reference(s):\n`);
  for (const p of problems) console.error(`  ${p.ref}\n    referenced by ${p.file}`);
  console.error('\nEvery reference above points at a file that does not exist in public/.');
  process.exit(1);
}

console.log(`[verify-assets] ${checked} local asset references, all resolve`);
