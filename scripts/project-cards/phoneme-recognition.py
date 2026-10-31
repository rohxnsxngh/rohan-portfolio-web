#!/usr/bin/env python3
"""Home card for the phoneme recognition project.

Recovers real speech features from two figures in public/images/project and mills
them into a dark sculpted slab, rendered with a small heightfield ray caster:

  IDLHW1Spectogram2.jpg  jet heatmap of 12 MFCC bands over 3.5 s, inverted to scalars
  IDLHW1Spectogram3.jpg  amplitude trace of the same clip, reduced to an envelope

The surface is (MFCC value) shaped by (amplitude envelope), so loud speech stands up
and the silences lie flat. It is an illustration of that data, not a measurement.

Run from the repo root:  python3 scripts/project-cards/phoneme-recognition.py
"""
import os
from pathlib import Path

import cv2
import numpy as np
from matplotlib import colormaps
from PIL import Image
from scipy.ndimage import gaussian_filter, gaussian_filter1d, map_coordinates, median_filter
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "public/images/project"
OUT = Path(os.environ.get("CARD_OUT", ROOT / "public/images/project/cards/phoneme-recognition.jpg"))

W, H = 1600, 900
SS = int(os.environ.get("CARD_SS", 3))          # supersampling factor
RW, RH = W * SS, H * SS

GRID_V, GRID_U = 480, 2000                      # heightfield resolution (bands, time)
SLAB_W, SLAB_D = 13.0, 6.0                      # slab footprint in world units
BASE = 0.34                                     # slab thickness under the terrain
RELIEF = 2.7                                   # tallest peak above the slab
YAW = np.radians(-4.5)
CAM = np.array([0.0, 10.0, -22.0])               # camera x, height, z
FOCAL = 1.33 * RW
HORIZON = -0.54 * RH                            # lens shift: the camera stays level
N_LINES = 36
LIGHT = np.array([-0.62, 0.30, 0.72])           # low grazing key from back left
LIGHT = LIGHT / np.linalg.norm(LIGHT)
ORANGE = np.array([1.0, 0.133, 0.0])       # linear value of #ff6600
BLUE = np.array([0.376, 0.647, 0.98])


def recover_mfcc():
    """Invert the jet heatmap back to a 12 x T scalar matrix in 0..1."""
    img = np.asarray(Image.open(SRC / "IDLHW1Spectogram2.jpg").convert("RGB"), float)
    x0, x1, y0, y1 = 27, 783, 6, 211
    plot = img[y0:y1, x0:x1]
    lut = colormaps["jet"](np.linspace(0, 1, 512))[:, :3] * 255
    _, idx = cKDTree(lut).query(plot.reshape(-1, 3))
    vals = (idx / 511).reshape(plot.shape[:2])
    vals = median_filter(vals, size=(3, 3))
    # Twelve solid rows: read each from its middle so the JPEG row seams are ignored.
    edges = np.linspace(0, vals.shape[0], 13)
    rows = [np.median(vals[int(a) + 4 : int(b) - 3], axis=0) for a, b in zip(edges[:-1], edges[1:])]
    return np.array(rows)[::-1]                  # low coefficients first


def recover_envelope(n):
    """Amplitude envelope of the waveform plot, resampled to n points over the same 3.5 s."""
    img = np.asarray(Image.open(SRC / "IDLHW1Spectogram3.jpg").convert("RGB"), float)
    blue = (img[..., 2] > 150) & (img[..., 0] < 150)
    blue[:48, 560:] = False                      # legend swatch
    x0, x1 = 85, 824
    centre = 103.5
    env = np.zeros(x1 - x0)
    for i, x in enumerate(range(x0, x1)):
        ys = np.where(blue[:, x])[0]
        if len(ys):
            env[i] = max(abs(ys.max() - centre), abs(ys.min() - centre))
    env = gaussian_filter1d(env, 3.2)
    env /= env.max()
    return np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(env)), env)


def build_field():
    m = recover_mfcc()
    env = recover_envelope(m.shape[1])
    m = gaussian_filter1d(m, 1.1, axis=1)
    # cubic in band order, so 12 stacked rows become one continuous surface
    v = np.linspace(0, m.shape[0] - 1, GRID_V)
    u = np.linspace(0, m.shape[1] - 1, GRID_U)
    vv, uu = np.meshgrid(v, u, indexing="ij")
    f = map_coordinates(m, [vv, uu], order=3, mode="nearest")
    e = np.interp(u, np.arange(len(env)), env)[None, :]
    f = np.clip(f, 0, 1)
    peak = np.clip((f - 0.26) / 0.56, 0, 1) ** 1.2
    # the back edge settles into the slab; the front edge is left as a clean cut section
    vt = np.linspace(0, 1, GRID_V)[:, None]
    margin = np.clip((1 - vt) / 0.12, 0, 1)
    margin = margin * margin * (3 - 2 * margin)
    h = (0.04 + e ** 0.62 * (0.20 + 0.80 * peak)) * margin
    h = gaussian_filter(h, (3.0, 2.2))
    energy = np.clip(e ** 0.5 * peak * 1.5, 0, 1) * margin
    return h * RELIEF + BASE, gaussian_filter(energy, 1.5)


