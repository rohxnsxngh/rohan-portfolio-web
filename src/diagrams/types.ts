export interface Theme {
  fg: string; dim: string; faint: string; grid: string;
  accent: string; accent2: string; ok: string; bad: string; font: string;
}
export interface Pointer { x: number; y: number; active: boolean; down: boolean }
/** Everything a kind may read. Mutated in place by the runtime; never cache w/h outside resize(). */
export interface Frame {
  ctx: CanvasRenderingContext2D;
  w: number; h: number; dpr: number;
  /** seconds since activation (frozen at staticT under reduced motion) */
  t: number;
  /** seconds since the previous frame; 0 on a repaint that did not advance the clock */
  dt: number;
  /** 0 when the figure's top enters the viewport bottom, 1 when its bottom leaves the top. Only updated for kinds with scroll: true */
  progress: number;
  theme: Theme; pointer: Pointer;
  /** CSS width under 520px: the phone layout */
  compact: boolean; reduced: boolean;
  data: unknown;
}
export interface DiagramKind<S = any> {
  /** t used for the single reduced-motion frame: pick the most explanatory moment */
  staticT?: number;
  /** frame cap; 60 default, 30 for heavy kinds */
  fps?: number;
  scroll?: boolean;
  /** intro-only kinds: stop the loop after this many seconds; pointer input still repaints */
  settleAfter?: number;
  setup(f: Frame): S;
  resize?(f: Frame, s: S): void;
  draw(f: Frame, s: S): void;
  /** a click or tap on the canvas, at f.pointer */
  tap?(f: Frame, s: S): void;
  destroy?(s: S): void;
}
