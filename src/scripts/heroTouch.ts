/**
 * Touch handling for the hero reveal, shared by the four robot heroes.
 *
 * The desktop interaction is: move the mouse over the hero and the copy dims,
 * the scrim lifts, the lights follow the cursor, and a drag on the canvas
 * spins the model. Go still and it lingers for 800ms, then fades back over
 * two seconds so the visitor can admire the robot. A finger should feel the
 * same, with one difference a mouse never has: a phone also scrolls with the
 * same gesture. So the finger's first job is to say which it is.
 *
 *   touch          reveal at once, lights under the finger
 *   vertical flick scrolling: release the reveal immediately, native scroll
 *   sideways drag  exploring: lights follow, the model spins, page holds still
 *   hold ~250ms    exploring too, any direction from then on
 *   lift           nothing abrupt: the same 800ms linger and slow fade as a
 *                  mouse going still, not the instant cut a mouseleave gives
 *
 * The canvas under the hero has touch-action: pan-y, so the browser owns
 * vertical pans by default. Once the gesture is exploring, touchmove is
 * cancelled where the browser still allows it (a hold has not started a
 * pan, and after a sideways start the browser has already given the gesture
 * up), which keeps the page still and keeps pointer events flowing to
 * OrbitControls. The touchmove listener is therefore non-passive, but it
 * returns immediately on a scroll, and it is bound on the hero only.
 *
 * Each page keeps its own handleInteraction (it dispatches page-specific
 * events to its viewer) and passes it in along with a release for the
 * scrolling case. Nothing here touches the mouse handlers.
 */
export interface HeroTouchHandlers {
  /** Reveal and point the lights at this viewport position. */
  interact: (clientX: number, clientY: number) => void;
  /** Drop the reveal now: the finger turned out to be scrolling. */
  release: () => void;
}

const SCROLL_THRESHOLD = 10;
const HOLD_MS = 250;

export function bindHeroTouch(
  hero: HTMLElement,
  { interact, release }: HeroTouchHandlers,
  signal?: AbortSignal,
): void {
  let startX = 0;
  let startY = 0;
  let scrolling = false;
  let exploring = false;
  let holdTimer: number | null = null;

  const clearHold = () => {
    if (holdTimer !== null) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  const endGesture = () => {
    clearHold();
    scrolling = false;
    exploring = false;
  };

  hero.addEventListener('touchstart', (e) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    scrolling = false;
    exploring = false;
    interact(t.clientX, t.clientY);
    clearHold();
    holdTimer = window.setTimeout(() => {
      holdTimer = null;
      if (!scrolling) exploring = true;
    }, HOLD_MS);
  }, { passive: true, signal });

  hero.addEventListener('touchmove', (e) => {
    if (e.touches.length === 0 || scrolling) return;
    const t = e.touches[0];

    if (!exploring) {
      const dx = Math.abs(t.clientX - startX);
      const dy = Math.abs(t.clientY - startY);
      if (dy > SCROLL_THRESHOLD && dy > dx) {
        // A scroll, not a touch on the robot: give the copy straight back.
        scrolling = true;
        clearHold();
        release();
        return;
      }
      if (dx > SCROLL_THRESHOLD) {
        // Sideways intent. With pan-y on the canvas the browser has already
        // declined this gesture, so it is ours for the rest of the touch.
        exploring = true;
        clearHold();
      }
    }

    if (exploring && e.cancelable) e.preventDefault();
    interact(t.clientX, t.clientY);
  }, { passive: false, signal });

  // Lifting the finger is "the mouse went still", not "the mouse left":
  // interact() already armed the 800ms linger, so nothing to cut here.
  hero.addEventListener('touchend', endGesture, { passive: true, signal });

  // The browser took the gesture (it decided to scroll after all, or a
  // system gesture interrupted). Treat it as a scroll.
  hero.addEventListener('touchcancel', () => {
    if (!scrolling) release();
    endGesture();
  }, { passive: true, signal });
}
