import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface AnimationOpts {
  delay?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
}

/**
 * Animate character reveal - replaces CSS charReveal keyframe.
 * Targets existing .char spans inside the container.
 */
export function animateCharReveal(
  selector: string | Element,
  opts: AnimationOpts = {}
): gsap.core.Tween | null {
  const container =
    typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!container) return null;

  const chars = container.querySelectorAll('.char');
  if (!chars.length) return null;

  if (prefersReducedMotion()) {
    gsap.set(chars, { opacity: 1, y: 0, scale: 1 });
    return null;
  }

  gsap.set(chars, { opacity: 0, y: 100, scale: 0.8 });

  return gsap.to(chars, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: opts.duration ?? 1,
    stagger: opts.stagger ?? 0.05,
    ease: opts.ease ?? 'expo.out',
    delay: opts.delay ?? 0,
  });
}

/**
 * Animate fade-in-up - replaces CSS fadeInUp keyframe.
 */
export function animateFadeInUp(
  selector: string | Element | Element[] | NodeListOf<Element>,
  opts: AnimationOpts = {}
): gsap.core.Tween | null {
  const elements =
    typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : selector instanceof Element
        ? [selector]
        : selector;

  if (!elements || (elements instanceof NodeList && !elements.length)) return null;

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return null;
  }

  gsap.set(elements, { opacity: 0, y: 30 });

  return gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration: opts.duration ?? 1,
    stagger: opts.stagger ?? 0,
    ease: opts.ease ?? 'expo.out',
    delay: opts.delay ?? 0,
  });
}

/**
 * Animate line expand - replaces CSS lineExpand keyframe.
 */
export function animateLineExpand(
  selector: string | Element,
  opts: AnimationOpts = {}
): void {
  const element =
    typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!element) return;

  if (prefersReducedMotion()) {
    gsap.set(element, { width: '200px' });
    return;
  }

  gsap.set(element, { width: 0 });

  gsap.to(element, {
    width: '200px',
    duration: opts.duration ?? 1.5,
    ease: opts.ease ?? 'expo.out',
    delay: opts.delay ?? 0,
  });
}

/**
 * Create hero parallax - replaces manual window.scroll listener with ScrollTrigger scrub.
 * Replicates: opacity = 1 - scrolled/(height*0.7), translateY = scrolled * 0.3
 */
export function createHeroParallax(
  selector: string | Element
): ScrollTrigger | null {
  const element =
    typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!element) return null;

  if (prefersReducedMotion()) return null;

  return ScrollTrigger.create({
    trigger: element.closest('.hero-section, section, .relative') || element,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const opacity = Math.max(0, 1 - progress / 0.7);
      const translateY = progress * window.innerHeight * 0.3;
      gsap.set(element, {
        opacity,
        y: translateY,
      });
    },
  });
}

/**
 * Generic scroll-triggered fade-in-up for below-fold content.
 */
export function scrollReveal(
  selector: string | Element | Element[] | NodeListOf<Element>,
  opts: AnimationOpts & { start?: string } = {}
): gsap.core.Tween[] {
  const elements =
    typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : selector instanceof Element
        ? [selector]
        : selector;

  if (!elements || (elements instanceof NodeList && !elements.length)) return [];

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return [];
  }

  const tweens: gsap.core.Tween[] = [];

  (elements as NodeListOf<Element>).forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 40 });

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: opts.duration ?? 0.8,
      ease: opts.ease ?? 'expo.out',
      delay: (opts.stagger ?? 0) * i,
      scrollTrigger: {
        trigger: el,
        start: opts.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    tweens.push(tween);
  });

  return tweens;
}

/**
 * ScrollTrigger.batch() for efficiently revealing card grids.
 */
export function batchScrollReveal(
  selector: string,
  opts: AnimationOpts & { start?: string } = {}
): void {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(elements, { opacity: 0, y: 40 });

  ScrollTrigger.batch(elements, {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: opts.duration ?? 0.8,
        stagger: opts.stagger ?? 0.1,
        ease: opts.ease ?? 'expo.out',
      });
    },
    start: opts.start ?? 'top 85%',
  });
}

/**
 * Returns a master timeline for orchestrating page load sequences.
 */
export function createPageIntroTimeline(): gsap.core.Timeline {
  return gsap.timeline();
}

/**
 * Kills all ScrollTrigger instances (needed for page cleanup during View Transitions).
 */
export function killAllScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}
