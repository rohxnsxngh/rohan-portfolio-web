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
 */
export function initMagneticButtons(): (() => void) | null {
  if (prefersReducedMotion() || !hasHover()) return null;

  const elements = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  if (!elements.length) return null;

  const STRENGTH = 0.3;
  const cleanups: (() => void)[] = [];

  elements.forEach((el) => {
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * STRENGTH;
      const deltaY = (e.clientY - centerY) * STRENGTH;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
        overwrite: true,
      });
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    cleanups.push(() => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      gsap.set(el, { x: 0, y: 0 });
    });
  });

  return () => {
    cleanups.forEach((fn) => fn());
  };
}
