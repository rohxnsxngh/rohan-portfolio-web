import type { DiagramKind, Frame } from '../types';
import { TAU, box, easeInOut, label, line, path, stepper, story, type P } from '../draw';

const STEPS = ['INSERT', 'SEATED', 'PULL OUT', 'MISALIGNED'];
const DUR = [3.2, 1.4, 3.2, 3.4];
const OPEN = 0.76; // undeformed lip half-opening, in ball radii

interface S { tin: P[]; tout: P[]; loop: number }

const kind: DiagramKind<S> = {
  staticT: 6.6,
  setup: () => ({ tin: [], tout: [], loop: -1 }),
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const st = story(f.t, DUR);
    if (st.loop !== s.loop) { s.loop = st.loop; s.tin = []; s.tout = []; }
    stepper(f, STEPS, st.i, st.p);

    // Stage: the joint in cross-section.
    // The module body sits 4.1 radii above the lips at the start and the socket runs 2.4 below.
    const secW = compact ? w : w * 0.5, R = Math.min(secW * 0.15, compact ? h * 0.062 : (h - 110) / 6.6);
    const cx = secW / 2, lipY = 46 + 4.1 * R, cavY = lipY + 0.65 * R, top = lipY - 1.5 * R;
    const e = easeInOut(st.p);
    let d = 0, tilt = 0; // d: 0 above the socket, 1 seated
    if (st.i === 0) d = e; else if (st.i === 1) d = 1; else if (st.i === 2) d = 1 - e;
    else { d = Math.min(1, e * 1.15); tilt = (15 * Math.PI) / 180 * (1 - d); }
    const by = top + (cavY - top) * d, bx = cx - Math.sin(tilt) * (cavY - by) * 1.4;
    // Each lip opens by however far the ball overlaps it: the rim is compliant.
    const def = [-1, 1].map((sx) => Math.max(0, R - Math.hypot(bx - (cx + sx * OPEN * R), by - lipY)));
    const dm = Math.max(...def) / ((1 - OPEN) * R);
    const pulling = st.i === 2;
    // Record the force trace: a schematic through the measured peaks, 25 N in and 55 N out.
    if (st.i === 0 && f.dt) s.tin.push([d, 25 * dm]);
    if (pulling && f.dt) s.tout.push([d, 55 * dm]);

    // Socket body with its cavity cut out; the rim near each lip is pushed out by that lip's deflection.
    const bw = 1.9 * R, cav: P[] = [];
    const a0 = Math.asin(0.65);
    for (let k = 0; k <= 40; k++) {
      // From the left lip, down around the bottom, up to the right lip.
      const ang = Math.PI - a0 + ((Math.PI + 2 * a0) * k) / 40, sx = Math.cos(ang) < 0 ? 0 : 1;
      const wgt = Math.max(0, Math.sin(ang) / 0.65) ** 2; // strongest at the lips, none at the bottom
      const r = R + def[sx] * wgt * 1.1;
      cav.push([cx + Math.cos(ang) * r, cavY - Math.sin(ang) * r]);
    }
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - bw, lipY, 2 * bw, 2.4 * R);
    cav.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.clip('evenodd');
    // Rectilinear infill, 20 to 30%: a coarse grid of thin walls.
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = -bw * 2; x < bw * 2; x += 9) { ctx.moveTo(cx + x, lipY); ctx.lineTo(cx + x + 2.4 * R, lipY + 2.4 * R); ctx.moveTo(cx + x, lipY + 2.4 * R); ctx.lineTo(cx + x + 2.4 * R, lipY); }
    ctx.stroke(); ctx.restore();
    ctx.strokeStyle = theme.fg; ctx.lineWidth = 1.25;
    path(ctx, [[cx - bw, lipY + 2.4 * R], [cx - bw, lipY], cav[0]]); ctx.stroke();
    path(ctx, cav); ctx.stroke();
    path(ctx, [cav[40], [cx + bw, lipY], [cx + bw, lipY + 2.4 * R], [cx - bw, lipY + 2.4 * R]]); ctx.stroke();
    if (pulling && d > 0.2) { // the seal briefly holds a partial vacuum under the ball
      ctx.fillStyle = 'rgba(96,165,250,.12)';
      ctx.beginPath(); ctx.arc(cx, cavY, R * 0.98, 0.15, Math.PI - 0.15); ctx.fill();
      label(f, 'PARTIAL VACUUM', cx, cavY + R * 0.6, { align: 'center', color: theme.accent2 });
    }

    // Ball module: stem up to its own body, gyroid infill at 50%.
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-tilt);
    ctx.strokeStyle = theme.fg;
    ctx.strokeRect(-0.35 * R, -2.1 * R, 0.7 * R, 1.25 * R);
    ctx.strokeRect(-bw * 0.8, -2.1 * R - 0.5 * R, bw * 1.6, 0.5 * R);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,102,0,.5)'; ctx.beginPath();
    for (let y = -R; y < R; y += 5) for (let x = -R; x <= R; x += 3) {
      const yy = y + 2 * Math.sin(x * 0.35 + y * 0.5);
      x === -R ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke(); ctx.restore();
    label(f, 'SOCKET  RECTILINEAR 20-30%', cx - bw, lipY + 2.4 * R + 16);
    label(f, 'BALL  GYROID 50%', cx - bw, lipY + 2.4 * R + 30, { color: theme.accent });
    if (st.i === 3) {
      label(f, `${(tilt * 180 / Math.PI).toFixed(0)}° OFF AXIS, STILL GUIDES IN`, cx - bw, top - 2.6 * R + 12, { color: theme.fg });
      label(f, 'SOFT ±15°  ·  RIGID SNAP-FIT ±3°', cx - bw, top - 2.6 * R + 28);
    }

    // Force against displacement.
    const px = compact ? 14 : w * 0.56, pw = compact ? w - 28 : w * 0.4;
    const py = compact ? lipY + 2.4 * R + 62 : 50, ph = compact ? h - lipY - 2.4 * R - 150 : h * 0.55;
    box(f, px, py, pw, ph, theme.faint);
    const X = (u: number) => px + u * pw, Y = (F: number) => py + ph - (F / 60) * ph;
    for (const F of [25, 55]) {
      line(f, px, Y(F), px + pw, Y(F), theme.grid);
      label(f, `${F} N`, px + pw - 4, Y(F) - 4, { align: 'right', color: theme.faint });
    }
    for (const [tr, col] of [[s.tin, theme.fg], [s.tout, theme.accent]] as [P[], string][]) {
      if (tr.length < 2) continue;
      ctx.strokeStyle = col; ctx.lineWidth = 1.25;
      path(ctx, tr.map(([u, F]) => [X(u), Y(F)])); ctx.stroke();
    }
    label(f, 'FORCE vs DISPLACEMENT', px, py - 8, { color: theme.fg });
    label(f, 'INSERT', px + 6, py + 14);
    label(f, 'PULL OUT', px + 6, py + 28, { color: theme.accent });
    if (s.tout.length > 5) label(f, compact ? '2.2× TO SEPARATE' : '2.2× HARDER TO SEPARATE THAN TO JOIN', px + pw, py - 8, { align: 'right', color: theme.accent });

    // Connector compliance ratio on a log axis: existing systems sit above 100.
    const cy0 = compact ? h - 52 : py + ph + 64, cw = pw;
    const L = (v: number) => px + (Math.log10(v) / 4) * cw;
    line(f, px, cy0, px + cw, cy0, theme.faint);
    for (let p = 0; p <= 4; p++) { line(f, L(10 ** p), cy0 - 3, L(10 ** p), cy0 + 3, theme.faint); label(f, `10^${p}`, L(10 ** p), cy0 + 16, { align: 'center', color: theme.faint }); }
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(L(100), cy0 - 6, L(1e4) - L(100), 5);
    ctx.fillStyle = theme.accent; ctx.fillRect(L(1), cy0 - 6, L(10) - L(1), 5);
    label(f, 'MOGO 1-10', L(1), cy0 - 12, { color: theme.accent });
    label(f, 'EXISTING >100', L(100), cy0 - 12);
    if (!compact) label(f, 'CCR = E connector / E module', px, cy0 - 30, { color: theme.fg });
  },
};
export default kind;
