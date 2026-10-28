import type { DiagramKind, Frame } from '../types';
import { TAU, box, label, line, path, rng, stepper, story, type P } from '../draw';

const C = 7, R = 5, RAYS = 360, OCC = 6; // maze cells, beam rays, occupancy cells per maze cell
const STEPS = ['LIDAR SCAN', 'FMT*', 'BEZIER', 'TOPP-RA'];
type Seg = [number, number, number, number];

/** Ray or segment p + t(q - p) against wall w: t in [0, 1] of the first, or Infinity. */
function hit(px: number, py: number, dx: number, dy: number, [ax, ay, bx, by]: Seg) {
  const ex = bx - ax, ey = by - ay, den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const t = ((ax - px) * ey - (ay - py) * ex) / den, u = ((ax - px) * dy - (ay - py) * dx) / den;
  return t >= 0 && u >= -0.02 && u <= 1.02 ? t : Infinity;
}
const clear = (walls: Seg[], a: P, b: P) => walls.every((w) => hit(a[0], a[1], b[0] - a[0], b[1] - a[1], w) > 1);

interface S {
  walls: Seg[]; hits: P[]; occ: [number, number, number][];
  nodes: P[]; parent: number[]; cost: number[]; maxCost: number; route: P[];
  tris: P[][]; curve: P[]; vmax: number[]; v: number[]; time: number[]; T: number;
}

