import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURATION, EASE, STAGGER, staggerFor } from './motion';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * True once the visitor has navigated client-side at least once.
 *
 * Set on `astro:after-swap` by the inline watchdog in Layout.astro, and read
 * off `window` rather than kept in module scope on purpose: this module is
 * bundled separately into every page chunk, so a freshly-executed copy would
 * start with a stale `false` and miss the navigation that just happened.
 *
 * Sticky by design — after the first client-side navigation every subsequent
 * page view in this document is also a client-side navigation.
 */
export function isSpaNavigation(): boolean {
  return typeof window !== 'undefined' &&
    document.documentElement.classList.contains('spa-nav');
}

/**
 * Adds the staggered hero character reveal to `tl`.
 *
 * On a client-side navigation the reveal is skipped and the characters are
 * simply pinned visible: the <h1> carries transition:name="page-title", so the
 * browser is already morphing it from the previous route's header. Running the
 * per-character intro on top of that morph animated the same text twice, which
 * is what made route changes look like they stuttered.
 */
export function addHeroCharIntro(
  tl: gsap.core.Timeline,
  chars: NodeListOf<Element> | Element[],
  position: number = 0
): void {
  const list = Array.from(chars);
  if (!list.length) return;

  if (prefersReducedMotion() || isSpaNavigation()) {
    gsap.set(list, { opacity: 1, y: 0, scale: 1 });
    return;
  }

  gsap.set(list, { opacity: 0, y: 100, scale: 0.8 });
  tl.to(list, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: DURATION.hero,
    // A blog title can be 40+ characters. A flat per-character delay would run
    // the cascade well past the point the reader has started reading.
    stagger: staggerFor(list.length, STAGGER.micro),
    ease: EASE.hero,
  }, position);
}

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
      duration: opts.duration ?? DURATION.card,
      ease: opts.ease ?? EASE.enter,
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
        duration: opts.duration ?? DURATION.card,
        stagger: opts.stagger ?? staggerFor(batch.length, STAGGER.standard),
        ease: opts.ease ?? EASE.enter,
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
 * Recomputes every ScrollTrigger's start/end against the current layout.
 *
 * ScrollTrigger measures trigger positions once, when the trigger is created.
 * During a View Transition navigation the triggers for the new page are built
 * on `astro:page-load`, before web fonts, images and the WebGL canvases have
 * settled — so the document grows underneath them and the cached offsets end
 * up pointing at the wrong scroll positions. Elements whose start ends up
 * below their real position never enter, and since `scrollReveal` has already
 * set them to `opacity: 0`, they stay invisible for the whole page view.
 *
 * ScrollTrigger only auto-refreshes on `resize` and on the window `load`
 * event, and `load` does not fire again for client-side navigations, so this
 * has to be driven manually.
 */
export function refreshScrollTriggers(): void {
  // refresh() recalculates each trigger's start/end against the current layout;
  // update() re-applies scrub progress for the current scroll position.
  //
  // Both are needed on a history navigation. Astro restores the previous scroll
  // position programmatically, which fires no scroll event, so a scrubbed
  // timeline keeps whatever progress it last computed. That is what stranded
  // the hero: going back to a page you had scrolled down restored the scroll,
  // left the scrub at full progress, and the header stayed translated off
  // screen even after you scrolled back to the top.
  const sync = () => {
    ScrollTrigger.refresh();
    ScrollTrigger.update();
  };

  // Immediately, for whatever is already laid out.
  sync();

  // Then again once late-arriving layout (fonts, images, canvases) settles.
  requestAnimationFrame(sync);

  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.ready.then(sync).catch(() => {});
  }

  const images = Array.from(document.images).filter((img) => !img.complete);
  if (images.length) {
    let pending = images.length;
    const done = () => {
      if (--pending === 0) sync();
    };
    images.forEach((img) => {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  // Final catch-all for anything that resizes later still (3D model loads).
  setTimeout(sync, 1200);
}

/**
 * Reveals anything a scroll trigger left behind.
 *
 * `scrollReveal`/`batchScrollReveal` set `opacity: 0` up front and hand the
 * reveal to ScrollTrigger. If a trigger is mis-measured or was killed mid-flight
 * by a fast navigation, the element is stranded invisible even though it sits in
 * the viewport. This sweeps for that state and fades the stragglers in, so a
 * missed trigger costs the animation rather than the content.
 */
export function revealStragglers(): void {
  const candidates = document.querySelectorAll<HTMLElement>(
    '.section-title, .footer-reveal, .research-card, .project-card, .blog-card, ' +
    '.experience-card, .journey-card-wrapper, .artwork-card, .story-block, ' +
    '.profile-section, .intro-section, .videos-section, .gallery-section, ' +
    '.coming-soon-section, .contact-form, .slide-up'
  );

  candidates.forEach((el) => {
    if (parseFloat(getComputedStyle(el).opacity) >= 0.05) return;

    // Only rescue what the reader can actually see; below-the-fold elements
    // are supposed to still be waiting.
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (r.width === 0 && r.height === 0) return;

    gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: DURATION.card, ease: EASE.enter });
  });
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
        duration: opts.duration ?? DURATION.card,
        stagger: opts.stagger ?? staggerFor(batch.length, STAGGER.standard),
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
      duration: DURATION.page,
      ease: EASE.enter,
    }, i * 0.5);
  });

  return tl.scrollTrigger || null;
}
