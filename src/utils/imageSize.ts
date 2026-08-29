import imageSizes from '../data/imageSizes.json';

// JSON imports widen the tuples to number[], hence the double assertion.
const SIZES = imageSizes as unknown as Record<string, [number, number]>;

/** Largest width we ever ask the optimiser for. */
const MAX_WIDTH = 1600;

export interface ResolvedImageSize {
  width: number;
  height: number;
  /** Candidate widths for the srcset, never upscaled past the original. */
  widths: number[];
}

/**
 * Intrinsic dimensions for an image in public/images, measured at build time
 * by scripts/generate-image-sizes.mjs.
 *
 * Passing the real dimensions to <Image> matters for the `h-auto` galleries:
 * the browser derives the pre-load box from the width/height attributes, so a
 * guessed aspect ratio would make the grid jump as each image arrives.
 *
 * Falls back to a 3:2 box for anything not in the manifest — a path the site
 * does not currently hit, since every image referenced by the content
 * collections resolves, but a wrong ratio degrades to layout shift rather
 * than a build failure.
 */
export function getImageSize(src: string, fallbackWidth = 1200): ResolvedImageSize {
  const entry = SIZES[src.split('?')[0]];

  const [naturalWidth, naturalHeight] = entry ?? [fallbackWidth, Math.round(fallbackWidth / 1.5)];

  // Cap the declared size, keeping the real aspect ratio. Only the ratio
  // matters for layout — the galleries set the rendered width with `w-full` —
  // and the declared width is what <Image> uses for the plain `src`, so
  // leaving it at the natural size made the no-srcset fallback heavier than
  // every candidate in the srcset.
  const width = Math.min(naturalWidth, MAX_WIDTH);
  const height = Math.round((naturalHeight / naturalWidth) * width);

  const widths = [400, 640, 828, 1200, 1600]
    .filter((w) => w < width)
    .concat(width);

  return { width, height, widths };
}
