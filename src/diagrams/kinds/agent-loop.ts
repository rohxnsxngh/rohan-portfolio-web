import type { DiagramKind, Frame } from '../types';
import { arrow, box, clamp, easeInOut, label, story } from '../draw';

// The 9.11 vs 9.9 example from the post, run through the ReAct loop.
// m: written by the model; c: written by our code around it.
const LINES: [string, 'm' | 'c'][] = [
  ['Question: Which is larger, 9.11 or 9.9?', 'c'],
  ['Thought: Compare them as numbers, not text.', 'm'],
  ['Action: python("9.11 > 9.9")', 'm'],
  ['Observation: False', 'c'],
  ['Thought: 9.11 is smaller, so 9.9 is larger.', 'm'],
  ['Final Answer: 9.9', 'm'],
];
// Each beat: which line it writes (-1: none), which ring node is lit, and what is happening.
const BEATS: [number, number, string][] = [
  [0, 0, 'CODE STARTS THE TRANSCRIPT'],
  [-1, 4, 'TURN 1: THE MODEL READS EVERYTHING SO FAR'],
  [1, 1, 'MODEL WRITES A THOUGHT'],
  [2, 2, 'MODEL WRITES AN ACTION, THEN STOPS'],
  [-1, 5, 'CODE PARSES THE ACTION AND RUNS THE TOOL'],
  [3, 3, 'CODE APPENDS THE OBSERVATION'],
  [-1, 4, 'TURN 2: SAME MODEL, LONGER TRANSCRIPT'],
  [4, 1, 'MODEL WRITES A THOUGHT'],
  [5, 6, 'FINAL ANSWER ENDS THE LOOP'],
  [-1, 6, ''],
];
const DUR = [1.4, 1.6, 1.5, 1.5, 1.6, 1.3, 1.6, 1.5, 1.4, 2.4];
const NODES = ['QUESTION', 'THOUGHT', 'ACTION', 'OBSERVATION'];

