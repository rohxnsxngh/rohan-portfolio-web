import type { DiagramKind, Frame } from '../types';
import { arrow, label, rng, stepper, story } from '../draw';

// The phonemes of "bookcase": a real double phoneme, so the blank has work to do.
const SYM = ['ε', 'B', 'UH', 'K', 'EY', 'S'];
const TGT = [1, 2, 3, 3, 4, 5];
const EXT = [0, ...TGT.flatMap((c) => [c, 0])]; // ε B ε UH ε K ε K ε EY ε S ε
const TRUE = [0, 1, 1, 2, 2, 2, 3, 3, 0, 3, 3, 4, 4, 5, 5, 0]; // the frames the audio really holds
const T = TRUE.length, NS = EXT.length;
const STEPS = ['FORWARD PASS', 'VALID PATHS', 'INVALID PATH', 'SUM OF ALL PATHS'];
const DUR = [3.4, 8.4, 3.4, 3];

const can = (s: number, k: number) => k === 0 || k === 1 || (k === 2 && EXT[s] !== 0 && EXT[s] !== EXT[s - 2]);
/** Merge repeats, then drop blanks. */
const collapse = (seq: number[]) => seq.filter((c, i) => c !== seq[i - 1]).filter((c) => c).map((c) => SYM[c]).join(' ');

interface S { alpha: number[][]; gamma: number[][]; paths: number[][]; bad: number[] }

