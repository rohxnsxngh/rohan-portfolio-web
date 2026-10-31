#!/usr/bin/env python3
"""Home card for the CNN face recognition project.

An entirely synthetic mannequin head, built from a signed distance field, is
sampled into a point cloud. Its back dissolves and flows onto a unit sphere that
stands in for the 512-d embedding space, landing as one identity cluster among
others. Everything here is seeded procedural illustration: no face data, no model
output, no measurements.

Run from the repo root:
    python3 scripts/project-cards/face-recognition-and-verification.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates
from skimage.measure import marching_cubes

OUT = Path("public/images/project/cards/face-recognition-and-verification.jpg")
W, H, SS = 1600, 900, 2
RW, RH = W * SS, H * SS
rng = np.random.default_rng(11785)

ORANGE = np.array([1.0, 0.40, 0.0])
BLUE = np.array([0.376, 0.647, 0.98])
WHITE = np.array([0.93, 0.95, 1.0])


# --- signed distance field for a generic mannequin head ----------------------
def ellipsoid(p, c, r):
    # first-order bound: keeps small features from inflating under smin
    r = np.array(r)
    q = p - np.array(c)
    k0 = np.linalg.norm(q / r, axis=-1)
    k1 = np.linalg.norm(q / (r * r), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)


def capsule(p, a, b, r):
    a, b = np.array(a), np.array(b)
    ab = b - a
    t = np.clip(((p - a) @ ab) / (ab @ ab), 0, 1)
    return np.linalg.norm(p - (a + t[..., None] * ab), axis=-1) - r


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b + (a - b) * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def head_sdf(p):
    m = p.copy()
    m[..., 0] = np.abs(m[..., 0])  # bilateral symmetry is part of the mannequin look
    d = ellipsoid(m, (0, 0.30, -0.10), (0.76, 0.88, 0.92))
    d = smin(d, ellipsoid(m, (0, -0.30, 0.12), (0.60, 0.80, 0.66)), 0.30)
    d = smin(d, ellipsoid(m, (0.30, -0.70, 0.12), (0.22, 0.22, 0.36)), 0.30)  # jaw corner
    d = smin(d, ellipsoid(m, (0, -1.00, 0.50), (0.17, 0.12, 0.15)), 0.25)  # chin
    d = smin(d, ellipsoid(m, (0.40, -0.16, 0.52), (0.18, 0.16, 0.18)), 0.30)  # cheekbone
    d = smin(d, ellipsoid(m, (0, 0.30, 0.66), (0.52, 0.12, 0.12)), 0.25)  # brow
    # eye sockets, then closed lids
    d = smax(d, -ellipsoid(m, (0.29, 0.08, 0.86), (0.20, 0.12, 0.20)), 0.18)
    d = smin(d, ellipsoid(m, (0.31, 0.07, 0.56), (0.19, 0.12, 0.19)), 0.08)
    # nose
    d = smin(d, capsule(m, (0, 0.20, 0.74), (0, -0.24, 0.96), 0.055), 0.12)
    d = smin(d, ellipsoid(m, (0, -0.27, 0.95), (0.085, 0.075, 0.085)), 0.08)
    d = smin(d, ellipsoid(m, (0.095, -0.31, 0.84), (0.06, 0.055, 0.07)), 0.07)
    # lips and the mouth line
    d = smin(d, ellipsoid(m, (0, -0.565, 0.755), (0.20, 0.04, 0.09)), 0.11)
    d = smin(d, ellipsoid(m, (0, -0.665, 0.745), (0.16, 0.05, 0.09)), 0.11)
    d = smax(d, -ellipsoid(m, (0, -0.612, 0.90), (0.19, 0.006, 0.09)), 0.03)
    # ear
    d = smin(d, ellipsoid(m, (0.77, -0.04, -0.12), (0.045, 0.21, 0.12)), 0.05)
    # neck, cut off below so the form ends as a bust
    d = smin(d, capsule(m, (0, -0.7, -0.20), (0, -2.2, -0.36), 0.38), 0.25)
    return d


def sample_head(n):
    res = 300
    xs = np.linspace(-1.05, 1.05, res)
    ys = np.linspace(-2.05, 1.32, int(res * 3.37 / 2.1))
    zs = np.linspace(-1.25, 1.25, int(res * 2.5 / 2.1))
    vals = np.empty((len(xs), len(ys), len(zs)), np.float32)
    grid = np.stack(np.meshgrid(ys, zs, indexing="ij"), -1)
    for i, x in enumerate(xs):
        p = np.concatenate([np.full(grid.shape[:2] + (1,), x), grid], -1)
        vals[i] = head_sdf(p)
    spacing = (xs[1] - xs[0], ys[1] - ys[0], zs[1] - zs[0])
    v, f, nrm, _ = marching_cubes(vals, 0.0, spacing=spacing)
    v += np.array([xs[0], ys[0], zs[0]])
    # area-weighted sampling gives an even scan-like density over the surface
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    area = 0.5 * np.linalg.norm(np.cross(b - a, c - a), axis=1)
    idx = rng.choice(len(f), n, p=area / area.sum())
    u, w = rng.random(n), rng.random(n)
    s = np.sqrt(u)
    bary = np.stack([1 - s, s * (1 - w), s * w], 1)[..., None]
    tri = f[idx]
    pts = (bary * v[tri]).sum(1)
    nn = (bary * nrm[tri]).sum(1)
    nn /= np.linalg.norm(nn, axis=1, keepdims=True)
    # marching_cubes normals point toward lower values only for one gradient
    # direction, so orient them outward with the SDF itself
    probe = head_sdf(pts[:4000] + 0.02 * nn[:4000])
    if np.mean(probe) < 0:
        nn = -nn
    return pts, nn, v, f


# --- camera ------------------------------------------------------------------
CAM_Z = 13.0
FOCAL = 2750.0 * SS
CX, CY = RW / 2, RH / 2


def project(p):
    z = CAM_Z - p[..., 2]
    return CX + FOCAL * p[..., 0] / z, CY - FOCAL * p[..., 1] / z, z


def rot_y(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rot_x(a):
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


HEAD_R = rot_x(0.16) @ rot_y(-0.60)
HEAD_T = np.array([-1.72, 0.03, 0.0])
HEAD_S = 1.12
SPHERE_C = np.array([2.20, 0.0, -0.2])
SPHERE_R = 1.34


def head_to_world(p):
    return (HEAD_S * p) @ HEAD_R.T + HEAD_T


def depth_buffer(v, f):
    """Rasterise a coarse z-buffer with the mesh vertices for hidden point removal."""
    w = head_to_world(v[f].reshape(-1, 3))
    x, y, z = project(w)
    bw, bh = RW // 4, RH // 4
    ix = np.clip((x / 4).astype(int), 0, bw - 1)
    iy = np.clip((y / 4).astype(int), 0, bh - 1)
    buf = np.full((bh, bw), 1e9)
    np.minimum.at(buf, (iy, ix), z)
    from scipy.ndimage import grey_closing
    closed = grey_closing(np.where(buf > 1e8, 99.0, buf), size=3)
    return np.where(buf > 1e8, closed, np.minimum(buf, closed))


# --- splatting ---------------------------------------------------------------
LAYERS = {0.75: 0, 1.25: 1, 2.2: 2, 4.0: 3, 7.5: 4}
sigmas = list(LAYERS)
acc = [np.zeros((RH, RW, 3), np.float32) for _ in sigmas]


def splat(x, y, col, sigma):
    """Add points to the layer nearest each sigma; energy is spread by sub-pixel lerp."""
    sigma = np.broadcast_to(sigma, x.shape)
    layer = np.abs(np.log(sigma)[:, None] - np.log(sigmas)[None, :]).argmin(1)
    ok = (x > 1) & (x < RW - 2) & (y > 1) & (y < RH - 2)
    for li in range(len(sigmas)):
        m = ok & (layer == li)
        if not m.any():
            continue
        xi = x[m].astype(int)
        yi = y[m].astype(int)
        fx = (x[m] - xi)[:, None]
        fy = (y[m] - yi)[:, None]
        c = col[m]
        for dy, wy in ((0, 1 - fy), (1, fy)):
            for dx, wx in ((0, 1 - fx), (1, fx)):
                np.add.at(acc[li], (yi + dy, xi + dx), c * wx * wy)


def noise3(p, scale):
    """Cheap smooth value noise, used to make the dissolve edge organic."""
    g = gaussian_filter(np.random.default_rng(7).standard_normal((40, 40, 40)), 2.2, mode="wrap")
    g = (g - g.mean()) / g.std()
    return map_coordinates(g, (p * scale + 20).T % 40, order=1, mode="wrap")


# --- sphere ------------------------------------------------------------------
def sphere_dirs():
    """Identity cluster centres, spread by Fibonacci sampling then jittered."""
    n = 46
    i = np.arange(n) + 0.5
    phi = np.arccos(1 - 2 * i / n)
    th = np.pi * (1 + 5 ** 0.5) * i
    d = np.stack([np.cos(th) * np.sin(phi), np.cos(phi), np.sin(th) * np.sin(phi)], 1)
    d += rng.normal(0, 0.10, d.shape)
    return d / np.linalg.norm(d, axis=1, keepdims=True)


TARGET = np.array([-0.58, 0.20, 0.79])
TARGET /= np.linalg.norm(TARGET)


def on_sphere(d):
    return SPHERE_C + SPHERE_R * d


def fade_back(d):
    """Front of the sphere is bright, the far side recedes."""
    return 0.10 + 0.90 * np.clip((d[:, 2] + 0.55) / 1.3, 0, 1) ** 1.6


def cluster(c, n, spread):
    d = c + rng.normal(0, spread, (n, 3))
    return d / np.linalg.norm(d, axis=1, keepdims=True)


def draw_sphere():
    # fine latitude and longitude rings of dots: the sphere as an instrument
    tilt = rot_x(0.34) @ rot_y(0.5)
    rings = []
    for lat in np.radians(np.arange(-60, 61, 30)):
        t = rng.random(5200) * 2 * np.pi
        rings.append(np.stack([np.cos(lat) * np.cos(t), np.full_like(t, np.sin(lat)), np.cos(lat) * np.sin(t)], 1))
    for lon in np.radians(np.arange(0, 180, 30)):
        t = rng.random(6200) * 2 * np.pi
        rings.append(np.stack([np.cos(t) * np.cos(lon), np.sin(t), np.cos(t) * np.sin(lon)], 1))
    r = np.concatenate(rings) @ tilt.T
    x, y, _ = project(on_sphere(r))
    b = 0.016 * fade_back(r)
    splat(x, y, b[:, None] * WHITE, 0.75)

    # the sphere's body: sparse dust that gives it volume and a lit limb
    d = rng.normal(size=(150000, 3))
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    limb = (1 - np.abs(d[:, 2])) ** 3.0
    b = (0.003 + 0.022 * limb) * fade_back(d) * (0.4 + 0.6 * np.clip(d[:, 1] * 0.5 + d[:, 0] * -0.5 + 0.6, 0, 1))
    x, y, _ = project(on_sphere(d))
    splat(x, y, b[:, None] * WHITE, 0.75)

    # other identities
    for c in sphere_dirs():
        if np.linalg.norm(c - TARGET) < 0.62:
            continue
        n = int(rng.integers(320, 900))
        d = cluster(c, n, rng.uniform(0.022, 0.040))
        f = fade_back(d)[:, None]
        tint = BLUE if rng.random() < 0.30 else WHITE
        x, y, _ = project(on_sphere(d))
        splat(x, y, 0.20 * f * tint, 0.75 + 0.5 * rng.random())
        hx, hy, _ = project(on_sphere(c[None]))
        splat(hx, hy, 2.4 * fade_back(c[None])[:, None] * tint, 7.5)

    # the identity this head belongs to
    d = cluster(TARGET, 5200, 0.052)
    x, y, _ = project(on_sphere(d))
    splat(x, y, 0.34 * np.ones((len(d), 1)) * ORANGE, 1.25)
    hx, hy, _ = project(on_sphere(TARGET[None]))
    splat(hx, hy, np.array([[34.0, 15.0, 2.0]]), 7.5)


# --- head and its dissolve ---------------------------------------------------
def bezier(a, b, c, t):
    t = t[:, None]
    return (1 - t) ** 2 * a + 2 * t * (1 - t) * b + t ** 2 * c


def crease(p, n):
    """Ambient occlusion from the distance field at three heights above the surface."""
    a = np.zeros(len(p))
    for h, w in ((0.04, 0.5), (0.10, 0.3), (0.22, 0.2)):
        a += w * np.clip(head_sdf(p + n * h) / h, 0, 1)
    return a ** 1.5


def soft_shadow(p, n, light):
    q = p + n * 0.02
    t = np.full(len(p), 0.03)
    lit = np.ones(len(p))
    for _ in range(14):
        d = head_sdf(q + light * t[:, None])
        lit = np.minimum(lit, np.clip(9.0 * d / t, 0, 1))
        t += np.clip(d, 0.03, 0.3)
    return lit


def draw_head():
    pts, nrm, v, f = sample_head(5_200_000)
    zbuf = depth_buffer(v, f)
    w = head_to_world(pts)
    n = nrm @ HEAD_R.T
    x, y, z = project(w)

    ix = np.clip((x / 4).astype(int), 0, zbuf.shape[1] - 1)
    iy = np.clip((y / 4).astype(int), 0, zbuf.shape[0] - 1)
    visible = z < zbuf[iy, ix] + 0.09
    cam = np.array([0, 0, CAM_Z]) - w
    cam /= np.linalg.norm(cam, axis=1, keepdims=True)
    ndv = (n * cam).sum(1)
    visible &= ndv > -0.05

    key = np.array([-0.74, 0.50, 0.45]); key /= np.linalg.norm(key)
    fill = np.array([0.5, -0.1, 0.8]); fill /= np.linalg.norm(fill)
    rim = np.array([0.92, 0.12, -0.36]); rim /= np.linalg.norm(rim)
    lk = np.clip((n * key).sum(1), 0, 1) ** 1.35
    lf = np.clip((n * fill).sum(1), 0, 1) ** 2
    fres = (1 - np.clip(ndv, 0, 1)) ** 3.2
    lr = np.clip((n * rim).sum(1), 0, 1) ** 1.2 * fres

    # scan rows: the mask reads as a structured-light capture rather than a stipple
    row = 0.5 + 0.5 * np.cos(pts[:, 1] * 2 * np.pi / 0.050)
    row = row ** 5

    # occlusion and soft shadow marched through the SDF, in head space, so the
    # sockets, the nose and the mouth keep their form under the scan rows
    vis_i = np.flatnonzero(visible)
    occ = np.ones(len(pts))
    occ[vis_i] = crease(pts[vis_i], nrm[vis_i])
    shadow = np.ones(len(pts))
    shadow[vis_i] = soft_shadow(pts[vis_i], nrm[vis_i], HEAD_R.T @ key)

    # dissolve: starts at the crown and back, driven by the world position and noise
    u = -pts[:, 2] + 0.25 * pts[:, 1]  # distance behind the face, crown first
    drift = u + 0.30 * noise3(pts, 3.1) + 0.12 * noise3(pts, 9.0)
    dissolve = np.clip((drift - 0.18) / 0.62, 0, 1)
    dissolve = dissolve ** 1.2
    bust = np.clip((pts[:, 1] + 1.78) / 0.75, 0, 1) ** 1.4  # neck fades out

    base = (0.006 + 0.95 * lk * shadow + 0.12 * lf) * occ * (0.20 + 1.1 * row)
    bright = base * bust

    rim_mask = pts[:, 2] < 0.45  # no rim light in the facial creases
    keep = visible
    solid = rng.random(len(pts)) > dissolve * 0.985
    m = keep & solid
    col = (bright[m, None] * WHITE * 0.14
           + (lr[m, None] * 0.035 * ORANGE) * (bust * occ * rim_mask)[m, None])
    focus = 0.75 + 0.9 * np.clip((z[m] - z[m].min()) / 3.2, 0, 1) ** 1.5
    splat(x[m], y[m], col, focus)

    # loose points lift off the surface and run to the target cluster
    loose = np.flatnonzero(keep & ~solid)
    loose = rng.choice(loose, min(len(loose), 260000), replace=False)
    p0 = w[loose]
    goal = on_sphere(cluster(TARGET, len(loose), 0.05))
    # flow progress is biased to the start so the stream thins as it travels
    t = rng.random(len(loose)) ** 2.5
    ctrl = 0.5 * (p0 + goal) + np.array([0.0, 0.5, 0.25]) + rng.normal(0, 0.28, (len(loose), 3))
    p = bezier(p0, ctrl, goal, t)
    p += rng.normal(0, 1, p.shape) * (0.05 * np.sin(np.pi * t))[:, None]
    lx, ly, lz = project(p)
    mix = np.clip(t * 1.5, 0, 1)[:, None]
    tone = (1 - mix) * WHITE + mix * ORANGE
    e = (0.11 + 0.20 * bright[loose] + 0.10 * np.sin(np.pi * t))[:, None]
    e *= 0.7 + 0.8 * rng.random(len(loose))[:, None]
    splat(lx, ly, e * tone, 0.75 + 1.3 * rng.random(len(loose)) ** 3)


# --- composite ---------------------------------------------------------------
def composite():
    img = np.zeros((RH, RW, 3), np.float32)
    for s, a in zip(sigmas, acc):
        img += gaussian_filter(a, (s, s, 0)) * (2 * np.pi * s * s) ** 0.72
    small = img[::4, ::4]
    bloom = gaussian_filter(small, (9, 9, 0)) * 0.32 + gaussian_filter(small, (42, 42, 0)) * 0.22
    bloom = np.kron(bloom, np.ones((4, 4, 1), np.float32))[:RH, :RW]
    bloom = gaussian_filter(bloom, (3, 3, 0))
    img = img + bloom

    yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
    xn, yn = xx / RW, yy / RH
    ground = np.array([0.0048, 0.0048, 0.0072], np.float32)
    pool = np.exp(-(((xn - 0.31) / 0.34) ** 2 + ((yn - 0.46) / 0.62) ** 2))
    warm = np.exp(-(((xn - 0.68) / 0.26) ** 2 + ((yn - 0.5) / 0.5) ** 2))
    bg = ground[None, None] * (0.72 + 0.30 * pool[..., None])
    bg = bg + warm[..., None] * np.array([0.0035, 0.0014, 0.0003], np.float32)
    # tone map on the peak channel so saturated orange stays orange instead of going yellow
    peak = np.maximum(img.max(-1, keepdims=True), 1e-6)
    mapped = (1 - np.exp(-peak * 1.35)) / peak
    out = bg + img * mapped
    vign = 1 - 0.30 * (((xn - 0.5) / 0.75) ** 2 + ((yn - 0.5) / 0.62) ** 2)
    out = out * vign[..., None]

    # box downsample in float, then gamma encode with dither so the falloff never bands
    h, w = RH // SS, RW // SS
    out = out.reshape(h, SS, w, SS, 3).mean((1, 3))
    out = np.clip(out, 0, 1) ** (1 / 1.55)
    out += np.random.default_rng(3).normal(0, 0.0028, out.shape)
    return (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    draw_sphere()
    draw_head()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(composite()).save(OUT, quality=86, subsampling=0, optimize=True)
    print(OUT, OUT.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
