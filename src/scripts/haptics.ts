import { WebHaptics } from "web-haptics";

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let instance: WebHaptics | null = null;

if (!prefersReducedMotion) {
  instance = new WebHaptics();

  // Document-level event delegation for data-haptic attributes
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("[data-haptic]");
    if (target) {
      const pattern = (target as HTMLElement).dataset.haptic || "light";
      instance?.trigger(pattern);
    }
  });
}

/** Programmatic haptic trigger for use in page scripts */
export function haptic(pattern: string): void {
  instance?.trigger(pattern);
}
