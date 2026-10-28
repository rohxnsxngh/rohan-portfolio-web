import type { DiagramKind, Frame } from '../types';
import { TAU, box, dot, label, line, path, type P } from '../draw';

// Two rows of the T-Bone results table: the same five servos, two amplitude
// patterns. TP (trial 2) left the robot stationary; MU (trial 4) moved it.
const MODES = [
  { name: 'CONSTANT TAIL PROPULSION', A: 20, f: 1.5, ph: 60, m: [1, 1, 1, 1, 1], res: 'STATIONARY  (TRIAL 2)', v: 0 },
  { name: 'MULTIPLYING UNDULATION', A: 18, f: 2.0, ph: 45, m: [0.5, 0.6, 1.1, 1.2, 1.3], res: 'FORWARD  (TRIAL 4)', v: 1 },
];
const D = Math.PI / 180;

interface Vortex { x: number; y: number; s: number; age: number }
interface S {
  mode: number; next: number; phase: number;
  cur: { A: number; f: number; ph: number; v: number; m: number[] };
  vort: Vortex[]; lastTip: number; drift: number;
}

const angles = (c: S['cur'], ph: number) => c.m.map((m, i) => c.A * D * m * Math.sin(ph - c.ph * D * (i + 1)));

const kind: DiagramKind<S> = {
  staticT: 9,
  setup(f) {
    const m = MODES[0];
    return { mode: 0, next: f.t >= 7 ? f.t : 7, phase: 0, cur: { ...m, m: [...m.m] }, vort: [], lastTip: 0, drift: 0 };
  },
  tap(f, s) { s.mode ^= 1; s.next = f.t + 9; },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact, dt } = f;
    if (f.t >= s.next) { s.mode ^= 1; s.next = f.t + 9; }
    const M = MODES[s.mode], c = s.cur;
    // Ease the live parameters toward the target pattern; snap for a still frame.
    const k = f.reduced ? 1 : 1 - Math.exp(-dt * 2.5);
    c.A += (M.A - c.A) * k; c.f += (M.f - c.f) * k; c.ph += (M.ph - c.ph) * k; c.v += (M.v - c.v) * k;
    c.m = c.m.map((v, i) => v + (M.m[i] - v) * k);
    s.phase += TAU * c.f * dt;
    if (f.reduced) s.phase = 1.2;
    const th = angles(c, s.phase);

    const stageH = h * (compact ? 0.62 : 0.68), cy = 30 + (stageH - 30) / 2;
    const segL = Math.min(w * (compact ? 0.12 : 0.085), stageH * 0.2);
    const hx = compact ? w * 0.8 : w * 0.66;
    // Water: dot lattice that scrolls past only when the fish actually makes way.
    s.drift = (s.drift + c.v * dt * segL * 1.6) % 28;
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    for (let x = -s.drift + 28; x < w; x += 28) for (let y = 40; y < stageH; y += 28) ctx.fillRect(x, y, 1, 1);

    // Chain the five segments from the head: each joint angle adds to the last
    // heading. The head recoils against the mean tail heading, as a free hull
    // does, which keeps the swimmer centred instead of curling off the stage.
    let psi = 0, sum = 0;
    for (const a of th) sum += psi += a;
    const yaw = -0.6 * sum / 5, hx0 = hx - Math.cos(yaw) * segL * 1.1, hy0 = cy + Math.sin(yaw) * segL * 1.1;
    const pts: P[] = [[hx0, hy0]];
    psi = yaw;
    for (let i = 0; i < 5; i++) {
      psi += th[i];
      const [x, y] = pts[i];
      pts.push([x - segL * Math.cos(psi), y + segL * Math.sin(psi)]);
    }
    const tip = pts[5], tail: P = [tip[0] - segL * 0.45 * Math.cos(psi), tip[1] + segL * 0.45 * Math.sin(psi)];
    // Shed a vortex each time the tail tip turns around, spinning the other way each time.
    const vy = tail[1] - s.lastTip;
    if (dt && Math.sign(vy) !== Math.sign(s.lastTip) && Math.abs(vy) > 0.01 && s.vort.length < 40)
      s.vort.push({ x: tail[0], y: tail[1], s: Math.sign(vy), age: 0 });
    s.lastTip = vy;
    s.vort = s.vort.filter((v) => (v.age += dt) < 3.2);
    for (const v of s.vort) {
      v.x -= dt * segL * (0.5 + c.v * 1.6);
      const r = 2 + v.age * 2.5, a = 1 - v.age / 3.2, rot = v.age * 5 * v.s;
      ctx.strokeStyle = `rgba(96,165,250,${(0.5 * a).toFixed(2)})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(v.x, v.y, r, rot, rot + 4.4); ctx.stroke();
    }

    // Head: streamlined hull carrying the electronics, tag 0 on top.
    ctx.strokeStyle = theme.fg; ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.ellipse(hx, cy, segL * 1.1, segL * 0.36, -yaw, 0, TAU); ctx.stroke();
    // Tail segments as capsules narrowing toward the tail, joints at the servos.
    for (let i = 0; i < 5; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], hw = segL * (0.2 - i * 0.025);
      const nx = (-(y2 - y1) / segL) * hw, ny = ((x2 - x1) / segL) * hw;
      ctx.strokeStyle = theme.dim; ctx.lineWidth = 1;
      path(ctx, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], true); ctx.stroke();
      line(f, x1, y1, x2, y2, theme.fg, 1.25);
      dot(ctx, x1, y1, 2.5, i ? theme.fg : theme.accent2);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (i < 4) { // AprilTags 1-4 ride on the first four segments
        ctx.fillStyle = theme.fg; ctx.fillRect(mx - 3, my - 3, 6, 6);
        ctx.fillStyle = '#000'; ctx.fillRect(mx - 1, my - 1, 2, 2);
      }
    }
    // Caudal fin, swept back from the last segment.
    const sx = Math.sin(psi) * segL * 0.32, sy = Math.cos(psi) * segL * 0.32;
    ctx.strokeStyle = theme.accent; ctx.lineWidth = 1.25;
    path(ctx, [[tail[0] + sx, tail[1] + sy], tip, [tail[0] - sx, tail[1] - sy]]); ctx.stroke();
    ctx.fillStyle = theme.fg; ctx.fillRect(hx - 4, cy - 4, 8, 8);
    ctx.fillStyle = '#000'; ctx.fillRect(hx - 1.5, cy - 1.5, 3, 3);
    label(f, 'TAG 0', hx, cy - segL * 0.36 - 8, { align: 'center' });

    // Readouts.
    label(f, M.name, 14, 20, { color: theme.fg });
    label(f, `A ${c.A.toFixed(0)}°  f ${c.f.toFixed(1)} Hz  φ ${c.ph.toFixed(0)}°`, 14, 36);
    label(f, `m = [${c.m.map((v) => v.toFixed(1)).join(' ')}]`, 14, 52);
    label(f, `RESULT  ${M.res}`, compact ? 14 : w - 14, compact ? 68 : 20, { align: compact ? 'left' : 'right', color: M.v ? theme.accent : theme.dim });
    if (!compact) label(f, 'TAP TO SWITCH PATTERN', w - 14, 36, { align: 'right', color: theme.faint });

    // Joint angle traces over the last two seconds, one per servo.
    const y0 = stageH + 10, sh = h - y0 - 26, x0 = 14, sw = w - 28;
    box(f, x0, y0, sw, sh, theme.faint);
    line(f, x0, y0 + sh / 2, x0 + sw, y0 + sh / 2, theme.grid);
    const amp = (sh / 2 - 4) / (25 * 1.3 * D);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = i === 4 ? theme.accent : `rgba(255,255,255,${0.2 + i * 0.12})`; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let q = 0; q <= 120; q++) {
        const tt = s.phase - TAU * c.f * 2 * (1 - q / 120);
        const y = y0 + sh / 2 - c.A * D * c.m[i] * Math.sin(tt - c.ph * D * (i + 1)) * amp;
        q ? ctx.lineTo(x0 + (sw * q) / 120, y) : ctx.moveTo(x0, y);
      }
      ctx.stroke();
    }
    label(f, compact ? 'JOINT ANGLES, LAST 2 S' : 'JOINT ANGLES, LAST 2 S  ·  SERVO 1 FAINTEST, SERVO 5 ORANGE', x0, h - 10);
  },
};
export default kind;
