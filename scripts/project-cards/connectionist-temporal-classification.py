#!/usr/bin/env python3
"""Home card for the CTC speech recognition project.

Runs a real CTC prefix beam search (beam 10 over 41 symbols, as on the project
page) and renders its search lattice in perspective. The algorithm and every
edge are genuine; the frame posteriors are synthetic and seeded, an illustration
of a network output for the phonemes of "bookcase", not output from the trained
model. The same utterance as src/diagrams/kinds/ctc-alignment.ts.

Each surviving prefix keeps two states, ends-in-blank and ends-in-phoneme, which
is why the lattice braids and merges. Orange is the ancestry of the winning
prefix, white the rest of the surviving beam, and blue the candidates pruned at
each step.

Run from the repo root:
  python3 scripts/project-cards/connectionist-temporal-classification.py
"""
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/images/project/cards/connectionist-temporal-classification.jpg'
W, H, SS = 1600, 900, 2  # final size and supersampling
RW, RH = W * SS, H * SS

# ---------------------------------------------------------------- beam search
PHONES = ('SIL AA AE AH AO AW AY B CH D DH EH ER EY F G HH IH IY JH K L M N NG '
          'OW OY P R S SH T TH UH UW V W Y Z ZH').split()
SYM = ['-'] + PHONES  # 41 outputs: 40 phonemes plus blank
assert len(SYM) == 41
IDX = {s: i for i, s in enumerate(SYM)}
BLANK = 0
BEAM = 10
# Runs of (symbol, frames) for B UH K - K EY S; K twice needs the blank between.
RUNS = [('-', 2), ('B', 2), ('-', 1), ('UH', 3), ('-', 1), ('K', 2), ('-', 2),
        ('K', 2), ('-', 1), ('EY', 4), ('-', 1), ('S', 3), ('-', 2)]
# Acoustic near-neighbours, where a real model would hesitate.
CONFUSE = {'B': ['P', 'D', 'V'], 'UH': ['UW', 'AH', 'IH'], 'K': ['G', 'T', 'P'],
           'EY': ['EH', 'IY', 'AY'], 'S': ['Z', 'SH', 'TH'], '-': ['SIL', 'HH', 'T']}


def posteriors(seed=11):
    r = np.random.default_rng(seed)
    frames = [s for s, n in RUNS for _ in range(n)]
    y = np.zeros((len(frames), 41))
    for t, s in enumerate(frames):
        z = r.random(41) * 1.6
        z[IDX[s]] += 6.2
        for c in CONFUSE.get(s, []):
            z[IDX[c]] += 1.8 + 3.6 * r.random()
        z[BLANK] += 3.4 + r.random()
        y[t] = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
    return y


def beam_search(y):
    """Prefix beam search. Returns per-step beams, kept transitions and pruned candidates."""
    beam = {(): (1.0, 0.0)}
    steps, edges, pruned = [dict(beam)], [], []
    for t in range(len(y)):
        new, moves = {}, []

        def add(pre, kind, val, parent, pkind):
            b, n = new.get(pre, (0.0, 0.0))
            new[pre] = (b + val, n) if kind == 'b' else (b, n + val)
            moves.append((parent, pkind, pre, kind, val))

        for pre, (pb, pn) in beam.items():
            add(pre, 'b', pb * y[t, BLANK], pre, 'b')
            add(pre, 'b', pn * y[t, BLANK], pre, 'n')
            for s in range(1, 41):
                p = y[t, s]
                if pre and pre[-1] == s:
                    add(pre, 'n', pn * p, pre, 'n')  # still the same phoneme
                    add(pre + (s,), 'n', pb * p, pre, 'b')  # a new copy, after a blank
                else:
                    add(pre + (s,), 'n', pb * p, pre, 'b')
                    add(pre + (s,), 'n', pn * p, pre, 'n')
        top = sorted(new.items(), key=lambda kv: -sum(kv[1]))
        kept = dict(top[:BEAM])
        z = sum(sum(v) for v in kept.values())
        beam = {k: (v[0] / z, v[1] / z) for k, v in kept.items()}
        edges.append([m[:4] + (m[4] / z,) for m in moves if m[2] in beam and m[4] > 0])
        pruned.append({k: sum(v) / z for k, v in top[BEAM:]})
        steps.append(dict(beam))
    return steps, edges, pruned