const kind: DiagramKind<S> = {
  staticT: 13.5,
  fps: 30,
  setup() {
    const r = rng(11);
    // Depth-first maze: every cell starts walled in, the walk knocks walls out.
    const right = Array(C * R).fill(1), down = Array(C * R).fill(1), seen = Array(C * R).fill(0);
    const stack = [0]; seen[0] = 1;
    while (stack.length) {
      const c = stack[stack.length - 1], x = c % C, y = (c / C) | 0;
      const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([u, v]) => u >= 0 && v >= 0 && u < C && v < R && !seen[v * C + u]);
      if (!nb.length) { stack.pop(); continue; }
      const [u, v] = nb[(r() * nb.length) | 0], n = v * C + u;
      if (u > x) right[c] = 0; else if (u < x) right[n] = 0; else if (v > y) down[c] = 0; else down[n] = 0;
      seen[n] = 1; stack.push(n);
    }
    const walls: Seg[] = [[0, 0, C, 0], [0, 0, 0, R], [C, 0, C, R], [0, R, C, R]];
    for (let c = 0; c < C * R; c++) {
      const x = c % C, y = (c / C) | 0;
      if (right[c] && x < C - 1) walls.push([x + 1, y, x + 1, y + 1]);
      if (down[c] && y < R - 1) walls.push([x, y + 1, x + 1, y + 1]);
    }
    // One full LiDAR revolution from the start cell; each return fills an occupancy cell.
    const hits: P[] = [], occ: [number, number, number][] = [], got = new Set<number>();
    for (let k = 0; k < RAYS; k++) {
      const a = (k / RAYS) * TAU, dx = Math.cos(a), dy = Math.sin(a);
      const t = Math.min(...walls.map((w) => hit(0.5, 0.5, dx, dy, w)));
      const p: P = [0.5 + dx * t, 0.5 + dy * t];
      hits.push(p);
      const ix = Math.min(C * OCC - 1, (p[0] * OCC) | 0), iy = Math.min(R * OCC - 1, (p[1] * OCC) | 0);
      if (!got.has(iy * 1e3 + ix)) { got.add(iy * 1e3 + ix); occ.push([ix, iy, k]); }
    }
    // FMT*-style tree: samples kept clear of walls, grown in order of cost-to-come.
    const nodes: P[] = [[0.5, 0.5], [C - 0.5, R - 0.5]];
    while (nodes.length < 300) {
      const p: P = [0.15 + r() * (C - 0.3), 0.15 + r() * (R - 0.3)];
      const fx = p[0] % 1, fy = p[1] % 1;
      if (Math.min(fx, 1 - fx, fy, 1 - fy) > 0.12) nodes.push(p);
    }
    const n = nodes.length, cost = Array(n).fill(Infinity), parent = Array(n).fill(-1), done = Array(n).fill(false);
    cost[0] = 0;
    for (;;) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!done[i] && cost[i] < Infinity && (u < 0 || cost[i] < cost[u])) u = i;
      if (u < 0) break;
      done[u] = true;
      for (let i = 0; i < n; i++) {
        const d = Math.hypot(nodes[i][0] - nodes[u][0], nodes[i][1] - nodes[u][1]);
        if (!done[i] && d < 1 && cost[u] + d < cost[i] && clear(walls, nodes[u], nodes[i])) { cost[i] = cost[u] + d; parent[i] = u; }
      }
    }
    const route: P[] = [];
    for (let i = 1; i >= 0; i = parent[i]) route.unshift(nodes[i]);
    // Shortcut to the fewest line-of-sight vertices, then round each corner with
    // a quadratic Bezier whose control triangle is checked against the walls.
    const lin: P[] = [route[0]];
    for (let i = 0; i < route.length - 1;) {
      let j = route.length - 1;
      while (j > i + 1 && !clear(walls, route[i], route[j])) j--;
      lin.push(route[j]); i = j;
    }
    const L = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const tris: P[][] = [], curve: P[] = [lin[0]];
    for (let i = 1; i < lin.length - 1; i++) {
      let c = 0.48, a: P = lin[i], b: P = lin[i];
      for (; c > 0.05; c -= 0.08) { a = L(lin[i], lin[i - 1], c); b = L(lin[i], lin[i + 1], c); if (clear(walls, a, b)) break; }
      tris.push([a, lin[i], b]);
      for (let q = 0; q <= 16; q++) { const t = q / 16; curve.push(L(L(a, lin[i], t), L(lin[i], b, t), t)); }
    }
    curve.push(lin[lin.length - 1]);
    // Resample by arc length, then the two-pass speed profile: TOPP-RA's answer
    // for a point robot with a lateral acceleration limit.
    const pts: P[] = [curve[0]];
    for (let i = 1; i < curve.length; i++) {
      const p = pts[pts.length - 1], q = curve[i], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      for (let k = 1; k <= Math.ceil(d / 0.05); k++) pts.push(L(p, q, k / Math.ceil(d / 0.05)));
    }
    const N = pts.length, vmax: number[] = [], v: number[] = [], time = [0], ds = 0.05;
    for (let i = 0; i < N; i++) {
      // Curvature as heading change per unit length, then the lateral-acceleration cap.
      const a = pts[Math.max(0, i - 2)], b = pts[i], c = pts[Math.min(N - 1, i + 2)];
      let dh = Math.abs(Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(b[1] - a[1], b[0] - a[0]));
      if (dh > Math.PI) dh = TAU - dh;
      vmax.push(Math.min(1.6, Math.sqrt(1.2 / (dh / (4 * ds) + 1e-6))));
    }
    for (let i = 0; i < N; i++) v[i] = i ? Math.min(vmax[i], Math.sqrt(v[i - 1] ** 2 + 2 * 1.5 * ds)) : 0;
    for (let i = N - 1; i >= 0; i--) v[i] = i < N - 1 ? Math.min(v[i], Math.sqrt(v[i + 1] ** 2 + 2 * 1.5 * ds)) : 0;
    for (let i = 1; i < N; i++) time.push(time[i - 1] + ds / Math.max(0.05, (v[i] + v[i - 1]) / 2));
    return { walls, hits, occ, nodes, parent, cost, maxCost: Math.max(...cost.filter((c) => c < Infinity)), route, tris, curve: pts, vmax, v, time, T: time[N - 1] };
  },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const drive = s.T * 0.5 + 1.5; // played back at 2x
    const st = story(f.t, [4, 3.5, 3, drive]), i = st.i, p = st.p;
    stepper(f, STEPS, i, p);
    const mw = compact ? w - 28 : w * 0.62 - 28, mh = compact ? h * 0.5 : h - 74;
    const sc = Math.min(mw / C, mh / R), ox = 14, oy = 38;
    const X = (q: P) => ox + q[0] * sc, Y = (q: P) => oy + q[1] * sc;
    // Occupancy cells light as the beam returns them.
    const sweep = i ? RAYS : p * RAYS, cs = sc / OCC;
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    for (const [ix, iy, k] of s.occ) if (k <= sweep) ctx.fillRect(ox + ix * cs, oy + iy * cs, cs - 0.5, cs - 0.5);
    for (const [ax, ay, bx, by] of s.walls) line(f, X([ax, ay]), Y([ax, ay]), X([bx, by]), Y([bx, by]), i ? theme.dim : 'rgba(255,255,255,.07)');
    if (i === 0) {
      ctx.strokeStyle = 'rgba(255,102,0,.12)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 0; k < sweep; k += 3) { ctx.moveTo(X([0.5, 0.5]), Y([0.5, 0.5])); ctx.lineTo(X(s.hits[k]), Y(s.hits[k])); }
      ctx.stroke();
      const b = s.hits[Math.min(RAYS - 1, sweep | 0)];
      line(f, X([0.5, 0.5]), Y([0.5, 0.5]), X(b), Y(b), theme.accent);
    }
    // The tree, grown outward in cost order.
    if (i >= 1) {
      const lim = i === 1 ? p * s.maxCost : Infinity;
      ctx.strokeStyle = i === 1 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.1)'; ctx.beginPath();
      s.nodes.forEach((q, k) => {
        const u = s.parent[k];
        if (u >= 0 && s.cost[k] <= lim) { ctx.moveTo(X(q), Y(q)); ctx.lineTo(X(s.nodes[u]), Y(s.nodes[u])); }
      });
      ctx.stroke();
      ctx.fillStyle = theme.dim;
      for (const q of s.nodes) ctx.fillRect(X(q) - 1, Y(q) - 1, 2, 2);
      if (i > 1 || p > 0.9) { ctx.strokeStyle = theme.fg; ctx.lineWidth = 1.25; path(ctx, s.route.map((q) => [X(q), Y(q)])); ctx.stroke(); }
    }
    if (i >= 2) {
      ctx.fillStyle = 'rgba(96,165,250,.14)'; ctx.strokeStyle = 'rgba(96,165,250,.6)'; ctx.lineWidth = 1;
      for (const t of s.tris) { path(ctx, t.map((q) => [X(q), Y(q)]), true); ctx.fill(); ctx.stroke(); }
      const n = i === 2 ? Math.floor(p * s.curve.length) : s.curve.length;
      ctx.strokeStyle = theme.accent; ctx.lineWidth = 2; path(ctx, s.curve.slice(0, n).map((q) => [X(q), Y(q)])); ctx.stroke();
    }
    // Drive the curve at the profiled speed.
    let k = 0;
    if (i === 3) { const tt = Math.min(s.T, p * drive * 2); while (k < s.time.length - 1 && s.time[k + 1] < tt) k++; }
    const pos = s.curve[k], nx = s.curve[Math.min(k + 1, s.curve.length - 1)], hd = Math.atan2(nx[1] - pos[1], nx[0] - pos[0]) || 0;
    ctx.save(); ctx.translate(X(pos), Y(pos)); ctx.rotate(hd);
    ctx.strokeStyle = theme.fg; ctx.lineWidth = 1.25; ctx.strokeRect(-sc * 0.16, -sc * 0.12, sc * 0.32, sc * 0.24);
    ctx.restore();
    label(f, 'START', X([0.5, 0.5]), Y([0.5, 0.5]) + sc * 0.32, { align: 'center' });
    label(f, 'GOAL', X([C - 0.5, R - 0.5]), Y([C - 0.5, R - 0.5]) + 4, { align: 'center', color: theme.fg });

    // Speed profile along the path: the cap from curvature, and the profile under it.
    const px = compact ? 14 : w * 0.62 + 10, pw = compact ? w - 28 : w * 0.38 - 24;
    const py = compact ? oy + R * sc + 40 : h * 0.3, ph = compact ? h - (oy + R * sc + 40) - 44 : h * 0.4;
    box(f, px, py, pw, ph, theme.faint);
    label(f, 'SPEED ALONG THE PATH', px, py - 8, { color: theme.fg });
    const N = s.v.length, PX = (q: number) => px + (q / (N - 1)) * pw, PY = (v: number) => py + ph - (v / 1.8) * ph;
    if (i >= 2) {
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.setLineDash([2, 3]); path(ctx, s.vmax.map((v, q) => [PX(q), PY(v)])); ctx.stroke(); ctx.setLineDash([]);
      label(f, '··· CURVATURE LIMIT', px, py + ph + 16, { color: theme.dim });
    }
    if (i === 3) {
      ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.25; path(ctx, s.v.slice(0, k + 1).map((v, q) => [PX(q), PY(v)])); ctx.stroke();
      line(f, PX(k), py, PX(k), py + ph, theme.dim);
      label(f, '── TIME-OPTIMAL PROFILE', px + pw, py + ph + 16, { align: 'right', color: theme.accent });
    }
    label(f, compact ? 'RPLIDAR A1 · ROS 2' : 'RPLIDAR A1  ·  JETSON NANO  ·  ROS 2 HUMBLE', compact ? 14 : px, h - 14);
  },
};
export default kind;
