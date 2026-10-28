import { bindOnce } from '../scripts/bindOnce';
import { onPageReady } from '../scripts/pageReady';
import { initDiagrams, destroyDiagrams, onVisibility, onReducedChange } from './runtime';

// The runtime keeps its own clock and its own rAF, outside GSAP, because
// astro:before-swap kills every GSAP tween on the page and the diagram loop
// has to sleep and wake on its own terms (off screen, hidden tab, paused).
bindOnce('diagrams', () => {
  onPageReady(() => initDiagrams());
  document.addEventListener('astro:before-swap', destroyDiagrams);
  document.addEventListener('visibilitychange', onVisibility);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', onReducedChange);
});
