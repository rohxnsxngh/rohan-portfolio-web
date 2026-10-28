import type { DiagramKind, Frame } from '../types';
import { TAU, easeInOut, label, line, rng, stepper, story } from '../draw';

type V = [number, number, number];
const STEPS = ['SCAN', 'SAMPLE', 'GROUP', 'POOL', 'LEVEL 2', 'CLASSIFY'];
const DUR = [2.2, 2.4, 2.4, 1.6, 3, 2.4];

interface Level { idx: number[]; group: number[]; r: number }
interface Cloud { pts: V[]; l1: Level; l2: Level; name: string; human: boolean }

/** Farthest point sampling, then ball query: every point joins its nearest centroid within r. */
function abstract(pts: V[], k: number, r: number): Level {
  const n = pts.length, d = new Float64Array(n).fill(Infinity), idx = [0];
  const d2 = (a: V, b: V) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  while (idx.length < k) {
    const last = pts[idx[idx.length - 1]];
    let best = 0;
    for (let i = 0; i < n; i++) { d[i] = Math.min(d[i], d2(pts[i], last)); if (d[i] > d[best]) best = i; }
    idx.push(best);
  }
  const group = pts.map((p) => {
    let g = -1, bd = r * r;
    idx.forEach((c, j) => { const dd = d2(p, pts[c]); if (dd <= bd) { bd = dd; g = j; } });
    return g;
  });
  return { idx, group, r };
}

/** Points on a capsule surface from a to b, with the outward normal for back-face culling. */
function capsule(out: [V, V][], r: () => number, a: V, b: V, rad: number, n: number) {
  const ax: V = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...ax);
  const u: V = Math.abs(ax[1]) > 0.9 * len ? [1, 0, 0] : [0, 1, 0];
  const w: V = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]];
  const wl = Math.hypot(...w), e1 = w.map((v) => v / wl) as V;
  const e2: V = [(ax[1] * e1[2] - ax[2] * e1[1]) / len, (ax[2] * e1[0] - ax[0] * e1[2]) / len, (ax[0] * e1[1] - ax[1] * e1[0]) / len];
  for (let i = 0; i < n; i++) {
    const t = r(), q = r() * TAU, nn = e1.map((v, k) => Math.cos(q) * v + Math.sin(q) * e2[k]) as V;
    out.push([a.map((v, k) => v + ax[k] * t + nn[k] * rad) as V, nn]);
  }
}

/** Keep what a LiDAR 6 m away would see, snapped to its 128 beam rings (~3.7 cm apart there). */
function scan(raw: [V, V][]): V[] {
  const pts = raw.filter(([p, n]) => n[2] * (6 - p[2]) - n[0] * p[0] > 0).map(([p]) => [p[0], Math.round(p[1] / 0.037) * 0.037, p[2]] as V);
  let lo = Infinity, hi = -Infinity;
  for (const p of pts) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
  const my = (lo + hi) / 2;
  return pts.map(([x, y, z]) => [x, y - my, z] as V).sort((a, b) => b[1] - a[1]);
}

function cloud(human: boolean, compact: boolean): Cloud {
  const r = rng(human ? 7 : 3), raw: [V, V][] = [], k = compact ? 0.6 : 1;
  if (human) { // a person mid-stride
    capsule(raw, r, [0.1, 0.9, 0], [0.13, 0.05, 0.2], 0.075, 260 * k);
    capsule(raw, r, [-0.1, 0.9, 0], [-0.12, 0.05, -0.18], 0.075, 260 * k);
    capsule(raw, r, [0, 0.92, 0], [0, 1.46, 0], 0.17, 520 * k);
    capsule(raw, r, [0.24, 1.42, 0], [0.28, 0.9, -0.14], 0.05, 160 * k);
    capsule(raw, r, [-0.24, 1.42, 0], [-0.28, 0.9, 0.14], 0.05, 160 * k);
    capsule(raw, r, [0, 1.62, 0], [0, 1.72, 0], 0.11, 200 * k);
  } else { // vegetation flagged as dynamic by its moving leaves
    for (let i = 0; i < 9; i++) capsule(raw, r, [r() * 0.8 - 0.4, 0.5 + r() * 0.5, r() * 0.6 - 0.3], [r() * 0.8 - 0.4, 0.4 + r() * 0.6, r() * 0.6 - 0.3], 0.14 + r() * 0.1, 170 * k);
    capsule(raw, r, [0, 0, 0], [0.02, 0.5, 0], 0.04, 60 * k);
  }
  const pts = scan(raw), l1 = abstract(pts, compact ? 40 : 64, 0.13);
  const c1 = l1.idx.map((i) => pts[i]), l2 = abstract(c1, 16, 0.42);
  return { pts, l1, l2, name: human ? 'HUMAN' : 'FALSE POSITIVE', human };
}

interface S { clouds: Cloud[]; compact: boolean }

