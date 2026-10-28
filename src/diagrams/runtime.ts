import type { DiagramKind, Frame, Theme } from './types';

// One lazily-imported chunk per kind. Vite turns each entry into its own file,
// fetched only when that figure comes within 300px of the viewport.
const modules = import.meta.glob<{ default: DiagramKind }>('./kinds/*.ts');

const RM = '(prefers-reduced-motion: reduce)';
const isReduced = () => matchMedia(RM).matches;

interface Inst {
  fig: HTMLElement;
  canvas: HTMLCanvasElement;
  f: Frame;
  kind?: DiagramKind;
  s?: unknown;
  loading: boolean;
  /** inside the viewport itself: the only state in which the clock runs */
  visible: boolean;
  paused: boolean;
  settled: boolean;
  last: number;
  ro?: ResizeObserver;
  ac: AbortController;
}

const live = new Set<Inst>();
// Two observers: `near` starts the chunk download a screen early so the first
// frame is ready on arrival, `seen` gates the clock on real visibility so a
// figure just below the fold is not animating for nobody.
let near: IntersectionObserver | null = null;
let seen: IntersectionObserver | null = null;
let raf = 0;
let repaintRaf = 0;

function readTheme(el: HTMLElement): Theme {
  const cs = getComputedStyle(el);
  const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d;
  return {
    fg: v('--dg-fg', '#fff'), dim: v('--dg-dim', 'rgba(255,255,255,.55)'),
    faint: v('--dg-faint', 'rgba(255,255,255,.16)'), grid: v('--dg-grid', 'rgba(255,255,255,.05)'),
    accent: v('--dg-accent', '#ff6600'), accent2: v('--dg-accent2', '#60a5fa'),
    ok: v('--dg-ok', '#4ade80'), bad: v('--dg-bad', '#f87171'),
    font: v('--dg-font', "'IBM Plex Mono', monospace"),
  };
}

function paint(i: Inst, dt = 0) {
  const { f, kind } = i;
  if (!kind || !f.w || !f.h) return;
  if (kind.scroll) {
    const r = i.fig.getBoundingClientRect(); // read-only: nothing on the page is written this frame
    f.progress = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
  }
  // A repaint (resize, pointer on a paused figure) redraws the same instant, so
  // kinds that integrate state over dt do not step twice.
  f.dt = dt;
  f.ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
  f.ctx.clearRect(0, 0, f.w, f.h);
  if (import.meta.env.DEV) {
    const t0 = performance.now();
    kind.draw(f, i.s);
    const st = ((window as any).__dgStats ??= {});
    (st[i.fig.dataset.diagram!] ??= []).push(performance.now() - t0);
  } else kind.draw(f, i.s);
}

function running(i: Inst) {
  return i.visible && !i.paused && !i.settled && !!i.kind && !i.f.reduced && !document.hidden;
}

function loop(now: number) {
  raf = 0;
  let any = false;
  for (const i of live) {
    if (!running(i)) continue;
    any = true;
    const gap = 1000 / (i.kind!.fps ?? 60) - 1;
    if (now - i.last < gap) continue;
    // Time-based, clamped: a 120Hz display does not run the story twice as
    // fast, and a backgrounded tab does not jump 40s on return.
    const dt = Math.min(0.1, (now - i.last) / 1000);
    i.last = now;
    i.f.t += dt;
    const settle = i.kind!.settleAfter;
    if (settle && i.f.t >= settle) { i.f.t = settle; i.settled = true; }
    paint(i, dt);
  }
  if (any) raf = requestAnimationFrame(loop);
}

