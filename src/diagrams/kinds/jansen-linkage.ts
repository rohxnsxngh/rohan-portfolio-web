import type { DiagramKind, Frame } from '../types';
import { TAU, dot, label, line, type P } from '../draw';

// Theo Jansen's "holy numbers". Verified numerically: with these branch
// choices every bar length holds to 1e-14 and the foot spends ~43% of the
// crank cycle within 1 unit of its lowest point (the flat stride).
const L = { a: 38, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49, j: 50, k: 61.9, l: 7.8, m: 15 };
const B: P = [-L.a, -L.l];

/** Circle-circle intersection; side = +1 takes the point left of p0->p1. */
function cc(p0: P, r0: number, p1: P, r1: number, side: number): P {
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy);
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const mx = p0[0] + (a * dx) / d, my = p0[1] + (a * dy) / d;
  return [mx - (side * h * dy) / d, my + (side * h * dx) / d];
}

/** Every joint of one leg for crank angle theta. The foot H closes circle(G, h) with circle(E, i). */
function leg(theta: number): P[] {
  const C: P = [L.m * Math.cos(theta), L.m * Math.sin(theta)];
  const D = cc(C, L.j, B, L.b, -1); // upper joint
  const E = cc(C, L.k, B, L.c, +1); // lower joint
  const F = cc(B, L.d, D, L.e, +1); // rigid triangle B-D-F
  const G = cc(F, L.f, E, L.g, -1);
  return [C, D, E, F, G, cc(G, L.h, E, L.i, -1)]; // foot: rigid triangle E-G-H
}
// The mirrored leg shares the crank pin: reflect x and run the crank from pi - theta.
const mirror = (theta: number) => leg(Math.PI - theta).map(([x, y]) => [-x, y] as P);
// Bars as joint-index pairs; -1 is the crank axle, -2 the fixed pivot B.
const BARS = [[-1, 0], [0, 1], [0, 2], [-2, 1], [-2, 2], [-2, 3], [1, 3], [3, 4], [2, 4], [4, 5], [2, 5]];

interface S { path: P[]; contact: boolean[]; yMin: number; stride: number; dir: number }

const kind: DiagramKind<S> = {
  staticT: 2.2,
  setup() {
    const path: P[] = [];
    for (let k = 0; k < 360; k++) path.push(leg((k / 360) * TAU)[5]);
    const yMin = Math.min(...path.map((p) => p[1]));
    const contact = path.map((p) => p[1] < yMin + 1);
    const xs = path.filter((_, k) => contact[k]).map((p) => p[0]);
    // Direction the planted foot slides relative to the body = direction the ground scrolls.
    const k0 = contact.findIndex((c, k) => c && contact[(k + 1) % 360]);
    const dir = Math.sign(path[(k0 + 1) % 360][0] - path[k0][0]) || -1;
    return { path, contact, yMin, stride: Math.max(...xs) - Math.min(...xs), dir };
  },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, pointer, compact } = f;
    // Pointer x scrubs the crank on desktop; otherwise one turn every 3.3s.
    const theta = pointer.active && !compact ? (pointer.x / w) * TAU * 2 : f.t * Math.PI * 0.6;
    // One leg spans x -80..15 and y -92..35 in link units; the pair is mirrored about x = 0.
    const span = compact ? 100 : 180;
    const scale = Math.min((w - 24) / span, (h - 70) / 130);
    const ox = compact ? w / 2 + 32 * scale : w / 2 + (w > 900 ? 70 : 0), oy = 34 + 36 * scale;
    const X = (p: P) => ox + p[0] * scale, Y = (p: P) => oy - p[1] * scale; // math y-up -> screen y-down
    const gy = oy - s.yMin * scale + 3;
    line(f, 0, gy, w, gy, theme.faint);
    // The ground scrolls one stride per crank turn, so the planted foot reads as still.
    const travel = ((((s.dir * theta) / TAU) * s.stride * scale) % 24 + 24) % 24;
    ctx.fillStyle = theme.faint;
    for (let x = travel - 24; x < w; x += 24) ctx.fillRect(x, gy + 5, 9, 1);
    // Crank circle.
    ctx.strokeStyle = theme.faint; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.arc(ox, oy, L.m * scale, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    const sides = compact ? [1] : [1, -1];
    for (const sx of sides) {
      // Foot path, the flat stance stretch in accent.
      for (let k = 0; k < 360; k += 2) {
        const p = s.path[k];
        ctx.fillStyle = s.contact[k] ? theme.accent : theme.faint;
        ctx.fillRect(ox + sx * p[0] * scale - 0.75, Y(p) - 0.75, 1.5, 1.5);
      }
      // The leg itself, plus two ghosts 120 degrees behind it in the crank cycle.
      for (const off of compact ? [0] : [(4 * Math.PI) / 3, (2 * Math.PI) / 3, 0]) {
        const J = sx > 0 ? leg(theta + off) : mirror(theta + off), live = off === 0;
        const pivot = (k: number): P => (k === -1 ? [0, 0] : k === -2 ? [sx * B[0], B[1]] : J[k]);
        if (live) { // shade the two rigid triangles
          ctx.fillStyle = 'rgba(255,255,255,.06)';
          for (const t of [[pivot(-2), J[1], J[3]], [J[2], J[4], J[5]]]) {
            ctx.beginPath(); t.forEach((p, k) => (k ? ctx.lineTo(X(p), Y(p)) : ctx.moveTo(X(p), Y(p)))); ctx.fill();
          }
        }
        const col = live ? (sx > 0 ? theme.fg : theme.dim) : 'rgba(255,255,255,.07)';
        for (const [a, b] of BARS) { const p = pivot(a), q = pivot(b); line(f, X(p), Y(p), X(q), Y(q), col, live ? 1.25 : 1); }
        if (live) for (let k = 0; k < 5; k++) dot(ctx, X(J[k]), Y(J[k]), 2.25, col);
        dot(ctx, X(J[5]), Y(J[5]), live ? 4 : 2.5, live ? theme.accent : 'rgba(255,255,255,.15)');
      }
      // Fixed pivot B, drawn as a grounded triangle.
      const bx = ox + sx * B[0] * scale, by = Y(B);
      ctx.strokeStyle = theme.accent2; ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(bx - 5, by - 8); ctx.lineTo(bx + 5, by - 8); ctx.closePath(); ctx.stroke();
    }
    dot(ctx, ox, oy, 3, theme.accent2);
    const k = Math.round(((((theta / TAU) % 1) + 1) % 1) * 360) % 360;
    const deg = String(k).padStart(3, '0');
    label(f, `CRANK ${deg}°  ·  FOOT ${s.contact[k] ? 'STANCE' : 'SWING'}`, 14, 20, { color: theme.fg });
    label(f, `ONE MOTOR, ONE DEGREE OF FREEDOM`, 14, 36);
    const flat = Math.round(s.contact.filter(Boolean).length / 3.6);
    label(f, compact ? `STRIDE ${s.stride.toFixed(1)} u  ·  FLAT ${flat}%` : `STRIDE ${s.stride.toFixed(1)} u  ·  FOOT FLAT FOR ${flat}% OF EACH TURN`, 14, h - 14);
    if (w > 900) {
      // The holy numbers, so the reader can check them against the bars.
      label(f, 'LINK LENGTHS (JANSEN)', 14, 64, { color: theme.fg });
      Object.entries(L).forEach(([n, v], q) => label(f, `${n} ${v}`, 14 + (q % 2) * 70, 84 + Math.floor(q / 2) * 16));
    }
  },
};
export default kind;
