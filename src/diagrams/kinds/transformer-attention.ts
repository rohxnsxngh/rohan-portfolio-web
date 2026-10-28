import type { DiagramKind, Frame } from '../types';
import { box, easeOut, label, line, rng } from '../draw';

// BPE pieces of a short utterance ("_" starts a word), each with the frames it spans.
const TOK = ['_THE', '_NIGHT', 'FALL', '_CAME', '_SLOW', 'LY', '<eos>'];
const LEN = [3, 6, 4, 5, 5, 4, 3];
// Six heads with different habits: sharp, behind, ahead, broad, word onsets, near-global.
const HEADS: [number, number, boolean][] = [[1.1, 0, false], [2, -2, false], [1.8, 2, false], [5, 0, false], [1, 0, true], [16, 0, false]];
const MEL = 12, STEP = 0.95;

interface S { T: number; spec: number[][]; att: number[][][]; avg: number[][] }

const kind: DiagramKind<S> = {
  staticT: STEP * 4.6,
  setup() {
    const r = rng(5), T = LEN.reduce((a, b) => a + b, 0) + 4;
    // Encoder frames: voiced bands for each token, quiet edges.
    const start: number[] = [];
    let at = 2;
    for (const l of LEN) { start.push(at); at += l; }
    const spec = Array.from({ length: T }, (_, j) => {
      const k = start.findIndex((s, i) => j >= s && j < s + LEN[i]);
      const f1 = 2 + ((k * 5) % 4), f2 = 6 + ((k * 3) % 5);
      return Array.from({ length: MEL }, (_, m) => (k < 0 || k === 6 ? 0.08 : 0.15 + 0.7 * Math.exp(-((m - f1) ** 2)) + 0.5 * Math.exp(-((m - f2) ** 2) / 2)) * (0.7 + 0.3 * r()));
    });
    // Cross-attention per head: softmax over frames of a Gaussian score around each token's frames.
    const att = HEADS.map(([sg, off, onset]) => TOK.map((_, i) => {
      const mu = onset ? start[i] : start[i] + LEN[i] / 2 - 0.5 + off;
      const sc = spec.map((_, j) => -((j - mu) ** 2) / (2 * sg * sg) + 0.3 * r());
      const mx = Math.max(...sc), ex = sc.map((v) => Math.exp(v - mx)), z = ex.reduce((a, b) => a + b, 0);
      return ex.map((v) => v / z);
    }));
    const avg = TOK.map((_, i) => spec.map((_, j) => att.reduce((a, hd) => a + hd[i][j], 0) / HEADS.length));
    return { T, spec, att, avg };
  },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact } = f;
    const n = TOK.length, cyc = (n + 2) * STEP, tt = f.t % cyc;
    const step = Math.min(n - 1, Math.floor(tt / STEP)), p = easeOut(Math.min(1, (tt - step * STEP) / (STEP * 0.6)));
    const done = tt >= n * STEP;
    label(f, done ? 'TRANSCRIPT COMPLETE' : `DECODE STEP ${step + 1}/${n}`, 14, 20, { color: theme.fg });
    label(f, compact ? 'Q: TOKEN  ·  K, V: AUDIO FRAMES' : 'QUERY: CURRENT TOKEN  ·  KEYS, VALUES: ENCODER FRAMES', 14, 36);

    // Left: tokens on top, encoder frames below, cross-attention between them.
    const lw = compact ? w - 28 : w * 0.56, x0 = 14, fw = lw / s.T;
    const ty = compact ? 70 : 92, sy = compact ? h * 0.36 : h * 0.62, sh = compact ? 42 : 70;
    for (let i = 0; i <= step; i++) {
      const x = x0 + (lw * (i + 0.5)) / n;
      label(f, TOK[i], x, ty, { align: 'center', size: compact ? 9 : 11, color: i === step && !done ? theme.accent : theme.fg });
    }
    // Spectrogram of the encoded frames (after the strided-conv time reduction).
    for (let j = 0; j < s.T; j++) for (let m = 0; m < MEL; m++) {
      ctx.fillStyle = `rgba(255,255,255,${(s.spec[j][m] * 0.6).toFixed(2)})`;
      ctx.fillRect(x0 + j * fw, sy + sh - ((m + 1) * sh) / MEL, fw - 1, sh / MEL - 1);
    }
    label(f, 'ENCODER OUTPUT, ONE COLUMN PER FRAME', x0, sy + sh + 16);
    if (!done) {
      const qx = x0 + (lw * (step + 0.5)) / n, row = s.avg[step];
      for (let j = 0; j < s.T; j++) {
        const a = Math.min(1, row[j] * 5) * p;
        if (a < 0.03) continue;
        ctx.strokeStyle = `rgba(255,102,0,${a.toFixed(2)})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(qx, ty + 8); ctx.bezierCurveTo(qx, (ty + sy) / 2, x0 + (j + 0.5) * fw, (ty + sy) / 2, x0 + (j + 0.5) * fw, sy - 2); ctx.stroke();
        ctx.fillStyle = `rgba(255,102,0,${a.toFixed(2)})`; ctx.fillRect(x0 + j * fw, sy - 4, fw - 1, 2);
      }
    }

    // Right (or below): one heat map per head, rows are tokens, columns frames.
    const gx = compact ? 14 : w * 0.62, gw = compact ? (w - 28 - 5 * 6) / 6 : (w * 0.36 - 16) / 3;
    const gy = compact ? sy + sh + 34 : 60, gh = compact ? gw * 0.9 : h * 0.2;
    s.att.forEach((hd, k) => {
      const hx = gx + (compact ? k : k % 3) * (gw + (compact ? 6 : 8)), hy = gy + (compact ? 0 : Math.floor(k / 3) * (gh + 26));
      box(f, hx, hy, gw, gh, theme.faint);
      for (let i = 0; i <= (done ? n - 1 : step); i++) for (let j = 0; j < s.T; j++) {
        const a = Math.min(1, hd[i][j] * 3) * (i === step && !done ? p : 1);
        if (a < 0.04) continue;
        ctx.fillStyle = `rgba(255,${i === step && !done ? 102 : 255},${i === step && !done ? 0 : 255},${a.toFixed(2)})`;
        ctx.fillRect(hx + (j * gw) / s.T, hy + (i * gh) / n, gw / s.T, gh / n);
      }
      label(f, `HEAD ${k + 1}`, hx, hy + gh + 12, { size: 9, color: theme.faint });
    });

    // Decoder self-attention: the causal mask lets token i see tokens 0..i only.
    const my = compact ? gy + gh + 30 : gy + 2 * (gh + 26) + 8, ms = compact ? Math.min(90, h - my - 60) : Math.min(h - my - 70, gh * 1.4), mx = gx;
    const c = ms / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = mx + j * c, y = my + i * c;
      if (j > i) { line(f, x + 1, y + c - 1, x + c - 1, y + 1, 'rgba(255,255,255,.12)'); continue; }
      const cur = i === step && !done && i <= step;
      ctx.fillStyle = i > step && !done ? 'rgba(255,255,255,.04)' : cur ? `rgba(255,102,0,${(0.25 + 0.6 / (i - j + 1)).toFixed(2)})` : `rgba(255,255,255,${(0.12 + 0.35 / (i - j + 1)).toFixed(2)})`;
      ctx.fillRect(x + 0.5, y + 0.5, c - 1, c - 1);
    }
    box(f, mx, my, ms, ms, theme.faint);
    label(f, 'CAUSAL SELF-ATTENTION', mx + ms + 12, my + 10, { color: theme.fg });
    label(f, 'UPPER TRIANGLE MASKED:', mx + ms + 12, my + 26);
    label(f, 'NO TOKEN SEES THE FUTURE', mx + ms + 12, my + 40);

    // Model and decoding results.
    const fy = h - 14;
    label(f, compact ? '3+3 LAYERS · 6 HEADS · d 384' : '3 ENCODER + 3 DECODER LAYERS  ·  6 HEADS × 64 = d_model 384  ·  5,000 BPE TOKENS', 14, fy);
    if (!compact) {
      const bx = 14, by = sy + sh + 40;
      [['GREEDY', 14.3], ['BEAM 5', 12.5], ['BEAM 10', 11.6]].forEach(([nm, v], k) => {
        const y = by + k * 18, bw = ((v as number) / 15) * (lw * 0.5);
        ctx.fillStyle = k === 2 ? theme.accent : 'rgba(255,255,255,.3)'; ctx.fillRect(bx + 70, y - 6, bw, 4);
        label(f, nm as string, bx, y);
        label(f, `~${v}% CER`, bx + 78 + bw, y, { color: k === 2 ? theme.accent : theme.dim });
      });
    }
  },
};
export default kind;
