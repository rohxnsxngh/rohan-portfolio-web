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

/**
 * Scrub-linked text reveal — splits text into words and reveals each
 * from low to full opacity as the user scrolls through the section.
 */
export function scrubTextReveal(
  selector: string,
  opts: { start?: string; end?: string } = {}
): void {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  if (prefersReducedMotion()) {
    elements.forEach((el) => { (el as HTMLElement).style.opacity = '1'; });
    return;
  }

  elements.forEach((el) => {
    const text = el.textContent || '';
    const words = text.split(/\s+/).filter(Boolean);
    el.innerHTML = words
      .map((word) => `<span class="scrub-word" style="display:inline-block;opacity:0.2">${word}</span>`)
      .join(' ');

    const wordSpans = el.querySelectorAll('.scrub-word');

    gsap.to(wordSpans, {
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: el,
        start: opts.start ?? 'top 80%',
        end: opts.end ?? 'bottom 40%',
        scrub: true,
      },
    });
  });
}

/**
 * Scale-based batch reveal with bounce easing — cards scale from 0.85 → 1.0.
 */
export function batchScaleReveal(
  selector: string,
  opts: AnimationOpts & { start?: string } = {}
): void {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  if (prefersReducedMotion()) {
    gsap.set(elements, { opacity: 1, scale: 1, y: 0 });
    return;
  }

  gsap.set(elements, { opacity: 0, scale: 0.85, y: 30 });

  ScrollTrigger.batch(elements, {
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: opts.duration ?? 0.8,
        stagger: opts.stagger ?? 0.1,
        ease: opts.ease ?? 'back.out(1.7)',
      });
    },
    start: opts.start ?? 'top 85%',
  });
}

/**
 * Multi-layer parallax — moves multiple elements at different scroll speeds.
 */
export function createMultiLayerParallax(
  layers: { selector: string; speed: number }[]
): ScrollTrigger[] {
  if (prefersReducedMotion()) return [];

  const triggers: ScrollTrigger[] = [];

  layers.forEach(({ selector, speed }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el.closest('section, .relative, div') || el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const yOffset = (self.progress - 0.5) * speed * window.innerHeight;
        gsap.set(el, { y: yOffset });
      },
    });

    triggers.push(trigger);
  });

  return triggers;
}

/**
 * Pinned section reveal — pins a section and reveals children sequentially
 * as user scrolls through.
 */
export function createPinnedReveal(
  pinSelector: string,
  contentSelector: string,
  opts: { scrubDuration?: number } = {}
): ScrollTrigger | null {
  const pin = document.querySelector(pinSelector);
  const items = document.querySelectorAll(contentSelector);
  if (!pin || !items.length) return null;

  if (prefersReducedMotion()) {
    gsap.set(items, { opacity: 1, y: 0 });
    return null;
  }

  gsap.set(items, { opacity: 0, y: 50 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: `+=${(opts.scrubDuration ?? items.length) * 100}%`,
      pin: true,
      scrub: 1,
    },
  });

  items.forEach((item, i) => {
    tl.to(item, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'expo.out',
    }, i * 0.5);
  });

  return tl.scrollTrigger || null;
}
