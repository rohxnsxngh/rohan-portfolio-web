import gsap from 'gsap';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * Kinetic typography: chars push away from cursor within radius, spring back outside.
 * Returns a cleanup function.
 */
export function initKineticText(selector: string): (() => void) | null {
  if (prefersReducedMotion() || isTouchDevice()) return null;

  const container = document.querySelector(selector);
  if (!container) return null;

  const chars = container.querySelectorAll('.char') as NodeListOf<HTMLElement>;
  if (!chars.length) return null;

  const RADIUS = 300;
  const PUSH_STRENGTH = 25;

  // Store original positions
  const origins: { x: number; y: number }[] = [];
  chars.forEach((char) => {
    const rect = char.getBoundingClientRect();
    origins.push({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  });

  let rafId: number | null = null;
  let mouseX = -9999;
  let mouseY = -9999;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      chars.forEach((char, i) => {
        const rect = char.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const dx = charCenterX - mouseX;
        const dy = charCenterY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          const force = (1 - dist / RADIUS) * PUSH_STRENGTH;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force;
          const pushY = Math.sin(angle) * force;

          gsap.to(char, {
            x: pushX,
            y: pushY,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true,
          });
        } else {
          gsap.to(char, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
            overwrite: true,
          });
        }
      });

      rafId = null;
    });
  };

  const onMouseLeave = () => {
    chars.forEach((char) => {
      gsap.to(char, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        overwrite: true,
      });
    });
  };

  document.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseleave', onMouseLeave);

  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseleave', onMouseLeave);
    if (rafId) cancelAnimationFrame(rafId);
    chars.forEach((char) => {
      gsap.set(char, { x: 0, y: 0 });
    });
  };
}
