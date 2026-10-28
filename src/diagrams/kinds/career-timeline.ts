import type { DiagramKind, Frame } from '../types';
import { clamp, easeOut, label, line } from '../draw';

// Data comes from the experience collection on /experience (see experience.astro).
interface Role { c: string; r: string; s: string; e: string | null; slug: string }
interface Bar extends Role { a: number; b: number; lane: number; x0: number; x1: number; y: number }
interface S { bars: Bar[]; lanes: number; lo: number; hi: number; hover: number; compact: boolean }

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const month = (s: string) => { const [y, m] = s.split('-').map(Number); return y * 12 + (m || 1) - 1; };
const fmt = (m: number) => `${MON[m % 12]} ${Math.floor(m / 12)}`;

const kind: DiagramKind<S> = {
  staticT: 2.2,
  settleAfter: 2.2,
  setup(f) {
    const now = new Date(), cur = now.getFullYear() * 12 + now.getMonth();
    const roles = ((f.data as Role[]) ?? []).map((r) => ({ ...r, a: month(r.s), b: r.e ? month(r.e) : cur }))
      .sort((p, q) => p.a - q.a);
    // Greedy lanes: each role takes the first lane free by its start month, so
    // overlaps stack. Phones are too narrow to label packed lanes: one role per row.
    const ends: number[] = [];
    const bars = roles.map((r, k) => {
      let lane = f.compact ? k : ends.findIndex((e) => e <= r.a);
      if (lane < 0) lane = ends.push(0) - 1;
      ends[lane] = r.b + 1;
      return { ...r, lane, x0: 0, x1: 0, y: 0 };
    });
    const lo = Math.min(...bars.map((b) => b.a)), hi = Math.max(cur, ...bars.map((b) => b.b)) + 2;
    return { bars, lanes: ends.length, lo: lo - (lo % 12), hi, hover: -1, compact: f.compact };
  },
  resize(f, s) {
    if (f.compact !== s.compact) Object.assign(s, kind.setup(f));
  },
  tap(_f, s) {
    const b = s.bars[s.hover];
    if (b) document.dispatchEvent(new CustomEvent('diagram:focus', { detail: b.slug }));
  },
  draw(f: Frame, s: S) {
    const { ctx, w, h, theme, compact, pointer } = f;
    if (!s.bars.length) return;
    const x0 = 14, x1 = w - 14, top = 58, bot = h - 30;
    const lh = (bot - top) / s.lanes, bh = Math.min(lh * 0.6, 22);
    const X = (m: number) => x0 + ((m - s.lo) / (s.hi - s.lo)) * (x1 - x0);
    // Year ticks.
    for (let y = Math.ceil(s.lo / 12); y * 12 <= s.hi; y++) {
      const x = X(y * 12);
      line(f, x, top - 6, x, bot, theme.grid);
      if (!compact || y % 2 === 0) label(f, String(y), x + 4, bot + 16, { size: 9, color: theme.faint });
    }
    line(f, x0, bot, x1, bot, theme.faint);
    // Hover is read against last frame's geometry, which matches this one once settled.
    s.hover = pointer.active ? s.bars.findIndex((b) => pointer.x >= b.x0 - 2 && pointer.x <= b.x1 + 2 && pointer.y >= b.y - 4 && pointer.y <= b.y + bh + 4) : -1;
    s.bars.forEach((b, k) => {
      const g = easeOut(clamp((f.t - k * 0.12) / 0.6));
      const bx0 = X(b.a), bx1 = bx0 + Math.max(3, (X(b.b + 1) - bx0) * g), y = top + b.lane * lh;
      Object.assign(b, { x0: bx0, x1: bx1, y });
      const on = k === s.hover, live = !b.e;
      ctx.fillStyle = on ? 'rgba(255,102,0,.35)' : live ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.08)';
      ctx.fillRect(bx0, y, bx1 - bx0, bh);
      ctx.fillStyle = on ? theme.accent : live ? theme.fg : theme.dim;
      ctx.fillRect(bx0, y, 2, bh);
      // Inside the bar when it fits, else beside it on whichever side has room.
      const name = b.c.split(/ x | Motors /)[0].toUpperCase();
      ctx.font = `${compact ? 8 : 9}px ${theme.font}`;
      const tw = ctx.measureText(name).width, inside = tw + 12 < bx1 - bx0;
      const lx = inside ? bx0 + 7 : bx1 + tw + 8 < x1 ? bx1 + 6 : bx0 - 6;
      label(f, name, lx, y + bh / 2 + 3, { size: compact ? 8 : 9, align: inside || lx > bx0 ? 'left' : 'right', color: on ? theme.accent : live ? theme.fg : theme.dim });
    });
    // NOW marker.
    const now = new Date(), nx = X(now.getFullYear() * 12 + now.getMonth() + now.getDate() / 31);
    line(f, nx, top - 10, nx, bot, theme.accent);
    label(f, 'NOW', nx - 4, top - 14, { size: 9, align: 'right', color: theme.accent });
    const hb = s.bars[s.hover];
    label(f, hb ? `${hb.c.toUpperCase()}  ·  ${hb.r.toUpperCase()}` : `${s.bars.length} ROLES  ·  OVERLAPS STACK`, 14, 18, { color: hb ? theme.fg : theme.dim });
    if (hb) label(f, `${fmt(hb.a)} TO ${hb.e ? fmt(hb.b) : 'PRESENT'}  ·  ${compact ? "TAP" : "CLICK"} TO OPEN`, 14, 32, { size: 9, color: theme.accent });
  },
};
export default kind;
