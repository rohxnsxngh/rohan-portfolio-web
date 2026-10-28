import type { DiagramKind, Frame } from '../types';
import { box, clamp, easeInOut, label, line, path, rng, type P } from '../draw';

// A schematic gripper jaw: a C-shaped profile with a pin pocket and chamfered
// lead-ins. Non-convex as a whole, which is exactly what Simscape cannot collide.
const JAW: P[] = [[0, 0], [0.92, 0], [1, 0.08], [1, 0.3], [0.9, 0.3], [0.35, 0.36], [0.35, 0.64], [0.9, 0.7], [1, 0.7], [1, 0.92], [0.92, 1], [0.25, 1], [0.25, 0.86], [0.1, 0.86], [0.1, 1], [0, 1]];
// Convex pieces that keep every contact feature: arms with their chamfers, spine, the pocket walls.
const HULLS: P[][] = [
  [[0.35, 0], [0.92, 0], [1, 0.08], [1, 0.3], [0.9, 0.3], [0.35, 0.36]],
  [[0.35, 0.64], [0.9, 0.7], [1, 0.7], [1, 0.92], [0.92, 1], [0.35, 1]],
  [[0, 0], [0.35, 0], [0.35, 0.86], [0, 0.86]],
  [[0, 0.86], [0.1, 0.86], [0.1, 1], [0, 1]],
  [[0.25, 0.86], [0.35, 0.86], [0.35, 1], [0.25, 1]],
];
const CYC = 10, N = 3200;

/** Even-odd point in polygon. */
function inside([x, y]: P, poly: P[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

interface S { vox: P[][]; pts: [number, number, number][] }

const kind: DiagramKind<S> = {
  staticT: 7.6,
  setup() {
    // Voxel decomposition: fill a 14-cell grid, merge each row into runs. The chamfers become stairs.
    const g = 14, vox: P[][] = [];
    for (let r = 0; r < g; r++) {
      let start = -1;
      for (let c = 0; c <= g; c++) {
        const on = c < g && inside([(c + 0.5) / g, (r + 0.5) / g], JAW);
        if (on && start < 0) start = c;
        if (!on && start >= 0) { const a = start / g, b = c / g, y0 = r / g, y1 = (r + 1) / g; vox.push([[a, y0], [b, y0], [b, y1], [a, y1]]); start = -1; }
      }
    }
    // The sweep: lateral misalignment, yaw error, friction. Outcome from a schematic tolerance region.
    const rn = rng(17), pts: [number, number, number][] = [];
    for (let k = 0; k < N; k++) {
      const x = rn() * 2 - 1, y = rn() * 2 - 1, mu = rn(), v = rn();
      const m = 1 - (x / (0.5 + 0.15 * mu)) ** 2 - (y / 0.66) ** 2 + (rn() - 0.5) * 0.12;
      pts.push([x, y, m < 0 ? 1 : m < 0.35 && v > 0.45 && mu < 0.6 ? 2 : 0]); // 0 ok, 1 collision, 2 slip
    }
    return { vox, pts };
  },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const t = f.t % CYC, coacd = t < CYC / 2, ph = (t % (CYC / 2)) / (CYC / 2);
    // Pieces drift apart from the part's centre and settle back.
    const ex = easeInOut(clamp(ph * 3)) * (1 - easeInOut(clamp(ph * 3 - 1.7)));
    const pw = compact ? Math.min(w * 0.5, h * 0.24) : Math.min(w * 0.26, h * 0.48), ox = compact ? 40 : 70, oy = compact ? 72 : 110;
    const XY = ([x, y]: P, dx = 0, dy = 0): P => [ox + (x + dx) * pw, oy + (y + dy) * pw];
    label(f, 'CONVEX DECOMPOSITION', 14, 20, { color: theme.fg });
    label(f, coacd ? 'CoACD: COLLISION-AWARE CONCAVITY' : 'V-HACD: VOXELIZE, THEN SPLIT', 14, 36, { color: coacd ? theme.accent : theme.dim });
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([3, 3]); path(ctx, JAW.map((q) => XY(q)), true); ctx.stroke(); ctx.setLineDash([]);
    const pieces = coacd ? HULLS : s.vox;
    pieces.forEach((hp) => {
      const cx = hp.reduce((a, q) => a + q[0], 0) / hp.length - 0.5, cy = hp.reduce((a, q) => a + q[1], 0) / hp.length - 0.5;
      const d = ex * 0.22;
      ctx.fillStyle = coacd ? 'rgba(255,102,0,.16)' : 'rgba(96,165,250,.12)';
      ctx.strokeStyle = coacd ? theme.accent : theme.accent2; ctx.lineWidth = 1;
      path(ctx, hp.map((q) => XY(q, cx * d, cy * d)), true); ctx.fill(); ctx.stroke();
    });
    label(f, `${pieces.length} CONVEX PIECES`, ox, oy + pw + 40, { color: theme.fg });
    label(f, coacd ? 'CHAMFERS AND POCKET KEPT' : 'CHAMFERS BECOME STAIRS', ox, oy + pw + 56);

    // Parameter sweep: each dot one simulated handoff.
    const sx = compact ? 14 : w * 0.5, sw = compact ? w - 28 : w * 0.46, sy = compact ? oy + pw + 110 : 60;
    const sh = compact ? h - sy - 70 : h - 130, side = Math.min(sw, sh * 1.4);
    box(f, sx, sy, side, sh, theme.faint);
    line(f, sx + side / 2, sy, sx + side / 2, sy + sh, theme.grid); line(f, sx, sy + sh / 2, sx + side, sy + sh / 2, theme.grid);
    label(f, 'PARAMETER SWEEP', sx, sy - 24, { color: theme.fg });
    label(f, 'x: LATERAL MISALIGNMENT  ·  y: YAW ERROR', sx, sy - 8, { size: 9 });
    const n = Math.floor(clamp(t / (CYC * 0.8)) * (compact ? N / 2 : N));
    const col = [theme.ok, theme.bad, theme.accent], cnt = [0, 0, 0];
    for (let k = 0; k < n; k++) {
      const [x, y, o] = s.pts[k];
      cnt[o]++;
      ctx.fillStyle = col[o];
      ctx.fillRect(sx + ((x + 1) / 2) * side - 1, sy + ((y + 1) / 2) * sh - 1, 2, 2);
    }
    if (t > CYC * 0.55) { // the boundary the dots trace out
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.setLineDash([4, 3]); ctx.beginPath();
      ctx.ellipse(sx + side / 2, sy + sh / 2, (0.575 * side) / 2, (0.66 * sh) / 2, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
      label(f, 'TOLERANCE BOUNDARY', sx + side / 2, sy + sh / 2 - (0.66 * sh) / 2 - 6, { align: 'center', color: theme.fg });
    }
    const ly = sy + sh + 18;
    [['HANDOFF OK', 0], ['COLLISION', 1], ['SLIP', 2]].forEach(([nm, o], k) => {
      const x = sx + k * (compact ? 104 : 140);
      ctx.fillStyle = col[o as number]; ctx.fillRect(x, ly - 7, 6, 6);
      label(f, `${nm} ${cnt[o as number]}`, x + 10, ly, { size: 9 });
    });
    label(f, compact ? `${n} RUNS SHOWN  ·  100,000+ REAL` : `${n.toLocaleString('en-US')} RUNS SHOWN  ·  100,000+ IN THE REAL SWEEP  ·  SCHEMATIC`, sx, ly + 18, { size: 9, color: theme.faint });
  },
};
export default kind;