function wake() {
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Repaint once outside the loop (resize, pointer on a settled/paused/reduced figure). */
function repaintSoon() {
  if (repaintRaf) return;
  repaintRaf = requestAnimationFrame(() => {
    repaintRaf = 0;
    for (const i of live) if (i.visible && !running(i)) paint(i);
  });
}

function resize(i: Inst, cssW: number, cssH: number, devW = 0, devH = 0) {
  if (!cssW || !cssH) return;
  const real = window.devicePixelRatio || 1;
  // device-pixel-content-box gives the exact backing size, so 1px lines stay
  // on whole pixels at fractional zoom. Phones at 3x are capped to 2x: a 2D
  // canvas at 3x costs 2.25x the fill for detail nobody can resolve.
  // The ratio check guards against emulators that scale the page but report
  // the device box in CSS pixels.
  const exact = devW > 0 && real <= 2 && Math.abs(devW / cssW - real) < 0.05;
  const dpr = exact ? devW / cssW : Math.min(real, 2);
  const W = exact ? devW : Math.round(cssW * dpr);
  const H = exact ? devH : Math.round(cssH * dpr);
  if (i.canvas.width !== W) i.canvas.width = W;
  if (i.canvas.height !== H) i.canvas.height = H;
  const f = i.f;
  f.w = cssW; f.h = cssH; f.dpr = W / cssW; f.compact = cssW < 520;
  if (i.kind) i.kind.resize?.(f, i.s);
  paint(i);
}

async function activate(i: Inst) {
  if (i.kind || i.loading) return;
  i.loading = true;
  const load = modules[`./kinds/${i.fig.dataset.diagram}.ts`];
  try {
    const [mod] = await Promise.all([
      load!(),
      // Canvas text drawn before the web font arrives is drawn in the fallback
      // and never re-flows, so wait (briefly) for Plex Mono.
      Promise.race([document.fonts?.load(`10px ${i.f.theme.font}`), new Promise((r) => setTimeout(r, 800))]).catch(() => {}),
    ]);
    if (!live.has(i)) return; // navigated away mid-import
    i.kind = mod.default;
    i.f.t = i.f.reduced ? (i.kind.staticT ?? 0) : 0;
    i.s = i.kind.setup(i.f);
    i.fig.dataset.ready = '';
    i.ro = new ResizeObserver(([e]) => {
      const b = e.contentBoxSize?.[0];
      const d = (e as any).devicePixelContentBoxSize?.[0];
      resize(i, b ? b.inlineSize : e.contentRect.width, b ? b.blockSize : e.contentRect.height, d?.inlineSize, d?.blockSize);
    });
    try { i.ro.observe(i.canvas, { box: 'device-pixel-content-box' } as ResizeObserverOptions); }
    catch { i.ro.observe(i.canvas); } // Safari: unsupported box value throws
    i.last = performance.now();
    wake();
  } catch (err) {
    console.warn('[diagram] failed to load', i.fig.dataset.diagram, err);
    i.fig.classList.add('dg-missing');
  } finally {
    i.loading = false;
  }
}

function ensureToggle(i: Inst) {
  // WCAG 2.2.2: anything that moves for more than 5s needs a pause control.
  let btn = i.fig.querySelector<HTMLButtonElement>('.dg-toggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'dg-toggle';
    i.canvas.parentElement!.appendChild(btn);
  }
  const sync = () => {
    btn!.setAttribute('aria-pressed', String(i.paused));
    btn!.setAttribute('aria-label', i.paused ? 'Play animation' : 'Pause animation');
    btn!.textContent = i.paused ? 'PLAY' : 'PAUSE';
  };
  sync();
  btn.addEventListener('click', () => {
    i.paused = !i.paused;
    i.settled = false;
    i.last = performance.now();
    sync();
    wake();
  }, { signal: i.ac.signal });
}

function bindPointer(i: Inst) {
  const p = i.f.pointer, c = i.canvas, signal = i.ac.signal;
  const move = (e: PointerEvent) => {
    p.x = e.offsetX; p.y = e.offsetY; p.active = true;
    if (!running(i)) repaintSoon();
  };
  c.addEventListener('pointermove', move, { signal, passive: true });
  c.addEventListener('pointerdown', (e) => { p.down = true; move(e); }, { signal, passive: true });
  c.addEventListener('pointerup', () => { p.down = false; }, { signal, passive: true });
  c.addEventListener('pointerleave', () => { p.active = p.down = false; if (!running(i)) repaintSoon(); }, { signal, passive: true });
  c.addEventListener('click', (e) => {
    if (!i.kind?.tap) return;
    p.x = e.offsetX; p.y = e.offsetY;
    i.kind.tap(i.f, i.s);
    if (!running(i)) repaintSoon();
  }, { signal });
}

function mount(fig: HTMLElement) {
  if ((fig as any).__dg) return;
  if (!modules[`./kinds/${fig.dataset.diagram}.ts`]) { fig.classList.add('dg-missing'); return; }
  const canvas = fig.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  let data: unknown = null;
  try { data = fig.dataset.diagramProps ? JSON.parse(fig.dataset.diagramProps) : null; } catch {}
  const i: Inst = {
    fig, canvas, loading: false, visible: false, paused: false, settled: false, last: 0, ac: new AbortController(),
    f: {
      ctx, w: 0, h: 0, dpr: 1, t: 0, dt: 0, progress: 0, data,
      theme: readTheme(fig), pointer: { x: 0, y: 0, active: false, down: false },
      compact: false, reduced: isReduced(),
    },
  };
  (fig as any).__dg = i;
  live.add(i);
  ensureToggle(i);
  bindPointer(i);
  near!.observe(fig);
  seen!.observe(fig);
}

const inst = (e: IntersectionObserverEntry) => (e.target as any).__dg as Inst | undefined;

export function initDiagrams(root: ParentNode = document) {
  const figs = root.querySelectorAll<HTMLElement>('figure[data-diagram]');
  if (!figs.length) return;
  near ??= new IntersectionObserver((entries) => {
    for (const e of entries) { const i = inst(e); if (i && e.isIntersecting) activate(i); }
  }, { rootMargin: '300px 0px' });
  seen ??= new IntersectionObserver((entries) => {
    for (const e of entries) {
      const i = inst(e);
      if (!i) continue;
      i.visible = e.isIntersecting;
      if (!i.visible || !i.kind) continue;
      i.last = performance.now();
      if (running(i)) wake(); else repaintSoon();
    }
  });
  figs.forEach(mount);
}

export function destroyDiagrams() {
  for (const i of live) {
    i.ac.abort();
    i.ro?.disconnect();
    try { i.kind?.destroy?.(i.s); } catch {}
    delete (i.fig as any).__dg;
  }
  live.clear();
  near?.disconnect(); near = null;
  seen?.disconnect(); seen = null;
  if (raf) cancelAnimationFrame(raf); raf = 0;
  if (repaintRaf) cancelAnimationFrame(repaintRaf); repaintRaf = 0;
}

export function onVisibility() {
  if (document.hidden) return;
  const now = performance.now();
  for (const i of live) i.last = now;
  wake();
}

export function onReducedChange() {
  const r = isReduced();
  for (const i of live) {
    i.f.reduced = r;
    if (r && i.kind) i.f.t = i.kind.staticT ?? i.f.t;
    i.settled = false; i.last = performance.now();
    paint(i);
  }
  wake();
}