const kind: DiagramKind<S> = {
  staticT: 6.2,
  setup() {
    const r = rng(9);
    // Frame posteriors: softmax of a strong vote for the true symbol plus noise.
    const y = TRUE.map((c) => {
      const z = SYM.map((_, k) => (k === c ? 3.2 : 0) + r() * 1.2), m = Math.max(...z);
      const e = z.map((v) => Math.exp(v - m)), sum = e.reduce((a, b) => a + b, 0);
      return e.map((v) => v / sum);
    });
    // Forward and backward recursions over the extended target, rescaled per frame.
    const alpha: number[][] = [], beta: number[][] = Array(T);
    for (let t = 0; t < T; t++) {
      const a = EXT.map((c, s) => {
        if (!t) return s < 2 ? y[0][c] : 0;
        let v = 0;
        for (let k = 0; k < 3; k++) if (s - k >= 0 && can(s, k)) v += alpha[t - 1][s - k];
        return v * y[t][c];
      });
      const z = a.reduce((p, q) => p + q, 0);
      alpha.push(a.map((v) => v / z));
    }
    for (let t = T - 1; t >= 0; t--) {
      const b = EXT.map((c, s) => {
        if (t === T - 1) return s >= NS - 2 ? 1 : 0;
        let v = 0;
        for (let k = 0; k < 3; k++) if (s + k < NS && can(s + k, k)) v += beta[t + 1][s + k] * y[t + 1][EXT[s + k]];
        return v;
      });
      const z = b.reduce((p, q) => p + q, 0);
      beta[t] = b.map((v) => v / z);
    }
    // Occupancy: how much of the total probability passes through each cell.
    const gamma = alpha.map((a, t) => { const g = a.map((v, s) => v * beta[t][s]), z = Math.max(...g); return g.map((v) => v / z); });
    // Sample real alignments backwards in proportion to alpha.
    const pick = (w: number[]) => { let u = r() * w.reduce((a, b) => a + b, 0); return w.findIndex((v) => (u -= v) <= 0); };
    const paths = [0, 1, 2].map(() => {
      const p = [pick([alpha[T - 1][NS - 2], alpha[T - 1][NS - 1]]) + NS - 2];
      for (let t = T - 1; t > 0; t--) {
        const s = p[0], c = [0, 1, 2].map((k) => (s - k >= 0 && can(s, k) ? alpha[t - 1][s - k] : 0));
        p.unshift(s - pick(c));
      }
      return p;
    });
    // The same path with its blank between the Ks removed: the move K to K skips a blank it may not skip.
    const bad = paths[0].map((s) => (s === 6 ? 5 : s));
    return { alpha, gamma, paths, bad };
  },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const st = story(f.t, DUR), i = st.i, p = st.p;
    stepper(f, STEPS, i, p);
    const gx = compact ? 34 : 44, gw = (compact ? w - 14 : w * 0.66) - gx, gy = 40;
    const c = Math.min(gw / T, (h - (compact ? 130 : 120)) / NS), X = (t: number) => gx + (t + 0.5) * c, Y = (q: number) => gy + (q + 0.5) * c;
    EXT.forEach((k, q) => label(f, SYM[k], gx - 6, Y(q) + 3, { align: 'right', size: 9, color: k ? theme.dim : theme.faint }));
    label(f, compact ? 'FRAMES →' : 'AUDIO FRAMES →', gx, gy + NS * c + 14, { size: 9, color: theme.faint });
    // Cells: forward probabilities filling in, or path occupancy at the end.
    const cols = i === 0 ? p * T * 1.1 : T, grid = i === 3 ? s.gamma : s.alpha;
    for (let t = 0; t < Math.min(T, cols); t++) {
      const fade = Math.min(1, cols - t);
      for (let q = 0; q < NS; q++) {
        const v = Math.min(1, grid[t][q] * (i === 3 ? 1 : 2.2)) * fade;
        ctx.fillStyle = `rgba(255,255,255,${(0.04 + v * (i === 3 ? 0.7 : 0.45)).toFixed(2)})`;
        ctx.fillRect(gx + t * c + 1, gy + q * c + 1, c - 2, c - 2);
      }
    }
    // One path: polyline through its cells, then its frame labels and the collapse.
    const show = (path: number[], col: string, k: number) => {
      const n = Math.max(2, Math.ceil(k * T));
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
      path.slice(0, n).forEach((q, t) => (t ? ctx.lineTo(X(t), Y(q)) : ctx.moveTo(X(t), Y(q)))); ctx.stroke();
      const ly = gy + NS * c + (compact ? 34 : 34);
      path.forEach((q, t) => t < n && label(f, SYM[EXT[q]], X(t), ly, { align: 'center', size: compact ? 7 : 9, color: EXT[q] ? theme.fg : theme.faint }));
      if (k >= 1) label(f, `= ${collapse(path.map((q) => EXT[q]))}`, gx, ly + 22, { size: compact ? 11 : 13, color: col });
    };
    if (i === 1) { const k = Math.min(2, Math.floor(p * 3)); show(s.paths[k], theme.accent, Math.min(1, (p * 3 - k) * 1.6)); label(f, `ALIGNMENT ${k + 1} OF MANY`, compact ? gx : w * 0.7, compact ? h - 14 : 120, { color: theme.fg }); }
    if (i === 2) { show(s.bad, theme.bad, Math.min(1, p * 1.6)); label(f, 'NO BLANK BETWEEN THE Ks: THEY MERGE', compact ? gx : w * 0.7, compact ? h - 14 : 120, { color: theme.bad }); }
    if (i === 3) label(f, compact ? 'LOSS = -log Σ P(PATH)' : 'LOSS = -log Σ P(path) OVER EVERY VALID PATH', compact ? gx : w * 0.7, compact ? h - 14 : 120, { color: theme.fg });
    if (compact) return;
    // The three moves a path may make between frames.
    const rx = w * 0.7, ry = 170;
    label(f, 'TARGET  B UH K K EY S', rx, 64, { color: theme.fg });
    label(f, 'MOVES PER FRAME', rx, ry, { color: theme.fg });
    const mv: [string, number, string][] = [['STAY', 0, theme.dim], ['NEXT STATE', 1, theme.dim], ['SKIP A BLANK', 2, theme.dim]];
    mv.forEach(([n, d, col], k) => {
      const y = ry + 24 + k * 30;
      arrow(f, rx, y - 4 - d * 6, rx + 26, y - 4 + (d ? 6 : 0), col, 4);
      label(f, n, rx + 38, y);
    });
    label(f, 'ONLY BETWEEN DIFFERENT SYMBOLS', rx + 38, ry + 98, { color: theme.faint });
    label(f, '41 OUTPUTS: 40 PHONEMES + BLANK', rx, h - 40);
    label(f, 'BEST VALIDATION DISTANCE ~4.73', rx, h - 22);
  },
};
export default kind;