const kind: DiagramKind<S> = {
  staticT: 9.2,
  fps: 60,
  setup: (f) => ({ clouds: [cloud(true, f.compact), cloud(false, f.compact)], compact: f.compact }),
  resize(f, s) { if (f.compact !== s.compact) Object.assign(s, kind.setup(f)); },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const st = story(f.t, DUR), i = st.i, p = st.p, e = easeInOut(p);
    const c = s.clouds[st.loop % 2], { pts, l1, l2 } = c;
    stepper(f, STEPS, i, p);
    // Turntable projection: rotate about the vertical axis, mild perspective.
    const cw = compact ? w : w * 0.58, ch = compact ? h * 0.58 : h;
    const sc = Math.min(cw * 0.45, (ch - (compact ? 110 : 90)) / 2), cx = cw / 2, cy = 46 + (ch - (compact ? 110 : 90)) / 2;
    const th = 0.35 * f.t - 0.6, cs = Math.cos(th), sn = Math.sin(th);
    const proj = ([x, y, z]: V): [number, number, number] => {
      const zz = x * sn + z * cs, k = 3.5 / (3.5 + zz);
      return [cx + (x * cs - z * sn) * k * sc, cy - y * k * sc, k];
    };
    const P = pts.map(proj), C1 = l1.idx.map((j) => P[j]), C2 = l2.idx.map((j) => C1[j]);
    const n1 = l1.idx.length;
    // Level 1 positions: raw points, pulled into their centroids while pooling.
    const pull = i === 3 ? e : i > 3 ? 1 : 0;
    const shown = i === 0 ? Math.floor(p * pts.length) : pts.length;
    if (i < 4) {
      for (let k = 0; k < shown; k++) {
        const g = l1.group[k], q = P[k];
        if (g < 0 && pull) continue;
        const t = g >= 0 ? C1[g] : q, x = q[0] + (t[0] - q[0]) * pull, y = q[1] + (t[1] - q[1]) * pull;
        const lit = i === 2 && g >= 0 && g < p * n1 * 1.2;
        ctx.fillStyle = lit ? (g % 2 ? theme.accent2 : 'rgba(96,165,250,.55)') : `rgba(255,255,255,${(0.25 + 0.5 * (q[2] - 0.8)).toFixed(2)})`;
        ctx.fillRect(x - 1, y - 1, 2, 2);
      }
    }
    // Farthest point sampling picks centroids one at a time, each as far as possible from those before it.
    if (i >= 1 && i < 4) {
      const k1 = i === 1 ? Math.max(1, Math.ceil(p * n1)) : n1;
      for (let k = 0; k < k1; k++) { ctx.fillStyle = theme.accent; ctx.fillRect(C1[k][0] - 1.75, C1[k][1] - 1.75, 3.5, 3.5); }
      if (i === 1 && k1 > 1) line(f, C1[k1 - 2][0], C1[k1 - 2][1], C1[k1 - 1][0], C1[k1 - 1][1], 'rgba(255,102,0,.5)');
      if (i === 2) { // ball query: a fixed radius around each centroid
        ctx.strokeStyle = 'rgba(96,165,250,.35)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let k = 0; k < Math.min(n1, p * n1 * 1.2); k++) { const q = C1[k]; ctx.moveTo(q[0] + l1.r * sc * q[2], q[1]); ctx.arc(q[0], q[1], l1.r * sc * q[2], 0, TAU); }
        ctx.stroke();
      }
    }
    if (i >= 4) { // second set abstraction on the 64 pooled points, then the classifier
      const merge = i === 4 ? easeInOut(Math.max(0, (p - 0.55) / 0.45)) : 1;
      for (let k = 0; k < n1; k++) {
        const g = l2.group[k], q = C1[k], t = g >= 0 ? C2[g] : q;
        if (i === 5 && g < 0) continue;
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.fillRect(q[0] + (t[0] - q[0]) * merge - 1.5, q[1] + (t[1] - q[1]) * merge - 1.5, 3, 3);
      }
      if (i === 4 && p < 0.6) {
        ctx.strokeStyle = 'rgba(96,165,250,.35)'; ctx.beginPath();
        for (const q of C2) { ctx.moveTo(q[0] + l2.r * sc * q[2], q[1]); ctx.arc(q[0], q[1], l2.r * sc * q[2], 0, TAU); }
        ctx.stroke();
      }
      for (const q of C2) { ctx.fillStyle = theme.accent; ctx.fillRect(q[0] - 2.5, q[1] - 2.5, 5, 5); }
    }
    const counts = [pts.length, pts.length, pts.length, n1, 16, 16];
    label(f, `${counts[i]} POINTS`, 14, 38, { color: theme.fg });
    if (i === 5) {
      label(f, c.name, cx, ch - 22, { align: 'center', size: 13, color: c.human ? theme.accent : theme.bad });
      label(f, c.human ? 'PASSED DOWNSTREAM' : 'DROPPED BEFORE DOWNSTREAM', cx, ch - 8, { align: 'center' });
    }

    // Pipeline and the compression that made it fit.
    const px = compact ? 14 : w * 0.6, py = compact ? ch + 22 : h * 0.22;
    const stages = ['OUSTER OS1-128, 10 HZ', 'DYNABLOX DYNAMIC CLUSTER', 'TINYPOINTNEXT', 'HUMAN  OR  FALSE POSITIVE'];
    const act = i === 0 ? 0 : i < 5 ? 2 : 3;
    stages.forEach((sg, k) => {
      const y = py + k * (compact ? 16 : 26);
      label(f, `${k ? '→ ' : ''}${sg}`, px, y, { color: k === act || (k === 1 && i === 0) ? theme.fg : theme.faint });
    });
    const by = py + (compact ? 80 : 140), bw = (compact ? w - 28 : w * 0.36);
    label(f, 'PARAMETERS', px, by, { color: theme.fg });
    const bars: [string, number, string][] = [['POINTNEXT-S  6 SA', 1.36, theme.dim], ['4 SA BLOCKS', 0.26, theme.accent]];
    bars.forEach(([n, v, col], k) => {
      const y = by + 14 + k * 30;
      ctx.fillStyle = col; ctx.fillRect(px, y, (bw * v) / 1.36, 4);
      label(f, `${n}  ${v.toFixed(2)}M${k ? '  (-81%)' : ''}`, px, y + 18, { color: col });
    });
  },
};
export default kind;
