import type { Frame } from './types';

export type P = [number, number];
export const TAU = Math.PI * 2;
export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** progress 0..1 of a segment [start, start+dur) on a looping clock */
export const seg = (t: number, start: number, dur: number) => clamp((t - start) / dur);

/** Which step of a looping storyboard we are in and how far through it. */
export function story(t: number, durations: number[]): { i: number; p: number; loop: number } {
  const total = durations.reduce((a, b) => a + b, 0);
  let x = t % total; const loop = Math.floor(t / total);
  for (let i = 0; i < durations.length; i++) {
    if (x < durations[i]) return { i, p: x / durations[i], loop };
    x -= durations[i];
  }
  return { i: durations.length - 1, p: 1, loop };
}

/** Deterministic PRNG (LCG) so every visitor sees the same "random" data. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

/** Snap a coordinate so a `lw`-px CSS line lands on whole device pixels. */
export function crisp(v: number, dpr: number, lw = 1) {
  const px = Math.round(v * dpr);
  return (Math.round(lw * dpr) % 2 ? px + 0.5 : px) / dpr;
}

export function line(f: Frame, x1: number, y1: number, x2: number, y2: number, color: string, lw = 1) {
  const { ctx, dpr } = f;
  if (x1 === x2) x1 = x2 = crisp(x1, dpr, lw);
  if (y1 === y2) y1 = y2 = crisp(y1, dpr, lw);
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

export function arrow(f: Frame, x1: number, y1: number, x2: number, y2: number, color: string, head = 5, lw = 1) {
  line(f, x1, y1, x2, y2, color, lw);
  const a = Math.atan2(y2 - y1, x2 - x1), { ctx } = f;
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(a - 0.45), y2 - head * Math.sin(a - 0.45));
  ctx.lineTo(x2 - head * Math.cos(a + 0.45), y2 - head * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill();
}

export function label(
  f: Frame, s: string, x: number, y: number,
  o: { size?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline } = {},
) {
  const { ctx, theme } = f;
  ctx.font = `${o.size ?? 10}px ${theme.font}`;
  ctx.fillStyle = o.color ?? theme.dim; ctx.textAlign = o.align ?? 'left'; ctx.textBaseline = o.base ?? 'alphabetic';
  ctx.fillText(s, x, y);
}

/** Axis-aligned hairline rectangle on whole device pixels. */
export function box(f: Frame, x: number, y: number, w: number, h: number, color: string) {
  const { ctx, dpr } = f, x0 = crisp(x, dpr), y0 = crisp(y, dpr);
  ctx.strokeStyle = color; ctx.lineWidth = 1;
  ctx.strokeRect(x0, y0, crisp(x + w, dpr) - x0, crisp(y + h, dpr) - y0);
}

export function path(ctx: CanvasRenderingContext2D, pts: P[], close = false) {
  ctx.beginPath();
  pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  if (close) ctx.closePath();
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

/**
 * The storyboard's chapter strip, top left: every step name with the current
 * one lit and underlined by its progress. Phones get "02/05 NAME" instead.
 */
export function stepper(f: Frame, names: string[], i: number, p: number, x = 14, y = 20) {
  const { ctx, theme } = f;
  if (f.compact) {
    const s = `${String(i + 1).padStart(2, '0')}/${String(names.length).padStart(2, '0')} ${names[i]}`;
    label(f, s, x, y, { color: theme.fg });
    ctx.fillStyle = theme.accent; ctx.fillRect(x, y + 5, ctx.measureText(s).width * p, 1);
    return;
  }
  ctx.font = `10px ${theme.font}`;
  let cx = x;
  names.forEach((n, k) => {
    const s = `${k + 1} ${n}`, tw = ctx.measureText(s).width;
    label(f, s, cx, y, { color: k === i ? theme.fg : k < i ? theme.dim : theme.faint });
    if (k === i) { ctx.fillStyle = theme.accent; ctx.fillRect(cx, y + 5, tw * p, 1); }
    cx += tw + 18;
  });
}
