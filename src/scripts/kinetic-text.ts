import gsap from 'gsap';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * Kinetic typography: chars push away from cursor within radius, ease back outside.
 * Returns a cleanup function.
 *
 * Three things here are deliberate, each fixing a bug the first version had:
 *
 * Rest positions are cached, not re-measured. Reading getBoundingClientRect
 * every frame included the push already applied, so a char's measured centre
 * moved away from the cursor, the next frame pushed it less, and chars near
 * the edge of the radius oscillated. The cache is in page coordinates and is
 * taken from offsetLeft/offsetTop, which ignore transforms entirely, so it is
 * the char's layout slot whatever the intro, the scroll split or the push are
 * doing to it at the time. It is rebuilt only when the headline resizes.
 *
 * The push lives on its own transform channel. It drives xPercent/yPercent
 * through two gsap.quickTo setters per char, and the intro and the pages'
 * scroll splits drive x/y/scale. The old `gsap.to(..., { overwrite: true })`
 * killed every tween on the char, including the scrubbed scroll split on the
 * pages that split the .char spans themselves, so one pass of the mouse over
 * a hero broke the split for the rest of the visit.
 *
 * Nothing is tweened unless it changes. A setter only fires for a char whose
 * target moved, instead of up to ten fresh tweens per mousemove frame.
 */
export function initKineticText(selector: string): (() => void) | null {
  if (prefersReducedMotion() || isTouchDevice()) return null;

  const container = document.querySelector<HTMLElement>(selector);
  if (!container) return null;

  const chars = Array.from(container.querySelectorAll<HTMLElement>('.char'));
  if (!chars.length) return null;

  const RADIUS = 300;
  const RADIUS_SQ = RADIUS * RADIUS;
  const PUSH_STRENGTH = 25;

  // One setter pair per char. power3.out decelerates into the new position;
  // the return to rest uses the same curve (the old elastic spring read as
  // jitter on glyphs this large).
  const setters = chars.map((char) => ({
    x: gsap.quickTo(char, 'xPercent', { duration: 0.45, ease: 'power3.out' }),
    y: gsap.quickTo(char, 'yPercent', { duration: 0.45, ease: 'power3.out' }),
  }));

  // Rest centres (page px) and sizes, plus the last target sent to each char.
  const cx = new Float64Array(chars.length);
  const cy = new Float64Array(chars.length);
  const w = new Float64Array(chars.length);
  const h = new Float64Array(chars.length);
  const lastX = new Float64Array(chars.length);
  const lastY = new Float64Array(chars.length);
  let measured = false;

  // Layout position of `el` in page coordinates, transforms ignored.
  const layoutOffset = (el: HTMLElement) => {
    let left = 0;
    let top = 0;
    let node: HTMLElement | null = el;
    while (node) {
      left += node.offsetLeft;
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return { left, top };
  };

  const measure = () => {
    chars.forEach((char, i) => {
      const { left, top } = layoutOffset(char);
      w[i] = char.offsetWidth || 1;
      h[i] = char.offsetHeight || 1;
      cx[i] = left + w[i] / 2;
      cy[i] = top + h[i] / 2;
    });
    measured = true;
  };

  let rafId: number | null = null;
  // Last pointer position, in client px; NaN until the first move.
  let clientX = NaN;
  let clientY = NaN;

  const update = () => {
    rafId = null;
    if (!measured) measure();

    const mx = clientX + window.scrollX;
    const my = clientY + window.scrollY;

    for (let i = 0; i < chars.length; i++) {
      const dx = cx[i] - mx;
      const dy = cy[i] - my;
      const distSq = dx * dx + dy * dy;

      let tx = 0;
      let ty = 0;
      if (distSq < RADIUS_SQ) {
        const dist = Math.sqrt(distSq) || 1;
        const force = (1 - dist / RADIUS) * PUSH_STRENGTH;
        // px to percent of the char's own box, which is what xPercent means.
        tx = ((dx / dist) * force / w[i]) * 100;
        ty = ((dy / dist) * force / h[i]) * 100;
      }

      if (Math.abs(tx - lastX[i]) > 0.05 || Math.abs(ty - lastY[i]) > 0.05) {
        lastX[i] = tx;
        lastY[i] = ty;
        setters[i].x(tx);
        setters[i].y(ty);
      }
    }
  };

  const schedule = () => {
    if (rafId === null && !Number.isNaN(clientX)) rafId = requestAnimationFrame(update);
  };

  const onMouseMove = (e: MouseEvent) => {
    clientX = e.clientX;
    clientY = e.clientY;
    schedule();
  };

  // The page scrolling under a still pointer moves the chars relative to it.
  const onScroll = () => schedule();

  const release = () => {
    clientX = NaN;
    clientY = NaN;
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    for (let i = 0; i < chars.length; i++) {
      if (lastX[i] !== 0 || lastY[i] !== 0) {
        lastX[i] = 0;
        lastY[i] = 0;
        setters[i].x(0);
        setters[i].y(0);
      }
    }
  };

  // The headline sizes in vw, so any resize moves every rest centre.
  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { measured = false; })
      : null;
  resizeObserver?.observe(container);
  const onResize = () => { measured = false; };

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  // The pointer leaving the window leaves no mousemove behind to relax the
  // chars. Leaving the headline itself is not a release: the radius reaches
  // past its box, and the hero copy is pointer-events: none on some pages.
  document.documentElement.addEventListener('mouseleave', release);

  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    document.documentElement.removeEventListener('mouseleave', release);
    resizeObserver?.disconnect();
    if (rafId !== null) cancelAnimationFrame(rafId);
    setters.forEach((s) => {
      s.x.tween.kill();
      s.y.tween.kill();
    });
    gsap.set(chars, { xPercent: 0, yPercent: 0 });
  };
}
