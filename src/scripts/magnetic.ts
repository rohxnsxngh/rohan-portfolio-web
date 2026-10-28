import gsap from 'gsap';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const hasHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover)').matches;

/**
 * Makes elements with [data-magnetic] attract toward cursor on hover.
 * Returns a cleanup function.
 *
 * The element's centre is measured once per hover, on mouseenter, before the
 * pull has moved it. Measuring on every mousemove read back the transform it
 * had just applied, so the centre chased the cursor and the pull fed back on
 * itself. Movement goes through two gsap.quickTo setters, which retarget one
 * tween per axis instead of creating (and overwrite-killing) a new tween on
 * every event.
 */
export function initMagneticButtons(): (() => void) | null {
  if (prefersReducedMotion() || !hasHover()) return null;

  const elements = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  if (!elements.length) return null;

  const STRENGTH = 0.3;
  const cleanups: (() => void)[] = [];

  elements.forEach((el) => {
    // power3.out both ways: the release used to be elastic.out, which
    // overshot past rest on a nav link a few pixels wide.
    const toX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const toY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

    let centerX = 0;
    let centerY = 0;
    let measured = false;

    const onMouseEnter = () => {
      const rect = el.getBoundingClientRect();
      // Subtract whatever offset is still easing out from the last hover, so
      // the centre is the element's rest position.
      centerX = rect.left + rect.width / 2 - (gsap.getProperty(el, 'x') as number);
      centerY = rect.top + rect.height / 2 - (gsap.getProperty(el, 'y') as number);
      measured = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      // A pointer already resting on the element at load gets no mouseenter.
      if (!measured) onMouseEnter();
      toX((e.clientX - centerX) * STRENGTH);
      toY((e.clientY - centerY) * STRENGTH);
    };

    const onMouseLeave = () => {
      measured = false;
      toX(0);
      toY(0);
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave);

    cleanups.push(() => {
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      toX.tween.kill();
      toY.tween.kill();
      gsap.set(el, { x: 0, y: 0 });
    });
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
