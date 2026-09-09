/**
 * Gives markdown prose images a real srcset, a size cap and a sane quality.
 *
 * `![alt](@images/foo.jpg)` in a .md file goes through astro:assets, but with
 * Astro's defaults: one candidate at the source width and, because the Vercel
 * image service defaults quality to 100, a URL like `w=3840&q=100`. On a
 * 390px-wide phone that is a 2.5 to 4.6 MB WebP per camera photo and a
 * 3840x2560 bitmap to decode, for an image drawn at 360 CSS px. The galleries
 * do not have this problem because they pass widths/sizes/quality explicitly
 * from src/data/imageSizes.json; this plugin gives the prose the same
 * treatment.
 *
 * Why a rehype plugin and not `<Content components={{ img }}>`: the components
 * prop is MDX-only, and every entry in src/content is plain .md, so it would
 * be silently ignored. This works because user rehype plugins run before
 * Astro's own rehypeImages(), which JSON-serialises every property left on an
 * <img> whose src is in `file.data.imagePaths` and later spreads them straight
 * into getImage(). So setting `widths`, `sizes`, `quality` and `width` here is
 * exactly the same as passing them to <Image>.
 *
 * Width candidates must come from the Vercel optimizer's configured sizes list
 * ([640, 750, 828, 1080, 1200, 1920, 2048, 3840]): any other `w` returns HTTP
 * 400 and a browser that picks a 400ing candidate shows a broken image rather
 * than falling back. 414 is therefore deliberately not in the list.
 */
import { readFileSync } from 'node:fs';

/**
 * Candidate widths for the srcset. All on Vercel's allowed list. 1920 is there
 * for the 2x desktop: the column is 896 CSS px, so a Retina Mac needs 1792
 * device px and would otherwise upscale the 1200 candidate by 1.5x. Sources
 * narrower than a candidate drop it below, so diagrams do not pay for it.
 */
const WIDTHS = [640, 828, 1200, 1920];

/**
 * Must match the real rendered width or the browser under-fetches: the prose
 * column is .markdown-content max-w-4xl = 896px (src/components/MarkdownContent.astro),
 * and the section padding only eats into that below 1056px. Declaring less
 * than that made a 1x desktop pick 828w and stretch it. On a phone the image
 * spans the viewport.
 */
const SIZES = '(max-width: 767px) 100vw, 896px';

/**
 * These were served at q=100 before, so the quality is the one visible
 * trade-off here. 80 is where WebP photo artefacts stop being findable
 * side by side at 2x; it is still well under half the bytes of q=100.
 */
const QUALITY = 80;

/**
 * Cap on the declared width. The plain `src` (what a browser without srcset
 * support, or one that lost a candidate, fetches) is requested at the declared
 * width, so leaving it at the 4000px natural width kept the fallback heavier
 * than every candidate. Equal to the largest candidate so the fallback is
 * never smaller than what the srcset offers. Layout is unaffected: the column
 * is narrower than this, and `max-width: 100%` decides the rendered size
 * either way.
 */
const MAX_WIDTH = 1920;

/**
 * Natural dimensions, keyed by public URL (`/images/...`), measured at build
 * time by scripts/generate-image-sizes.mjs. Needed so a 500px diagram does not
 * get three identical 500w candidates: getSrcSet clamps every width to the
 * source width, and the Vercel service drops `w` entirely for a candidate
 * that equals it, which is also a 400.
 */
const NATURAL_SIZES = JSON.parse(
  readFileSync(new URL('../data/imageSizes.json', import.meta.url), 'utf8'),
);

function naturalWidthOf(src) {
  if (!src.startsWith('@images/')) return undefined;
  const entry = NATURAL_SIZES['/images/' + src.slice('@images/'.length)];
  return entry ? entry[0] : undefined;
}

/** Minimal depth-first walk; avoids importing unist-util-visit, which is only a transitive dependency here. */
function walk(node, fn) {
  fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, fn);
  }
}

export default function rehypeMarkdownImageSizes() {
  return (tree, file) => {
    // Set by Astro's remarkCollectImages for every image src it will optimise
    // (anything that is not a URL and does not start with `/`). Raw
    // `/images/...` paths are not in it and are left alone, which is what
    // scripts/verify-assets.mjs now fails the build on.
    const optimised = file.data?.imagePaths;
    if (!optimised || optimised.size === 0) return;

    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;
      const raw = node.properties?.src;
      if (typeof raw !== 'string') return;
      // rehypeImages decodes before its own lookup; match that so an encoded
      // space in a path still resolves.
      const src = decodeURI(raw);
      if (!optimised.has(src)) return;

      node.properties.quality = QUALITY;

      const naturalWidth = naturalWidthOf(src);
      if (!naturalWidth) return;

      // Never upscale: only candidates narrower than the source.
      const widths = WIDTHS.filter((w) => w < naturalWidth);
      if (widths.length === 0) return;

      node.properties.widths = widths;
      node.properties.sizes = SIZES;
      if (naturalWidth > MAX_WIDTH) {
        // Height is derived from the source aspect ratio by the image
        // service, so only the width needs stating.
        node.properties.width = MAX_WIDTH;
      }
    });
  };
}
