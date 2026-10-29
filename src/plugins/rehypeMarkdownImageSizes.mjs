/**
 * Gives markdown prose images a real srcset, a size cap and a sane quality,
 * served from public/ through the Vercel optimizer.
 *
 * `![alt](@images/foo.jpg)` in a .md file would normally go through
 * astro:assets: Astro's remarkCollectImages turns the alias into an import,
 * which emits a hashed copy of the original into _astro/ next to the copy
 * public/ already ships. Every deployment stored both, ~23MB of duplicates,
 * and Vercel keeps up to ten deployments against the team's 10GB Deployment
 * Storage. So the pair of plugins here takes the image out of astro:assets
 * and builds the same markup the gallery <Image>s get, pointed at /images/:
 *
 *   remarkPublicMarkdownImages  rewrites `@images/x` to `/images/x` before
 *     remarkCollectImages runs (user remark plugins run first, and it skips
 *     any src starting with `/`), and records each one on the vfile.
 *   rehypeMarkdownImageSizes    gives those <img>s src/srcset/width/height
 *     in the exact form @astrojs/vercel's build image service emits.
 *
 * Authoring is unchanged: keep writing `@images/...`, which is also what
 * scripts/verify-assets.mjs checks resolves. Under `astro dev` there is no
 * /_vercel/image endpoint, so the plain public file is used.
 *
 * Why plugins and not `<Content components={{ img }}>`: the components prop
 * is MDX-only, and every entry in src/content is plain .md, so it would be
 * silently ignored.
 *
 * Width candidates must come from the Vercel optimizer's configured sizes list
 * ([640, 750, 828, 1080, 1200, 1920, 2048, 3840]): any other `w` returns HTTP
 * 400 and a browser that picks a 400ing candidate shows a broken image rather
 * than falling back. 414 is therefore deliberately not in the list.
 */
import { readFileSync } from 'node:fs';

/** The optimizer's allowed widths, as configured by @astrojs/vercel. */
const VERCEL_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

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
 * width, so leaving it at the natural width kept the fallback heavier than
 * every candidate. Equal to the largest candidate so the fallback is never
 * smaller than what the srcset offers. Layout is unaffected: the column is
 * narrower than this, and `max-width: 100%` decides the rendered size either
 * way.
 */
const MAX_WIDTH = 1920;

/**
 * Natural dimensions, keyed by public URL (`/images/...`), measured at build
 * time by scripts/generate-image-sizes.mjs. Needed for width/height (no layout
 * shift) and so a 500px diagram does not get candidates wider than itself.
 */
const NATURAL_SIZES = JSON.parse(
  readFileSync(new URL('../data/imageSizes.json', import.meta.url), 'utf8'),
);

/** Only `astro build` has the Vercel optimizer behind /_vercel/image. */
const USE_OPTIMIZER = process.argv.includes('build');

/** Same snapping as the adapter's sharedValidateOptions: nearest allowed size. */
function nearestSize(width) {
  return VERCEL_SIZES.reduce((prev, curr) =>
    Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev,
  );
}

/** Same shape as the adapter's build-image-service getURL. */
function optimizerUrl(src, width) {
  const params = new URLSearchParams();
  params.append('url', src);
  params.append('w', String(width));
  params.append('q', String(QUALITY));
  return '/_vercel/image?' + params;
}

export function remarkPublicMarkdownImages() {
  return (tree, file) => {
    const rewritten = new Set();
    walk(tree, (node) => {
      if ((node.type === 'image' || node.type === 'definition') && node.url?.startsWith('@images/')) {
        node.url = '/images/' + node.url.slice('@images/'.length);
        rewritten.add(decodeURI(node.url));
      }
    });
    file.data.publicMarkdownImages = rewritten;
  };
}

export default function rehypeMarkdownImageSizes() {
  return (tree, file) => {
    const rewritten = file.data?.publicMarkdownImages;
    if (!rewritten || rewritten.size === 0) return;

    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'img') return;
      const raw = node.properties?.src;
      if (typeof raw !== 'string') return;
      const src = decodeURI(raw);
      if (!rewritten.has(src)) return;

      const props = node.properties;
      props.loading ??= 'lazy';
      props.decoding ??= 'async';

      const natural = NATURAL_SIZES[src];
      if (!natural) return;
      const [naturalWidth, naturalHeight] = natural;
      const width = Math.min(naturalWidth, MAX_WIDTH);
      props.width = width;
      props.height = Math.round((width * naturalHeight) / naturalWidth);

      if (!USE_OPTIMIZER) return;
      props.src = optimizerUrl(src, nearestSize(width));
      // Never upscale: only candidates narrower than the source.
      const widths = WIDTHS.filter((w) => w < naturalWidth);
      if (widths.length > 0) {
        props.srcset = widths.map((w) => `${optimizerUrl(src, w)} ${w}w`).join(', ');
        props.sizes = SIZES;
      }
    });
  };
}

/** Minimal depth-first walk; avoids importing unist-util-visit, which is only a transitive dependency here. */
function walk(node, fn) {
  fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, fn);
  }
}
