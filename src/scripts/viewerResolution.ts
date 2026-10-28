/**
 * Resolution budget for the four robot heroes: how many device pixels the
 * scene renders at, how much MSAA its render target gets, and when to give
 * some of that back because the device cannot keep up.
 *
 * The heroes draw into an EffectComposer target and then run a Sobel pass to
 * the canvas. Canvas antialiasing only ever smoothed that full-screen Sobel
 * quad, which has no edges, so the robot itself had none, and the edge filter
 * then amplified the staircases 2.5x. MSAA belongs on the composer's target.
 *
 * Phones start at pixel ratio 2 (the 3x poster they replace is 1 texel per
 * device pixel; the old 1.5 cap halved that once the live scene faded in) and
 * a frame-time watchdog steps down if the scene runs slow. It never steps
 * back up, so it cannot oscillate, and on touch it never goes below 1.5,
 * which is where phones sat before this budget existed.
 *
 * No three.js import here beyond types: this module is on the viewers'
 * static path and three must stay behind the dynamic import in heavy3d.ts.
 */
import type { WebGLRenderer, Vector2 } from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

/** Pixel ratio steps, best first. The last entry is the floor. */
const TOUCH_STEPS = [2, 1.75, 1.5];
const DESKTOP_STEPS = [2, 1.5, 1.25];

/** Frames skipped after start, resume or a step (shader warm-up, re-allocation). */
const SETTLE_FRAMES = 30;
/** Frames averaged per decision. */
const WINDOW_FRAMES = 60;
/** Slower than ~45 fps on average counts as falling behind. */
const SLOW_MS = 22;
/** A delta this long is a hitch (tab switch, GC, scroll jank), not a frame rate. */
const HITCH_MS = 250;

/**
 * iOS Low Power Mode (and Chrome's energy saver) cap requestAnimationFrame at
 * 30 fps, so every frame lands near 33.3 ms however little work the scene
 * does. That reads as "slow" to a plain average and would walk the scene down
 * to its floor on every phone in Low Power Mode. A window where nearly every
 * frame sits in this band is the cap, not the GPU, and is ignored. A device
 * that is genuinely GPU-bound misses vsync unevenly and spreads its frames
 * across 16.7 and 33.3 ms (or worse), so it still trips the watchdog.
 */
const CAP_BAND_MS: [number, number] = [30, 37];
const CAP_SHARE = 0.9;

/**
 * Samples for the composer's render target, budgeted by device pixels:
 * 4x below ~4 MP (every phone, a 1x desktop), 2x up to ~8 MP (a 1512x982
 * hero at 2x is 5.9 MP), off above that, which keeps the old rule of no AA on
 * very large screens. WebGL1 ignores the setting and renders without MSAA.
 */
export function msaaSamples(cssWidth: number, cssHeight: number, pixelRatio: number): number {
  const devicePx = cssWidth * cssHeight * pixelRatio * pixelRatio;
  return devicePx > 8e6 ? 0 : devicePx > 4e6 ? 2 : 4;
}

/**
 * Bring an existing composer to a new pixel ratio and sample count. The
 * composer reads the pixel ratio once in its constructor, so renderer.setPixelRatio
 * alone leaves its targets at the old resolution. A changed sample count only
 * takes effect once the target is reallocated, hence the dispose (three
 * rebuilds it lazily on the next render).
 */
export function syncComposer(
  composer: EffectComposer,
  cssWidth: number,
  cssHeight: number,
  pixelRatio: number
) {
  const samples = msaaSamples(cssWidth, cssHeight, pixelRatio);
  for (const target of [composer.renderTarget1, composer.renderTarget2]) {
    if (target.samples !== samples) {
      target.samples = samples;
      target.dispose();
    }
  }
  composer.setPixelRatio(pixelRatio); // calls setSize internally
  composer.setSize(cssWidth, cssHeight);
}

/**
 * Point the Sobel resolution uniform at the real drawing buffer. three floors
 * width x ratio when it sizes the canvas, so `width * pixelRatio` can sit a
 * fraction of a texel off and the kernel then samples between texels.
 */
export function syncSobelResolution(renderer: WebGLRenderer, resolution: Vector2) {
  renderer.getDrawingBufferSize(resolution);
}

export interface ResolutionBudget {
  /** The pixel ratio to render at now: the current step, capped by the screen. */
  readonly pixelRatio: number;
  /** Feed every live frame's delta, in seconds. */
  tick(delta: number): void;
  /** Call when the loop resumes after a pause, so the warm-up is skipped again. */
  resume(): void;
}

/**
 * One budget per scene. `onStep` runs after a step down and should re-run the
 * viewer's resize path so the renderer, composer and uniform pick it up.
 */
export function createResolutionBudget(touch: boolean, onStep: () => void): ResolutionBudget {
  const steps = touch ? TOUCH_STEPS : DESKTOP_STEPS;
  let step = 0;
  let settle = 0;
  let frames = 0;
  let total = 0;
  let capped = 0;

  const resetWindow = () => { frames = 0; total = 0; capped = 0; };

  return {
    get pixelRatio() {
      return Math.min(window.devicePixelRatio || 1, steps[step]);
    },
    tick(delta) {
      if (step >= steps.length - 1) return;
      // Already at or below the floor (a 1x screen): nothing to give back.
      if ((window.devicePixelRatio || 1) <= steps[steps.length - 1]) return;
      if (settle < SETTLE_FRAMES) { settle++; return; }
      const ms = delta * 1000;
      if (ms > HITCH_MS) { resetWindow(); return; }
      total += ms;
      frames++;
      if (ms >= CAP_BAND_MS[0] && ms <= CAP_BAND_MS[1]) capped++;
      if (frames < WINDOW_FRAMES) return;
      const avg = total / frames;
      const isCap = capped / frames >= CAP_SHARE;
      resetWindow();
      if (avg > SLOW_MS && !isCap) {
        step++;
        settle = 0;
        onStep();
      }
    },
    resume() {
      settle = 0;
      resetWindow();
    },
  };
}

/**
 * Call `onChange` whenever devicePixelRatio changes: browser zoom, or the
 * window moving between a 1x and a 2x monitor. Zoom also fires `resize`, but a
 * monitor move at the same CSS size does not. The query matches only the
 * current ratio, so it is re-armed after every change.
 */
export function watchDevicePixelRatio(onChange: () => void, signal: AbortSignal) {
  const arm = () => {
    if (signal.aborted || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mq.addEventListener('change', () => { onChange(); arm(); }, { once: true, signal });
  };
  arm();
}
