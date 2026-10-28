import type { DiagramKind, Frame } from '../types';
import { box, clamp, label, line, path, rng, stepper, story, type P } from '../draw';

// Public pipeline only (see octapulse-cto.md): mat and fiducial, body plus
// eight features, pixels to inches along the midline, one row per fish, and a
// failed measurement flagged rather than estimated. The fish is synthetic.
const STEPS = ['CAPTURE', 'SCALE', 'SEGMENT', 'MEASURE', 'RECORD'];
const DUR = [1.4, 2, 3.4, 2.6, 2.4];
// Fins as [position along the body, top (-1) or bottom (1), length, height], all in body lengths.
const FINS: [string, number, number, number, number][] = [
  ['DORSAL', 0.4, -1, 0.14, 0.11], ['ADIPOSE', 0.73, -1, 0.05, 0.035], ['PECTORAL', 0.24, 0.55, 0.11, 0.06],
  ['PELVIC', 0.52, 1, 0.08, 0.06], ['ANAL', 0.69, 1, 0.1, 0.07],
];
const REF_IN = 2; // printed reference square, inches on a side

interface S { last: number; rows: string[][] }

const kind: DiagramKind<S> = {
  staticT: 10.6,
  setup: () => ({ last: -1, rows: [] }),
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const st = story(f.t, DUR), i = st.i, p = st.p, loop = st.loop;
    const r = rng(loop * 7 + 3), Lf = 0.78 + r() * 0.16, bend = (r() - 0.5) * 0.06, flag = loop % 4 === 3;
    stepper(f, STEPS, i, p);
    if (!compact) label(f, '~5 MIN BY HAND  →  UNDER 30 S PER PHOTO', w - 14, 20, { align: 'right', color: theme.fg });

    // The mat, with the printed reference square that carries the scale.
    const mx = 14, my = 40, mw = compact ? w - 28 : w * 0.62, mh = compact ? h * 0.42 : h - 84;
    box(f, mx, my, mw, mh, theme.faint);
    const ref = Math.min(mw, mh) * 0.16, ppi = ref / REF_IN;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) if ((a + b) % 2) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(mx + 10 + (a * ref) / 4, my + 10 + (b * ref) / 4, ref / 4, ref / 4); }
    box(f, mx + 10, my + 10, ref, ref, theme.dim);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let x = mx + 10; x < mx + mw; x += ppi) ctx.fillRect(x, my + mh - 8, 1, 4); // inch ticks along the mat edge

    // Body outline: depth profile x^0.6 (1-x)^0.9, a slight bend, snout at left.
    const L = mw * 0.74 * Lf, D = L * 0.3, x0 = mx + (mw - L * 1.15) / 2 + ref * 0.4, cy = my + mh * 0.56;
    const at = (u: number, side: number): P => {
      const d = D * u ** 0.6 * (1 - u) ** 0.9 * (side < 0 ? 1.08 : 0.92);
      return [x0 + u * L, cy + side * d + bend * L * Math.sin(Math.PI * u)];
    };
    const top: P[] = [], bot: P[] = [];
    for (let k = 0; k <= 40; k++) { top.push(at(k / 40, -1)); bot.push(at(k / 40, 1)); }
    const tail = (u: number) => at(u, 0);
    const caudal: P[] = [at(0.96, -1), [x0 + L * 1.17, tail(1)[1] - D * 0.55], [x0 + L * 1.1, tail(1)[1]], [x0 + L * 1.17, tail(1)[1] + D * 0.5], at(0.96, 1)];
    const fin = ([, u, sd, len, ht]: typeof FINS[number]): P[] => {
      const a = at(u, Math.sign(sd)), b = at(u + len, Math.sign(sd)), y = Math.abs(sd) < 1 ? a[1] - D * 0.2 : a[1];
      return [[a[0], y], [a[0] + len * L * 0.25, y + sd * ht * L], [b[0], b[1]]];
    };
    const body: P[] = [...top, ...bot.slice().reverse()];
    const eye: P = [x0 + L * 0.065, cy - D * 0.12];
    const opX = x0 + L * 0.19;

    const photo = i === 0 ? clamp(p * 3) : 1;
    ctx.globalAlpha = photo;
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1;
    path(ctx, body, true); ctx.stroke(); path(ctx, caudal); ctx.stroke();
    FINS.forEach((fn, k) => { if (!(flag && k === 1)) { path(ctx, fin(fn)); ctx.stroke(); } });
    ctx.globalAlpha = 1;
    if (flag) { // a fold of the mat hides the adipose fin in this photo
      ctx.fillStyle = '#000'; const q = at(0.72, -1); ctx.fillRect(q[0] - L * 0.03, q[1] - D * 0.7, L * 0.12, D * 0.62);
    }
    if (i === 0) { ctx.fillStyle = `rgba(255,255,255,${(0.3 * (1 - p)).toFixed(2)})`; ctx.fillRect(mx, my, mw, mh); }

    if (i === 1) { // fiducial corners, then the scale they give
      for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const x = mx + 10 + a * ref, y = my + 10 + b * ref, k = clamp(p * 4 - a - b);
        line(f, x - 6 * k, y, x + 6 * k, y, theme.accent); line(f, x, y - 6 * k, x, y + 6 * k, theme.accent);
      }
      label(f, `${REF_IN} IN = ${ref.toFixed(0)} PX  →  ${ppi.toFixed(1)} PX/IN`, mx + 18 + ref, my + 22, { color: theme.accent });
    }
    // Instance segmentation: the body, then each of the eight features in turn.
    const parts: [string, P[] | null, P][] = [
      ['BODY', body, at(0.5, -1)], ['EYE', null, eye], ['OPERCULUM', null, [opX, cy - D * 0.5]], ['CAUDAL', caudal, caudal[1]],
      ...FINS.map((fn) => [fn[0], fin(fn), fin(fn)[1]] as [string, P[], P]),
    ];
    const nseg = i === 2 ? p * parts.length : i > 2 ? parts.length : 0;
    parts.forEach(([n, poly, tip], k) => {
      if (k >= nseg) return;
      const miss = flag && n === 'ADIPOSE', cur = i === 2 && k === Math.floor(nseg);
      ctx.fillStyle = miss ? 'transparent' : k ? 'rgba(96,165,250,.28)' : 'rgba(255,255,255,.07)';
      ctx.strokeStyle = miss ? theme.bad : k ? theme.accent2 : theme.fg; ctx.lineWidth = 1;
      if (poly) { path(ctx, poly, true); if (!miss) ctx.fill(); ctx.stroke(); }
      else if (n === 'EYE') { ctx.beginPath(); ctx.arc(eye[0], eye[1], D * 0.09, 0, 7); ctx.fill(); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(opX - D * 0.5, cy, D * 0.62, -0.75, 0.75); ctx.stroke(); }
      if (compact && cur) label(f, miss ? 'ADIPOSE NOT FOUND' : `MASK ${k + 1}/9  ${n}`, mx + 8, my + mh - 16, { color: miss ? theme.bad : theme.fg });
      if (i === 2 && !compact) {
        const ly = tip[1] < cy ? Math.min(tip[1], cy - D) - 14 - (k % 3) * 12 : Math.max(tip[1], cy + D) + 18 + (k % 3) * 12;
        line(f, tip[0], tip[1], tip[0], ly + (ly < cy ? 4 : -10), 'rgba(255,255,255,.25)');
        label(f, miss ? 'ADIPOSE NOT FOUND' : n, tip[0], ly, { align: 'center', size: 9, color: miss ? theme.bad : cur ? theme.fg : theme.dim });
      }
    });
    // Midline and calipers, in inches through the fiducial's scale.
    const fork = x0 + L * 1.1, depthU = 0.38, dTop = at(depthU, -1), dBot = at(depthU, 1);
    const FL = (fork - x0) / ppi, DEP = (dBot[1] - dTop[1]) / ppi;
    if (i >= 3) {
      const k = i === 3 ? p : 1;
      ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let q = 0; q <= 30 * k; q++) { const u = (q / 30) * 1.1, [x, y] = tail(Math.min(u, 1)); q ? ctx.lineTo(x0 + u * L, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      const yy = my + mh - 24;
      line(f, x0, yy, x0 + (fork - x0) * k, yy, theme.fg); line(f, x0, yy - 5, x0, yy + 5, theme.fg); line(f, x0 + (fork - x0) * k, yy - 5, x0 + (fork - x0) * k, yy + 5, theme.fg);
      label(f, `FORK LENGTH ${(FL * k).toFixed(1)} IN`, x0 + 6, yy - 6, { color: theme.fg });
      if (k > 0.5) {
        line(f, dTop[0], dTop[1], dBot[0], dBot[1], theme.fg);
        label(f, `DEPTH ${DEP.toFixed(1)} IN`, dTop[0] + 6, dTop[1] - 6, { color: theme.fg });
      }
    }
    // One row per fish. A row with a missing part is flagged, never filled in.
    if (i === 4 && s.last !== loop) {
      s.last = loop;
      s.rows.unshift([`F-${String(1040 + loop).padStart(4, '0')}`, FL.toFixed(1), DEP.toFixed(1), flag ? '19 / 20+' : '20+', flag ? 'FLAGGED' : 'OK']);
      s.rows.length = Math.min(s.rows.length, compact ? 3 : 7);
    }
    const tx = compact ? 14 : w * 0.62 + 34, ty = compact ? my + mh + 30 : 64, cw = compact ? (w - 28) / 5 : (w * 0.38 - 48) / 5;
    label(f, 'DIGITAL TWIN, ONE ROW PER FISH', tx, ty, { color: theme.fg });
    ['ID', 'FL IN', 'DEPTH', 'TRAITS', 'STATUS'].forEach((c, k) => label(f, c, tx + k * cw, ty + 22, { size: 9, color: theme.faint }));
    line(f, tx, ty + 28, tx + cw * 5, ty + 28, theme.faint);
    s.rows.forEach((row, n) => row.forEach((c, k) => {
      const bad = row[4] !== 'OK';
      label(f, c, tx + k * cw, ty + 46 + n * 18, { size: compact ? 9 : 10, color: k === 4 && bad ? theme.bad : n === 0 && i === 4 ? theme.fg : theme.dim });
    }));
    if (flag && i >= 2) label(f, 'NOT ESTIMATED: THE ROW IS FLAGGED FOR REVIEW', compact ? 14 : tx, compact ? h - 12 : h - 58, { color: theme.bad });
    if (!compact) label(f, 'WEIGHT: ALLOMETRIC FIT FROM SCALED AREA, IN PROGRESS', tx, h - 36, { color: theme.faint });
  },
};
export default kind;
