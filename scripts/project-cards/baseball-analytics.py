#!/usr/bin/env python3
"""Home card for the AI Umpire project. Run from the repo root:

    python3 scripts/project-cards/baseball-analytics.py

Every dot is a real held-out called pitch: its location and ball/strike call are read back
out of the six random-forest charts in public/images/project/baseball/. The orange/blue
glow behind them is the overplotted ball and strike ink of the four all-pitches charts,
warped into the same plane. The flight paths are illustrative: only their end points are data.
"""
import glob, os
import numpy as np, cv2
from scipy import ndimage as ndi

ROOT = 'public/images/project/baseball'
OUT = 'public/images/project/cards/baseball-analytics.jpg'
W, H, SS = 1600, 900, 2
RW, RH = W * SS, H * SS
X0, X1, Z0, Z1 = -3.0, 3.0, -1.0, 6.0       # chart axes, feet
GROUND = -1.05                              # floor of the chart frame
rng = np.random.default_rng(423)

# ------------------------------------------------------------------ data extraction
def axes_box(bgr):
    """Plot rectangle in pixels, from the long dark axis lines."""
    dark = bgr.max(2) < 110
    cols = np.where(dark.mean(0) > .55)[0]; rows = np.where(dark.mean(1) > .45)[0]
    return cols.min(), cols.max(), rows.min(), rows.max()

def masks(bgr):
    b, g, r = [bgr[..., i].astype(int) for i in range(3)]
    return (b > 150) & (r < 90) & (g < 90), (r > 170) & (b < 90) & (g < 90)

def centres(mask, rad, cover=.70, clear=.70):
    """Greedy disk fit: overlapping dots are peeled off one at a time, best-covered first."""
    R = int(np.ceil(rad)) + 1
    yy, xx = np.mgrid[-R:R + 1, -R:R + 1]
    disk = (xx ** 2 + yy ** 2 <= rad ** 2).astype(np.float32)
    m = mask.astype(np.float32).copy(); h, w = m.shape; out = []
    while True:
        c = cv2.filter2D(m, -1, disk, borderType=cv2.BORDER_CONSTANT)
        y, x = np.unravel_index(np.argmax(c), c.shape)
        if c[y, x] < cover * disk.sum():
            return np.array(out) if out else np.zeros((0, 2))
        Y, X = np.mgrid[0:h, 0:w]
        d2 = (X - x) ** 2 + (Y - y) ** 2
        inside = (d2 <= rad ** 2) & (m > 0)
        out.append((X[inside].mean(), Y[inside].mean()))
        m[d2 <= (rad * clear) ** 2] = 0

def to_ft(p, box):
    l, r, t, b = box
    return np.c_[X0 + (p[:, 0] - l) / (r - l) * (X1 - X0), Z1 - (p[:, 1] - t) / (b - t) * (Z1 - Z0)]

def held_out_pitches():
    balls, strikes = [], []
    for f in sorted(glob.glob(f'{ROOT}/random-forest-*.png')):
        im = cv2.imread(f); box = axes_box(im); l, r, t, b = box
        bm, rm = masks(im)
        for m in (bm, rm):                      # keep the plot area, drop the legend swatches
            m[:t + 2] = m[b - 1:] = False; m[:, :l + 2] = m[:, r - 1:] = False
            m[t: t + 42, r - 75: r] = False
        balls.append(to_ft(centres(bm, 3.0), box)); strikes.append(to_ft(centres(rm, 3.0), box))
    return np.vstack(balls), np.vstack(strikes)