y = posteriors()
steps, edges, pruned = beam_search(y)
T = len(y)
winner = max(steps[-1], key=lambda k: sum(steps[-1][k]))
print('decoded:', ' '.join(SYM[s] for s in winner), '| frames', T)
# The deepest ancestor of the winner in each beam.
spine = [max((winner[:n] for n in range(len(winner) + 1) if winner[:n] in steps[t]), key=len) for t in range(T + 1)]


SIDES = {}


def planar_lanes(beam, sp):
    """Signed lane per prefix: tree order, so branches never cross, centred on the spine."""
    def key(p):
        return tuple((s * 2654435761) % 1000 for s in p)

    def side(p):
        # Each branch keeps the side of the spine it first left on, and sides stay balanced.
        n = next((i for i, (a, b) in enumerate(zip(p, sp)) if a != b), min(len(p), len(sp)))
        branch = p[:n + 1]
        if branch not in SIDES:
            SIDES[branch] = 1 - int(sum(SIDES.values()) * 2 >= len(SIDES))
        return SIDES[branch]

    lanes = {sp: 0.0}
    for d, sign in ((0, -1.0), (1, 1.0)):
        for i, p in enumerate(sorted((q for q in beam if q != sp and side(q) == d), key=key)):
            lanes[p] = sign * (i + 1.0)
    return lanes


lanes = [planar_lanes(steps[t], spine[t]) for t in range(T + 1)]
# Ease each prefix's lane through time so branches glide instead of jump.
for _ in range(3):
    for t in range(1, T):
        for p, v in lanes[t].items():
            a, b = lanes[t - 1].get(p, v), lanes[t + 1].get(p, v)
            lanes[t][p] = 0.25 * a + 0.5 * v + 0.25 * b if p != spine[t] else 0.0


def gap(t, p):
    return math.log(max(sum(steps[t][spine[t]]), 1e-12)) - math.log(max(sum(steps[t].get(p, (1e-12, 0))), 1e-12))


# ---------------------------------------------------------------- world and camera
DX, DZ, DY = 1.0, 0.72, 0.17
def world(t, lane, g, state=0.0):
    h = 0.62 - DY * np.clip(g, -3, 9) + state
    return np.array([(t - T / 2) * DX, h, lane * DZ])


CAM = np.array([15.5, 3.9, 9.0])
LOOK = np.array([3.9, 0.15, -0.9])
F = 1.24  # focal length, in half-widths
fw = LOOK - CAM; fw = fw / np.linalg.norm(fw)
rt = np.cross(fw, [0, 1, 0]); rt = rt / np.linalg.norm(rt)
up = np.cross(rt, fw)
FOCUS = np.linalg.norm(world(T * 0.86, 0, 0) - CAM)


def project(P):
    """World points (n,3) to pixel x, y and depth."""
    d = P - CAM
    z = d @ fw
    x = RW / 2 + F * RW / 2 * (d @ rt) / z
    y_ = RH * 0.5 - F * RW / 2 * (d @ up) / z
    return x, y_, z


# ---------------------------------------------------------------- splatting into HDR buckets
SIG = np.array([0.9, 1.6, 3.2, 6.5, 13.0]) * SS / 2
BUF = np.zeros((len(SIG), RH, RW, 3), np.float32)
FLOOR_Y = -0.15
np.seterr(all='ignore')  # Accelerate's matmul raises spurious flags on macOS


