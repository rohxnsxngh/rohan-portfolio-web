import imageSizes from '../data/imageSizes.json';

// JSON imports widen the tuples to number[], hence the double assertion.
const SIZES = imageSizes as unknown as Record<string, [number, number]>;

/**
 * Widths the Vercel optimiser accepts (images.sizes in
 * .vercel/output/config.json, i.e. [640, 750, 828, 1080, 1200, 1920, 2048,
 * 3840]). Any other `w` returns HTTP 400, and a browser that picks a 400ing
 * srcset candidate shows a broken image instead of falling back. The service
 * only snaps the plain `src` to this list; srcset widths are passed through as
 * written, so every candidate has to come from here. 2048 and 3840 are left
 * out because nothing on the site is drawn wider than MAX_WIDTH.
 */
export const VERCEL_WIDTHS = [640, 750, 828, 1080, 1200, 1920] as const;

/** Largest width we ever ask the optimiser for. */
const MAX_WIDTH = 1920;

export interface ResolvedImageSize {
  width: number;
  height: number;
  /** Measured source dimensions, before the MAX_WIDTH cap. */
  naturalWidth: number;
  naturalHeight: number;
  /** Candidate widths for the srcset, all on VERCEL_WIDTHS. */
  widths: number[];
}

/**
 * Srcset candidates for a source `naturalWidth` px wide: every allowed width
 * below it, plus the first allowed width at or above it. That last one is
 * served at the natural size (the optimiser never upscales), which is how a
 * 983px source gets a full-resolution candidate without asking for w=983.
 * `candidates` narrows the list for slots that never need the larger sizes.
 */
export function allowedWidths(
  naturalWidth: number,
  candidates: readonly number[] = VERCEL_WIDTHS,
): number[] {
  const list = candidates.filter((w) => w <= MAX_WIDTH);
  const widths = list.filter((w) => w < naturalWidth);
  const next = list.find((w) => w >= naturalWidth);
  if (next !== undefined) widths.push(next);
  return widths;
}

/**
 * Intrinsic dimensions for an image in public/images, measured at build time
 * by scripts/generate-image-sizes.mjs.
 *
 * Passing the real dimensions to <Image> matters for the `h-auto` galleries:
 * the browser derives the pre-load box from the width/height attributes, so a
 * guessed aspect ratio would make the grid jump as each image arrives.
 *
 * Falls back to a 3:2 box for anything not in the manifest. That is a path the
 * site does not currently hit, since every image referenced by the content
 * collections resolves, but a wrong ratio degrades to layout shift rather
 * than a build failure.
 */
export function getImageSize(src: string, fallbackWidth = 1200): ResolvedImageSize {
  const entry = SIZES[src.split('?')[0]];

  const [naturalWidth, naturalHeight] = entry ?? [fallbackWidth, Math.round(fallbackWidth / 1.5)];

  // Cap the declared size, keeping the real aspect ratio. Only the ratio
  // matters for layout (the galleries set the rendered width with `w-full`),
  // and the declared width is what <Image> uses for the plain `src`, so
  // leaving it at the natural size made the no-srcset fallback heavier than
  // every candidate in the srcset.
  const width = Math.min(naturalWidth, MAX_WIDTH);
  const height = Math.round((naturalHeight / naturalWidth) * width);

  // Built from the natural width, not the capped one: the cap only ever binds
  // above 1920, where every allowed width is already below the source.
  const widths = allowedWidths(naturalWidth);

  return { width, height, naturalWidth, naturalHeight, widths };
}