def ink_fields(res=(600, 700)):
    """Mean overplotted ball / strike ink, chart frame, resampled to a common grid."""
    panels = []
    o = cv2.imread(f'{ROOT}/called-pitches-overview.jpg')
    for l, r in ((83, 603), (713, 1233), (1343, 1863)):
        panels.append((o, (l, r, 46, 720)))
    for f in glob.glob(f'{ROOT}/all-pitches-*.png'):
        im = cv2.imread(f); panels.append((im, axes_box(im)))
    A, B = np.zeros(res[::-1], np.float32), np.zeros(res[::-1], np.float32)
    for im, (l, r, t, b) in panels:
        c = im[t + 2:b - 1, l + 2:r - 1].copy()
        # the jpeg chart is softer, so its colours are thresholded by dominance
        ci = c.astype(int)
        bm = ci[..., 0] - ci[..., 2] > 70; rm = ci[..., 2] - ci[..., 0] > 70
        # legend corner
        h, w = bm.shape; bm[:int(h * .1), int(w * .68):] = False; rm[:int(h * .1), int(w * .68):] = False
        A += cv2.resize(bm.astype(np.float32), res, interpolation=cv2.INTER_AREA)
        B += cv2.resize(rm.astype(np.float32), res, interpolation=cv2.INTER_AREA)
    return A / len(panels), B / len(panels)

# ------------------------------------------------------------------ camera (feet, y towards the mound)
CAM = np.array([7.5, -6.2, 1.3]); BEAR = np.radians(-30.5); TILT = np.radians(5.6); FOCAL = 1430. * .885
TGT = CAM + np.array([np.sin(BEAR), np.cos(BEAR), np.tan(TILT)])
CX, CY = RW * .57, RH * .465                  # principal point: slides the scene right and up
fw = (TGT - CAM) / np.linalg.norm(TGT - CAM)
rt = np.cross(fw, [0, 0, 1.]); rt /= np.linalg.norm(rt)
up = np.cross(rt, fw)

def project(P):
    v = np.asarray(P, float) - CAM
    d = (v * fw).sum(1)
    return np.c_[CX + FOCAL * (v * rt).sum(1) / d, CY - FOCAL * (v * up).sum(1) / d], d

def splat(img, xy, col, wt):
    """Bilinear additive point splat (fast, for millions of samples)."""
    x, y = xy[:, 0], xy[:, 1]
    keep = (x >= 0) & (y >= 0) & (x < RW - 1) & (y < RH - 1)
    x, y, wt = x[keep], y[keep], wt[keep]
    xi, yi = x.astype(int), y.astype(int); fx, fy = x - xi, y - yi
    field = np.zeros(RW * RH)
    for dx, dy, w in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        field += np.bincount((yi + dy) * RW + xi + dx, wt * w, RW * RH)
    img += field.reshape(RH, RW, 1).astype(np.float32) * np.array(col, np.float32)

def plate_warp(tex, y=0.0):
    """Warp a chart-frame texture (x, z) onto the vertical plane at depth y."""
    h, w = tex.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst, _ = project([[X0, y, Z1], [X1, y, Z1], [X1, y, Z0], [X0, y, Z0]])
    return cv2.warpPerspective(tex, cv2.getPerspectiveTransform(src, np.float32(dst)), (RW, RH), flags=cv2.INTER_LINEAR)

def floor_rays():
    """World x,y of every pixel on the floor plane; NaN above the horizon."""
    yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
    dirs = (fw[None, None] + ((xx - CX) / FOCAL)[..., None] * rt + ((CY - yy) / FOCAL)[..., None] * up)
    t = (GROUND - CAM[2]) / dirs[..., 2]
    t[(dirs[..., 2] >= 0)] = np.nan
    return CAM[0] + t * dirs[..., 0], CAM[1] + t * dirs[..., 1], t

def poly_mask(pts3d, supersample=True):
    p, _ = project(pts3d); m = np.zeros((RH, RW), np.uint8)
    cv2.fillPoly(m, [np.int32(p * 16)], 255, cv2.LINE_AA, 4)
    return m.astype(np.float32) / 255

def hline(img, a, b, col, width=1.2):
    p, _ = project([a, b]); m = np.zeros((RH, RW), np.uint8)
    cv2.line(m, tuple(np.int32(p[0] * 16)), tuple(np.int32(p[1] * 16)), 255, max(1, round(width)), cv2.LINE_AA, 4)
    img += (m.astype(np.float32) / 255)[..., None] * np.array(col, np.float32)