def splat(P, col, gain):
    """Deposit points P (n,3) with per-point colour and gain, blurred by distance from focus."""
    x, y_, z = project(P)
    ok = (z > 1) & (x > 2) & (y_ > 2) & (x < RW - 3) & (y_ < RH - 3)
    if not ok.any():
        return
    x, y_, z, c = x[ok], y_[ok], z[ok], col[ok] * gain[ok, None]
    coc = np.abs(z - FOCUS) / FOCUS * 5.5 * SS / 2 + 0.9 * SS / 2  # circle of confusion
    lev = np.clip(np.interp(coc, SIG, np.arange(len(SIG))), 0, len(SIG) - 1.001)
    lo = lev.astype(int); fr = lev - lo
    c = c * (FOCUS / z)[:, None] ** 1.2
    xi, yi = x.astype(int), y_.astype(int)
    fx, fy = x - xi, y_ - yi
    for dx, dy, wt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        np.add.at(BUF, (lo, yi + dy, xi + dx), c * (wt * (1 - fr))[:, None])
        np.add.at(BUF, (lo + 1, yi + dy, xi + dx), c * (wt * fr)[:, None])


def smooth(s):
    return s * s * (3 - 2 * s)


ORANGE = np.array([1.0, 0.33, 0.035])
HOT = np.array([1.0, 0.72, 0.42])
WHITE = np.array([0.82, 0.86, 0.95])
BLUE = np.array([0.22, 0.42, 0.80])


def curve(a, b, n, drop=0.0):
    s = np.linspace(0, 1, n)
    e = smooth(s)[:, None]
    p = np.empty((n, 3))
    p[:, 0] = a[0] + (b[0] - a[0]) * s
    p[:, 1:] = a[1:] + (b[1:] - a[1:]) * e[:] - np.c_[drop * s * s, 0 * s]
    return p


def edge(a, b, col, gain, drop=0.0, width=0.0):
    pa, pb = project(np.array([a, b]))[0:2]
    n = int(np.clip(np.hypot(pa[1] - pa[0], pb[1] - pb[0]) * 1.1, 8, 900))
    per = 1.0 / SS
    P = curve(a, b, n, drop)
    if width:
        n *= 30
        P = np.repeat(P, 30, axis=0) + np.random.default_rng(n).normal(0, width, (n, 3))
        per /= 30
    splat(P, np.tile(col, (n, 1)), np.full(n, gain * per))


def node(p, col, gain, r=0.05):
    """A small lit sphere: tight Gaussian of points with a hot core."""
    rng = np.random.default_rng(int(abs(p[0] * 97 + p[2] * 31 + p[1] * 13) * 100) % (2**32))
    n = int(np.clip(gain * 4000, 1400, 240000))
    v = rng.normal(0, 1, (n, 3))
    splat(p + v * r, np.tile(col, (n, 1)), np.full(n, gain / n * 45))


# ---------------------------------------------------------------- draw the lattice
STATE = {'b': 0.10, 'n': -0.10}


def pos(t, p, kind, g=None):
    return world(t, lanes[t].get(p, 0.0), gap(t, p) if g is None else g, STATE[kind])


# Time ticks on the floor, one rank line per frame, fading out sideways.
for t in range(-6, T + 7):
    n = 2200
    z = np.linspace(-13, 13, n)
    P = np.c_[np.full(n, (t - T / 2) * DX), np.full(n, FLOOR_Y), z]
    splat(P, np.tile(np.array([0.30, 0.34, 0.42]), (n, 1)), 0.16 * np.exp(-(z / 5.5) ** 2) / SS)
for lane in range(-9, 10):
    n = 3000
    x = np.linspace(-(T / 2 + 7) * DX, (T / 2 + 7) * DX, n)
    P = np.c_[x, np.full(n, FLOOR_Y), np.full(n, lane * DZ * 1.5)]
    splat(P, np.tile(np.array([0.30, 0.34, 0.42]), (n, 1)), 0.1 * np.exp(-(lane / 6) ** 2) * np.ones(n) / SS)

# Pruned candidates: short stubs leaving the beam and dropping into the dark.
for t in range(T):
    for cand, p in pruned[t].items():
        parent = cand[:-1] if cand[:-1] in steps[t] else cand
        if parent not in steps[t]:
            continue
        g = gap(t, parent)
        a = pos(t, parent, 'n', g)
        side = lanes[t].get(parent, 0.0)
        h = ((cand[-1] * 2654435761) % 1000) / 1000 if cand else 0.5
        spread = (h - 0.5) * 2 * (1 + abs(side) * 0.2)
        b = a + np.array([DX * 0.92, 0, spread * DZ * 3.4])
        w = float(np.clip(math.log10(max(p, 1e-9)) + 7.5, 0, 6)) / 6
        edge(a, b, BLUE, 0.05 + 0.34 * w ** 2.2, drop=0.25 + 0.8 * (1 - w))

