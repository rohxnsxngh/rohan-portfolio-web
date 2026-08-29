import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let tickerFn: ((time: number) => void) | null = null;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll(): Lenis {
  destroySmoothScroll();

  lenis = new Lenis({
    duration: prefersReducedMotion() ? 0 : 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
    infinite: false,
  });

  // Astro restores the previous scroll position on a history navigation without
  // going through Lenis, so a freshly constructed instance would believe it is
  // at the top while the document is scrolled down — and the first wheel event
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