COOL = np.array([.95, .36, .10])            # BGR, linear: site blue #60a5fa
HOT = np.array([.0, .15, 1.0])              # BGR, linear: #ff6600

PATH_B, PATH_S = .016, .05

def smooth(x, a, b):
    q = np.clip((x - a) / (b - a), 0, 1)
    return q * q * (3 - 2 * q)

def main():
    balls, strikes = held_out_pitches()
    print(f'{len(balls)} balls, {len(strikes)} strikes extracted')
    bink, sink = ink_fields()
    img = np.zeros((RH, RW, 3), np.float32)

    # flight paths: straight-ish gravity arcs from an illustrative release point to each real crossing
    pts = np.vstack([balls, strikes]); kind = np.r_[np.zeros(len(balls)), np.ones(len(strikes))]
    n = 2200; u = np.linspace(0, 1, n); t = (1 - (1 - u) ** 2.6)[None]    # denser near the plate
    rx = rng.normal(0, .55, len(pts))[:, None]; rz = 4.9 + rng.normal(0, .22, len(pts))[:, None]
    X = rx + (pts[:, :1] - rx) * t
    Y = np.broadcast_to(54.0 * (1 - t), X.shape)
    Z = rz + (pts[:, 1:] - rz) * t + 1.2 * 4 * t * (1 - t)
    xy, d = project(np.stack([X, Y, Z], -1).reshape(-1, 3))
    xy2 = xy.reshape(len(pts), n, 2)
    ds = np.linalg.norm(np.diff(xy2, axis=1), axis=2); ds = np.c_[ds, ds[:, -1]]    # even ink per pixel of path
    fade = (t ** 1.8 * .94 + .06) * smooth(u, .0, .12)
    wt = (ds * fade).ravel(); ks = np.repeat(kind, n)
    for k, col, g in ((0, COOL, PATH_B), (1, HOT, PATH_S)):
        m = ks == k
        splat(img, xy[m], col, wt[m] * g)
    img = cv2.GaussianBlur(img, (0, 0), 1.1) + cv2.GaussianBlur(img, (0, 0), 16) * .35

    # real ink glow in the chart plane
    s_tex = cv2.GaussianBlur(sink, (0, 0), 4) ** 1.5
    b_tex = cv2.GaussianBlur(bink, (0, 0), 7)
    img += plate_warp(s_tex)[..., None] * HOT * .045 + plate_warp(b_tex)[..., None] * COOL * .018

    # rulebook zone
    box = [[-.83, 0, 1.5], [.83, 0, 1.5], [.83, 0, 3.5], [-.83, 0, 3.5]]
    for i in range(4):
        hline(img, box[i], box[(i + 1) % 4], (.9, .9, .9), 3)

    # pitches: glowing balls in true perspective
    dots = np.zeros((RH, RW, 3), np.float32)
    for P, col, gain, rim in ((balls, COOL, 1.0, 0.), (strikes, HOT, .98, .85)):
        Q = np.c_[P[:, 0], np.zeros(len(P)), P[:, 1]]
        xy, d = project(Q); rad = FOCAL * (.056 if P is strikes else .06) / d
        for (x, y), r in zip(xy, rad):
            R = int(r * 4) + 2; xi, yi = int(x), int(y)
            if xi < R or yi < R or xi >= RW - R or yi >= RH - R: continue
            yy, xx = np.mgrid[yi - R:yi + R + 1, xi - R:xi + R + 1]
            q = ((xx - x) ** 2 + (yy - y) ** 2) / (r * r)
            core = np.exp(-q ** 2 * .7)[..., None].astype(np.float32)
            win = dots[yi - R:yi + R + 1, xi - R:xi + R + 1]
            win *= 1 - rim * np.exp(-(q / 2.1) ** 2)[..., None].astype(np.float32)    # dark gap keeps overlaps as dots
            win[:] = win * (1 - core) + core * (col + core ** 8 * .10) * gain   # strikes sit over balls
    halo = cv2.GaussianBlur(dots, (0, 0), 7) * .12 + cv2.GaussianBlur(dots, (0, 0), 40) * .10
    img += dots + halo

    # the floor: dirt lit from above the plate, mirroring the cloud faintly
    fx, fy, ft = floor_rays()
    r2 = (fx / 7) ** 2 + ((fy + .5) / 8) ** 2
    light = np.nan_to_num(np.exp(-r2 * 1.1), nan=0).astype(np.float32)
    grain = ndi.gaussian_filter(rng.standard_normal((RH, RW)).astype(np.float32), 1.0)
    grain2 = ndi.gaussian_filter(rng.standard_normal((RH // 4, RW // 4)).astype(np.float32), 2.0)
    grain = grain * 3.0 + cv2.resize(grain2, (RW, RH)) * .8
    floor = (light * (.0065 + .0030 * grain))[..., None].clip(0) * np.array([.90, .96, 1.0], np.float32)
    # chalk: batter's boxes and home plate at true dimensions
    chalk = np.zeros((RH, RW, 3), np.float32); g = GROUND
    for s in (-1, 1):
        a, b = s * .71, s * 4.71
        for p, q in (((a, -3), (b, -3)), ((b, -3), (b, 3)), ((b, 3), (a, 3)), ((a, 3), (a, -3))):
            hline(chalk, (p[0], p[1] - .7, g), (q[0], q[1] - .7, g), (.05, .05, .055), 3)
    img = img + cv2.GaussianBlur(chalk, (0, 0), 1.1) * light[..., None]
    img = img + floor
    # plate: front edge at y=0, point towards the catcher
    w = 17 / 24; e = 8.5 / 12; dp = 17 / 12
    plate = [[-w, 0, g], [w, 0, g], [w, -e, g], [0, -dp, g], [-w, -e, g]]
    pm = poly_mask(plate)
    img = img * (1 - pm[..., None])
    tex = (.92 + .05 * ndi.gaussian_filter(rng.standard_normal((RH, RW)).astype(np.float32), 1.4) * 3)
    grad = np.clip((fy + 1.5) / 1.5, 0, 1).astype(np.float32); grad = np.nan_to_num(grad)
    tint = .72 + .28 * grad
    img += (pm * tex * tint)[..., None] * np.array([.97, .98, 1.0], np.float32)
    img += cv2.GaussianBlur(pm, (0, 0), 30)[..., None] * np.array([.012, .012, .012], np.float32)

    # reflection of the zone in the dirt, under the plate
    refl = cv2.GaussianBlur(dots, (0, 0), 30)
    p0, _ = project([[0, 0, GROUND]]); y0 = p0[0, 1]
    ys = np.arange(RH); src_y = (2 * y0 - ys).astype(np.float32)
    mx, my = np.meshgrid(np.arange(RW, dtype=np.float32), src_y)
    mir = cv2.remap(refl, mx, my, cv2.INTER_LINEAR, borderValue=(0, 0, 0))
    fall = np.clip(1 - (ys - y0) / (RH * .16), 0, 1)[:, None, None] * (ys > y0)[:, None, None]
    img += mir * fall.astype(np.float32) * .06

    # finish
    img = img + np.array([.0016, .0012, .0012], np.float32)
    yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)
    vig = 1 - .6 * np.clip(((xx / RW - .5) ** 2 * 2.2 + (yy / RH - .5) ** 2 * 3.2), 0, 1)
    img *= vig[..., None]
    out = img * 1.05
    out = 1 - np.exp(-out * 1.25)             # soft shoulder, keeps orange from going yellow-white too fast
    out = out ** (1 / 1.85)
    out = cv2.resize(out, (W, H), interpolation=cv2.INTER_AREA)
    out = out * 255 + rng.uniform(-.8, .8, out.shape)      # dither against banding in the falloff
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    cv2.imwrite(OUT, np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_OPTIMIZE, 1])
    print(OUT, os.path.getsize(OUT) // 1024, 'KB')

if __name__ == '__main__':
    main()