# Surviving beam: both states, and the merges between them.
spine_edges = []
for t in range(T):
    for parent, pk, child, ck, v in edges[t]:
        if parent not in steps[t]:
            continue
        a, b = pos(t, parent, pk), pos(t + 1, child, ck)
        on = parent == spine[t] and child == spine[t + 1]
        if on:
            spine_edges.append((a, b, v))
            continue
        w = float(np.clip(math.log10(max(v, 1e-12)) + 6, 0, 6)) / 6
        edge(a, b, WHITE, 0.16 + 1.5 * w ** 1.7)

for t in range(T + 1):
    for p, (pb, pn) in steps[t].items():
        if p == spine[t]:
            continue
        for k, val in (('b', pb), ('n', pn)):
            if val > 0:
                w = float(np.clip(math.log10(val) + 6, 0, 6)) / 6
                node(pos(t, p, k), WHITE, 0.3 + 1.5 * w, r=0.03)

# The winning prefix's ancestry, drawn hot.
for a, b, v in spine_edges:
    w = float(np.clip(math.log10(max(v, 1e-9)) + 3, 0, 3)) / 3
    edge(a, b, ORANGE, 5 + 12.0 * w, width=0.03)
    edge(a, b, HOT, 1.2 + 3.5 * w)
for t in range(T + 1):
    pb, pn = steps[t][spine[t]]
    tot = pb + pn
    for k, val in (('b', pb), ('n', pn)):
        if val / max(tot, 1e-12) > 1e-3:
            s = 0.28 + 0.72 * (t / T)
            node(pos(t, spine[t], k), ORANGE, (2.4 + 3.2 * (val / tot) ** 0.5) * s, r=0.04)
            node(pos(t, spine[t], k), HOT, (1.2 + 1.6 * (val / tot) ** 0.5) * s, r=0.02)
end = pos(T, spine[T], max('bn', key=lambda k: steps[T][spine[T]]['bn'.index(k)]))
node(end, HOT, 90, r=0.075)
node(end, ORANGE, 60, r=0.17)

# ---------------------------------------------------------------- compose
img = np.zeros((RH, RW, 3), np.float32)
for i, s in enumerate(SIG):
    img += cv2.GaussianBlur(BUF[i], (0, 0), float(s)) * (s / SIG[0]) ** 0.7

# Bloom, wide and restrained.
small = cv2.resize(img, (RW // 4, RH // 4), interpolation=cv2.INTER_AREA)
bloom = (cv2.GaussianBlur(small, (0, 0), 7 * SS / 2) * 0.5
         + cv2.GaussianBlur(small, (0, 0), 24 * SS / 2) * 0.35
         + cv2.GaussianBlur(small, (0, 0), 70 * SS / 2) * 0.25)
img += cv2.resize(bloom, (RW, RH), interpolation=cv2.INTER_LINEAR) * 0.5

yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
u, v = (xx - RW * 0.5) / RW, (yy - RH * 0.5) / RW
ground = np.array([0.030, 0.031, 0.040], np.float32)
vig = np.exp(-(u ** 2 * 2.2 + v ** 2 * 7.0))
base = ground[None, None] * (0.72 + 0.6 * vig[..., None])

ldr = 1 - np.exp(-img * 0.8)
ldr = ldr ** (1 / 1.25)
out = base + ldr * (1 - base) * vig[..., None] ** 0.35
out = cv2.resize(out, (W, H), interpolation=cv2.INTER_AREA)
# Fine dither so the falloff does not band in eight bits.
out = out + np.random.default_rng(1).normal(0, 0.0045, out.shape).astype(np.float32)
out = np.clip(out, 0, 1)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(OUT, quality=86, subsampling=0, optimize=True)
print(OUT, os.path.getsize(OUT) // 1024, 'KB')
