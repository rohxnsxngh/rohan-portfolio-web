/**
 * Registers document-level lifecycle listeners exactly once per document.
 *
 * Astro bundles each page's hoisted `<script>` blocks into a per-page chunk,
 * and a component used on several routes is inlined into every one of those
 * chunks under a different URL. Navigating to a route whose chunk has not run
 * yet therefore executes the component's script *again*, and each execution
 * added another `astro:page-load` / `astro:before-swap` listener that was never
 * removed.
 *
 * For the 3D viewers that meant one extra `init()` — and so one extra WebGL
 * context, RAF loop and copy of the model — per route visited, until the
 * browser started dropping the oldest contexts and canvases went black. For the
 * cursor and layout scripts it meant the same work repeated N times per
 * navigation.
 *
 * Each module executes in its own closure, so the first registration owns the
 * state and later duplicates simply no-op.
 */
const KEY = '__bindOnceRegistry';

export function bindOnce(key: string, register: () => void): void {
  if (typeof window === 'undefined') return;

  const w = window as unknown as Record<string, Set<string> | undefined>;
  let registry = w[KEY];
  if (!registry) {
    registry = new Set<string>();
    w[KEY] = registry;
  }

  if (registry.has(key)) return;
  registry.add(key);

  register();
}
