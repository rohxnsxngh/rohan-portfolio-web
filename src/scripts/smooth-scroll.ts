import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Same expression heavy3d.ts exposes as isCoarsePointer(); inlined so this
// module does not pull the 3D helper into the layout chunk.
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export function initSmoothScroll(): Lenis | null {
  destroySmoothScroll();

  // Touch devices keep native momentum scrolling, so Lenis has nothing to add
  // there, but constructing it is not free: its VirtualScroll registers
  // non-passive touchstart/touchmove/touchend listeners on window (every
  // finger drag walks event.composedPath() before Lenis decides to do
  // nothing), and its ticker callback is a second gsap.ticker listener, which
  // is enough to stop GSAP ever putting the rAF loop to sleep. On a phone
  // that is a permanently awake ticker for zero visible benefit, so do not
  // construct it at all. ScrollTrigger works against native scroll.
  if (isCoarsePointer()) {
    return null;
  }

  lenis = new Lenis({
    duration: prefersReducedMotion() ? 0 : 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    infinite: false,
    // Explicit even though it is the default: a JS-smoothed approximation
    // fights the platform's own touch physics and reads as lag.
    syncTouch: false,
  });

  // Astro restores the previous scroll position on a history navigation without
  // going through Lenis, so a freshly constructed instance would believe it is
  // at the top while the document is scrolled down, and the first wheel event
  // would jump. Start it from wherever the document actually is.
  if (window.scrollY > 0) {
    lenis.scrollTo(window.scrollY, { immediate: true });
  }

  // Sync Lenis scroll with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Use GSAP ticker for unified RAF loop
  tickerFn = (time: number) => {
    lenis?.raf(time * 1000);
  };
  gsap.ticker.add(tickerFn);

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroySmoothScroll(): void {
  if (tickerFn) {
    gsap.ticker.remove(tickerFn);
    tickerFn = null;
  }
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}

export function getLenis(): Lenis | null {
  return lenis;
}