def cast_shadows(field):
    """March each texel toward the key light through the heightfield."""
    v, u = np.mgrid[0:GRID_V, 0:GRID_U].astype(float)
    du = LIGHT[0] / SLAB_W * (GRID_U - 1)
    dv = LIGHT[2] / SLAB_D * (GRID_V - 1)
    lit = np.ones_like(field)
    for s in np.geomspace(0.02, 9.0, 70):
        ray = field + 0.01 + LIGHT[1] * s
        blocker = map_coordinates(field, [v + dv * s, u + du * s], order=1, mode="constant", cval=0)
        lit = np.minimum(lit, np.clip((ray - blocker) / (0.03 + 0.05 * s) + 0.5, 0, 1))
    return gaussian_filter(lit, 1.0)


def to_world(px, pz):
    """Slab coordinates (0..1) from world x, z."""
    cx, cz = 0.0, 0.0
    dx, dz = px - cx, pz - cz
    c, s = np.cos(YAW), np.sin(YAW)
    lx, lz = c * dx - s * dz, s * dx + c * dz
    return lx / SLAB_W + 0.5, lz / SLAB_D + 0.5


def trace(field, cam):
    """Column by column floating-horizon cast. The camera is level with a lens shift,
    so each image column is one vertical plane through the camera."""
    n = 3400
    zs = np.linspace(14.0, 31.0, n)
    pu = np.full((RH, RW), np.nan)
    pv = np.full((RH, RW), np.nan)
    py = np.zeros((RH, RW))
    pz = np.full((RH, RW), np.inf)
    wall = np.zeros((RH, RW), bool)
    sxs = (np.arange(RW) + 0.5 - RW / 2) / FOCAL
    for c, sx in enumerate(sxs):
        xs = cam[0] + sx * zs
        wz = cam[2] + zs
        u, v = to_world(xs, wz)
        inside = (u >= 0) & (u <= 1) & (v >= 0) & (v <= 1)
        if not inside.any():
            continue
        hs = np.zeros(n)
        hs[inside] = map_coordinates(field, [v[inside] * (GRID_V - 1), u[inside] * (GRID_U - 1)], order=1)
        sy = HORIZON + FOCAL * (cam[1] - hs) / zs
        run = np.minimum.accumulate(sy)
        rows = np.arange(int(np.ceil(run.min())), min(int(run.max()) + 1, RH))
        rows = rows[rows >= 0]
        if not len(rows):
            continue
        i = n - np.searchsorted(run[::-1], rows, side="right")   # first sample at or above the row
        i = np.clip(i, 1, n - 1)
        hit = inside[i] & (hs[i] > 0)
        rows, i = rows[hit], i[hit]
        a, b = sy[i - 1], sy[i]
        prev_in = inside[i - 1]
        t = np.where(prev_in & (a > b), np.clip((a - rows) / np.maximum(a - b, 1e-6), 0, 1), 1.0)
        z = zs[i - 1] + (zs[i] - zs[i - 1]) * t
        zw = cam[2] + z
        uu, vv = to_world(cam[0] + sx * z, zw)
        pu[rows, c], pv[rows, c] = uu, vv
        pz[rows, c] = z
        py[rows, c] = cam[1] - (rows - HORIZON) * z / FOCAL
        wall[rows, c] = ~prev_in
    return pu, pv, py, pz, wall


