/**
 * Motion tokens.
 *
 * Durations across this site had collapsed onto a handful of magic numbers,
 * `duration: 1` most of all, so a card fading into a grid took exactly as long
 * as the hero name arriving. When everything is emphasised nothing is, and a
 * uniformly slow page reads as sluggish even when it is fast.
 *
 * These are the standard UI motion bands. The point is not the exact values,
 * it is that a card, a page and a hero are drawn from different ones.
 *
 *   micro-feedback   80-120ms
 *   control          120-180ms
 *   card enter       200-350ms
 *   page transition  400-600ms
 *   dramatic reveal  600-1200ms
 *
 * Two rules worth keeping in mind when reaching for these:
 *
 * Entrances run longer than exits. People care about what appears, not what
 * leaves, so an exit at roughly two thirds of its entrance feels right rather
 * than rushed.
 *
 * Linear is for scrubbing only. A scroll-linked timeline should be linear
 * because the scroll wheel is the clock. Anything self-driven needs a curve,
 * or it reads as mechanical.
 */

export const DURATION = {
  micro: 0.12,
  control: 0.18,
  icon: 0.22,
  card: 0.3,
  cardExit: 0.2,
  page: 0.5,
  hero: 0.9,
  /** Slow ambient loops: breathing glows, drifting grids. */
  ambient: 2,
} as const;

export const EASE = {
  /** Decelerate into place. Anything arriving. */
  enter: 'power3.out',
  /** Accelerate away. Anything leaving. */
  exit: 'power3.in',
  /** Moving between two on-screen positions. */
  move: 'power2.inOut',
  /** Looping ambient motion, no hard stops. */
  ambient: 'sine.inOut',
  /** Scroll-linked only, where the scroll position is the clock. */
  scrub: 'none',
  /** Reserved for the hero, the one place overshoot is earned. */
  hero: 'expo.out',
} as const;

export const STAGGER = {
  micro: 0.03,
  standard: 0.06,
  dramatic: 0.09,
} as const;

/** Total stagger should stay under this, however many items there are. */
export const STAGGER_BUDGET = 0.5;

/**
 * Per-item stagger that keeps the whole cascade inside the budget.
 *
 * A fixed per-item delay is fine for five cards and wrong for fifty. A blog
 * title split into 41 characters at a flat 20ms each runs for 820ms of stagger
 * alone, so the last letter lands long after the reader has moved on. This
 * shrinks the step as the count grows and leaves small groups untouched.
 */
export function staggerFor(count: number, each: number = STAGGER.standard, budget = STAGGER_BUDGET): number {
  if (count <= 1) return 0;
  return Math.min(each, budget / (count - 1));
}
