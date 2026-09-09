import { WebHaptics } from "web-haptics";

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let instance: WebHaptics | null = null;

// web-haptics has no vibration API to call on iOS (navigator.vibrate is
// undefined there), so it falls back to appending a hidden
// <label><input switch></label> to document.body and .click()-ing the label,
// which is what makes the Taptic Engine fire. Astro's View Transitions router
// replaces the whole <body> on every client-side navigation, which throws
// that label away while the library still believes it is mounted, so haptics
// silently stopped after the first in-site navigation. The fix is the
// astro:after-swap teardown below, which destroys the instance so the library
// forgets the label that no longer exists. getInstance() exists so a torn-down
// instance is rebuilt on the next request; it does not defer the label itself,
// because the library's constructor touches no DOM and only builds the label
// inside trigger(), so even the old eager `new WebHaptics()` waited for the
// first tap.
function getInstance(): WebHaptics | null {
  if (prefersReducedMotion) return null;
  if (!instance) instance = new WebHaptics();
  return instance;
}

// The layout script guards against re-evaluation the same way: if Astro
// inlines this module into more than one page chunk, a route whose chunk has
// not run yet would otherwise add a second copy of the click delegation and
// fire every tap twice.
if (!(window as any).__hapticsBound) {
  (window as any).__hapticsBound = true;

  // Document-level event delegation for data-haptic attributes
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("[data-haptic]");
    if (target) {
      const pattern = (target as HTMLElement).dataset.haptic || "light";
      getInstance()?.trigger(pattern);
    }
  });
}

// Deliberately outside the guard: `instance` is module-scoped, so every
// evaluated copy of this module must tear down its own (a page script that
// imports haptic() may have created one). A duplicate here costs a null check.
document.addEventListener("astro:after-swap", () => {
  // destroy() removes the (now detached) label and resets the library's
  // "DOM initialised" flag; dropping the instance means the next trigger
  // rebuilds it inside the new body.
  instance?.destroy();
  instance = null;
});

/** Programmatic haptic trigger for use in page scripts */
export function haptic(pattern: string): void {
  getInstance()?.trigger(pattern);
}