const kind: DiagramKind = {
  staticT: 13.2,
  setup: () => null,
  draw(f: Frame) {
    const { ctx, w, h, theme, compact } = f;
    const st = story(f.t, DUR), b = st.i, p = st.p;
    // How many lines exist, and how much of the one being written.
    let n = 0;
    for (let k = 0; k < b; k++) if (BEATS[k][0] >= 0) n = BEATS[k][0] + 1;
    const cur = BEATS[b][0], node = BEATS[b][1];
    label(f, 'AN AGENT IS A LOOP, NOT A MODEL', 14, 20, { color: theme.fg });
    label(f, BEATS[b][2] || BEATS[8][2], 14, 36, { color: theme.accent });

    // Ring: Thought, Action, Observation loop on a circle; Question enters, Final leaves.
    const rx = compact ? w * 0.27 : w * 0.16, ry = compact ? 150 : h * 0.52, R = compact ? 50 : Math.min(w * 0.085, h * 0.22);
    const ANG = [0, -Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6]; // index 0 (Question) sits outside the ring
    const pos = (k: number): [number, number] => k ? [rx + Math.cos(ANG[k]) * R, ry + Math.sin(ANG[k]) * R] : [rx - R * 1.25, ry - R * 1.55];
    ctx.lineWidth = 1;
    for (let k = 1; k <= 3; k++) { // clockwise arcs with a gap at each node
      const a0 = ANG[k] + 0.42, a1 = (k === 3 ? ANG[1] + Math.PI * 2 : ANG[k + 1]) - 0.42;
      const lit = node === k + 1 || (k === 3 && node === 1 && b > 3);
      ctx.strokeStyle = lit ? theme.accent : 'rgba(255,255,255,.22)';
      ctx.beginPath(); ctx.arc(rx, ry, R, a0, a1); ctx.stroke();
      const ex = rx + Math.cos(a1) * R, ey = ry + Math.sin(a1) * R;
      arrow(f, ex - Math.cos(a1 + Math.PI / 2) * 6, ey - Math.sin(a1 + Math.PI / 2) * 6, ex, ey, lit ? theme.accent : 'rgba(255,255,255,.22)', 4);
    }
    const [qx, qy] = pos(0), [t1x, t1y] = pos(1);
    arrow(f, qx + 20, qy + 8, t1x - 26, t1y - 4, node === 1 && b < 3 ? theme.accent : 'rgba(255,255,255,.22)', 4);
    arrow(f, t1x + 30, t1y, t1x + R * 0.95, t1y, node === 6 ? theme.accent : 'rgba(255,255,255,.22)', 4);
    NODES.forEach((nm, k) => {
      const [x, y] = pos(k), on = node === k;
      label(f, nm, x, y + 3, { align: 'center', size: compact ? 8 : 10, color: on ? theme.accent : theme.dim });
    });
    label(f, 'FINAL', t1x + R * 0.95 + 6, t1y + 3, { size: compact ? 8 : 10, color: node === 6 ? theme.accent : theme.faint });

    // The model: stateless. Every turn the entire transcript is copied in.
    const mx = compact ? w * 0.56 : w * 0.33, my = compact ? 84 : h * 0.34, mw = compact ? w * 0.4 : w * 0.13, mh = compact ? 92 : h * 0.32;
    const reading = node === 4, tool = node === 5;
    box(f, mx, my, mw, mh, reading || BEATS[b][0] > 0 && LINES[BEATS[b][0]][1] === 'm' ? theme.fg : theme.faint);
    label(f, 'MODEL', mx + mw / 2, my + 18, { align: 'center', color: theme.fg });
    label(f, '(STATELESS)', mx + mw / 2, my + 32, { align: 'center', size: 9 });
    const ctxLines = b >= 6 ? 4 : b >= 1 ? 1 : 0;
    for (let k = 0; k < ctxLines; k++) { ctx.fillStyle = LINES[k][1] === 'c' ? 'rgba(255,102,0,.6)' : 'rgba(255,255,255,.45)'; ctx.fillRect(mx + 10, my + 46 + k * 7, (mw - 20) * (0.4 + (LINES[k][0].length % 7) / 12), 3); }
    const tokens = Math.round(LINES.slice(0, ctxLines).reduce((a, l) => a + l[0].length, 0) / 4);
    label(f, `READS ~${tokens} TOKENS`, mx + mw / 2, my + mh + 16, { align: 'center', size: 9, color: reading ? theme.fg : theme.dim });
    if (tool) {
      box(f, mx, my + mh + 28, mw, 34, theme.accent);
      label(f, 'TOOL: python', mx + 8, my + mh + 42, { size: 9, color: theme.accent });
      label(f, p > 0.5 ? '→ False' : 'running…', mx + 8, my + mh + 55, { size: 9, color: theme.fg });
    }

    // The transcript, which only ever grows.
    const tx = compact ? 14 : w * 0.52, ty = compact ? 260 : 74, lh = compact ? 20 : 26, tw = compact ? w - 28 : w * 0.46;
    box(f, tx - 8, ty - 18, tw + 4, lh * 6 + 16, theme.faint);
    label(f, 'TRANSCRIPT', tx - 8, ty - 26, { size: 9 });
    const fly = reading ? easeInOut(clamp(p * 1.4)) : 0;
    for (let k = 0; k < (cur >= 0 ? cur + 1 : n); k++) {
      const [s, who] = LINES[k], part = k === cur ? s.slice(0, Math.ceil(s.length * clamp(p * 1.5))) : s;
      label(f, part, tx, ty + k * lh, { size: compact ? 9 : 11, color: who === 'c' ? theme.accent : theme.fg });
    }
    if (fly > 0 && fly < 1) { // ghost of the transcript travelling into the model
      const gx = tx + (mx + 10 - tx) * fly, gy = ty - 10 + (my + 46 - ty + 10) * fly;
      ctx.strokeStyle = `rgba(255,255,255,${(0.6 * (1 - fly)).toFixed(2)})`; ctx.strokeRect(gx, gy, (tw - 20) * (1 - fly * 0.8), (n * lh) * (1 - fly * 0.85));
    }
    const ly = ty + lh * 6 + 22;
    ctx.fillStyle = theme.fg; ctx.fillRect(tx, ly - 7, 6, 6); label(f, 'MODEL WRITES', tx + 12, ly, { size: 9 });
    ctx.fillStyle = theme.accent; ctx.fillRect(tx + 110, ly - 7, 6, 6); label(f, 'OUR CODE WRITES', tx + 122, ly, { size: 9 });
  },
};
export default kind;
