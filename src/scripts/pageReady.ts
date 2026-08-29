/**
 * Registers a per-page initialiser that cannot miss its event.
 *
 * `document.addEventListener('astro:page-load', init)` is the documented way to
 * initialise a page under View Transitions, but it is a race: Astro injects the
 * incoming route's `<script>` tags during the swap and fires `astro:page-load`
 * once they report `load`. A module that is still evaluating — or one pulled
 * from a cold cache — registers its listener *after* the event has already been
 * dispatched, and its initialiser simply never runs for that page view.
 *
 * That is what left headers and body copy stuck at `opacity: 0`: the CSS hides
 * them and only the page's own GSAP intro reveals them, so a missed event means
 * permanently invisible content rather than merely a missing animation.
 *
 * `onPageReady` closes the gap by also running `fn` immediately when the event
 * for the current page view has already fired. The flag it reads is maintained
 * by the inline watchdog in Layout.astro, which is guaranteed to be registered
 * before any module script runs.
 */
export function onPageReady(fn: () => void): void {
  document.addEventListener('astro:page-load', fn);

  if (typeof window !== 'undefined' && (window as any).__astroPageLoaded) {
    fn();
  }
}