def sample(tex, u, v):
    return map_coordinates(tex, [np.nan_to_num(v) * (GRID_V - 1), np.nan_to_num(u) * (GRID_U - 1)], order=1, mode="nearest")


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def shade(field, energy, lit, g, reflection=False):
    pu, pv, py, pz, wall = g
    mask = np.isfinite(pu)
    gv, gu = np.gradient(field)
    nx = -gu / (SLAB_W / (GRID_U - 1))
    nz = -gv / (SLAB_D / (GRID_V - 1))
    # rotate slab normals into the frame the light is given in
    n = np.stack([nx, np.ones_like(nx), nz], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    ao = np.clip(0.5 + (field - gaussian_filter(field, 16)) * 2.6, 0.12, 1.0)
    # G-buffer lookups
    N = np.stack([sample(n[..., k], pu, pv) for k in range(3)], -1)
    N /= np.maximum(np.linalg.norm(N, axis=-1, keepdims=True), 1e-6)
    S = sample(lit, pu, pv)
    A = sample(ao, pu, pv)
    E = sample(energy, pu, pv)
    Ht = sample(field, pu, pv)
    view = np.stack([-pu * 0, np.full_like(py, 0.55), -np.ones_like(py)], -1)
    view /= np.linalg.norm(view, axis=-1, keepdims=True)

    diff = np.clip((N * LIGHT).sum(-1), 0, 1)
    half = LIGHT + view
    half /= np.linalg.norm(half, axis=-1, keepdims=True)
    spec = np.clip((N * half).sum(-1), 0, 1) ** 26
    rim = np.clip(1 - (N * view).sum(-1), 0, 1) ** 3.0

    grey = 0.11 * diff * (0.25 + 0.75 * S) + 0.0065 + 0.05 * spec * S
    img = np.zeros((RH, RW, 3))
    img += grey[..., None] * np.array([0.92, 0.95, 1.0]) * A[..., None]
    img += (0.018 * rim * (0.4 + 0.6 * S))[..., None] * BLUE * A[..., None]
    # heat pooled low on the peaks, as if the slab were lit from inside
    img += (0.10 * E ** 2.0 * (0.35 + 0.65 * A))[..., None] * ORANGE

    # ridgelines at constant band
    vs = np.where(mask, pv, 0.0) * N_LINES
    dv = np.abs(np.gradient(vs, axis=0)) + np.abs(np.gradient(vs, axis=1))
    dv = cv2.medianBlur(dv.astype(np.float32), 5)
    dist = np.abs((vs % 1.0) - 0.5)              # lines sit on half integers
    px_w = 0.62 * SS
    cover = 1 - smooth(px_w * 0.55, px_w * 1.1, dist / np.maximum(dv, 1e-5))
    density = 1 - smooth(0.25, 0.7, dv * px_w * 2.0)
    line = cover * density * mask * (~wall)
    speech = sample(gaussian_filter(np.clip((field - BASE) / RELIEF * 4.0, 0, 1), 6), pu, pv)
    bright = 0.055 + 0.34 * speech + 0.75 * smooth(0.04, 0.5, E) + 0.45 * S * diff * speech
    heat = smooth(0.34, 0.74, E)[..., None]
    col = (1 - heat) * np.array([0.80, 0.84, 0.95]) + heat * ORANGE * 2.6
    lines = (line * bright)[..., None] * col

    # the two walls that face the camera
    side = wall & mask
    wash = smooth(BASE * 0.05, BASE, py)
    wval = np.where(pv < 0.02, 0.0034 + 0.0062 * wash, 0.0016 + 0.0022 * wash)
    img[side] = (wval[..., None] * np.array([0.9, 0.93, 1.0]))[side]
    # machined highlight along the top arris of the front face
    edge = side & (np.abs(py - Ht) < 0.012)
    img[edge] += 0.22
    return img, lines, mask, py


def background():
    y, x = np.mgrid[0:RH, 0:RW].astype(float)
    dx = (x - RW * 0.5) / RW
    dy = (y - RH * 0.40) / RH
    bg = np.ones((RH, RW, 3)) * np.array([0.00040, 0.00040, 0.00058])
    pool = np.exp(-(dx ** 2 / 0.11 + dy ** 2 / 0.05))
    bg += pool[..., None] * np.array([0.0060, 0.0026, 0.0009])
    bg += (np.exp(-(dx ** 2 / 0.32 + dy ** 2 / 0.20)))[..., None] * np.array([0.0008, 0.0010, 0.0016])
    return bg


def tonemap(img):
    img = 1 - np.exp(-img * 1.35)
    return np.clip(img, 0, 1) ** (1 / 2.2)


def main():
    field, energy = build_field()
    lit = cast_shadows(field)

    g = trace(field, CAM)
    img, lines, mask, _ = shade(field, energy, lit, g)

    bg = background()
    shadow = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 26 * SS)
    frame = bg * (1 - 0.6 * shadow[..., None])
    frame[mask] = img[mask]

    glow = cv2.GaussianBlur(lines.astype(np.float32), (0, 0), 2.2 * SS)
    hot = lines * (lines[..., 0] > lines[..., 2] * 1.6)[..., None]   # only the orange peaks throw a halo
    halo = cv2.GaussianBlur(hot.astype(np.float32), (0, 0), 7 * SS)
    frame = frame + lines * 1.1 + glow * 0.35 + halo * 0.4

    y, x = np.mgrid[0:RH, 0:RW].astype(float)
    vig = 1 - 0.42 * smooth(0.45, 1.05, np.hypot((x / RW - 0.5) * 1.5, (y / RH - 0.5) * 1.5))
    frame *= vig[..., None]

    out = tonemap(frame)
    rng = np.random.default_rng(11)
    small = cv2.resize(out.astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)
    small = small + rng.normal(0, 0.0035, small.shape[:2])[..., None]   # dither, stops banding in the falloff
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray((np.clip(small, 0, 1) * 255 + 0.5).astype(np.uint8)).save(
        OUT, "JPEG", quality=86, subsampling=0, optimize=True, progressive=True
    )
    print(OUT, OUT.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
