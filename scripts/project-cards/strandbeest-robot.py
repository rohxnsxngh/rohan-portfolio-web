#!/usr/bin/env python3
"""Home card for the Strandbeest project: the real robot, cut out of its workshop.

The source is the team's prototype photo. Its bars were traced by hand as capsules
(x0, y0, x1, y1, width in source px; a circle when both ends match). Those traces seed a
marker watershed that snaps to the real edges, then the wood is relit on near-black.
Nothing in the robot is drawn: every lit pixel comes from the photo, bar one small retouched tag.

Run from the repo root: python3 scripts/project-cards/strandbeest-robot.py
Optional: --debug DIR writes the alpha and the raw cutout there.
"""
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

SRC = Path('public/images/project/StrandbeestPrototype.webp')
OUT = Path('public/images/project/cards/strandbeest-robot.jpg')
W_OUT, H_OUT = 1600, 900
SCALE, TOP_OUT, CX_SRC = 0.66, 175, 930  # source px -> card; robot top sits 25px inside the band
TOP_SRC = 80

TIGHT = 8  # px beyond the trace the watershed may reach

FRONT=[ # hubs
(1172,165,1172,165,172),(1342,250,1342,250,140),(735,217,735,217,108),(750,660,750,660,110),
(958,852,958,852,122),(1070,848,1070,848,118),(636,975,636,975,96),(735,1316,735,1316,90),(820,1252,820,1252,80),
# bars
(735,195,1150,155,72),(1140,230,945,820,76),(1305,290,1060,830,76),(745,250,765,620,60),
(775,610,1100,235,70),(880,600,1265,270,56),(700,190,470,445,62),(440,490,625,960,40),
(740,700,650,945,62),(660,970,920,850,58),(930,890,735,1300,66),(1045,880,818,1250,52),(670,1020,725,1290,46),
(800,660,900,640,70),
]
LEFT=[(95,362,95,362,62),(207,362,207,362,60),(30,540,30,540,56),(108,845,108,845,62),(212,840,212,840,70),(322,825,322,825,76),
(305,1088,305,1088,58),(408,1058,408,1058,56),(255,440,255,440,80),(190,500,190,500,50),(150,580,150,580,56),
(110,372,250,445,34),(215,375,270,420,34),(90,395,35,520,22),(105,395,165,520,22),(30,548,215,578,36),(35,560,105,840,34),
(245,440,205,825,36),(155,590,205,800,32),(115,850,210,842,42),(120,862,300,1075,26),(215,870,305,1075,36),(240,850,405,1045,26),
(325,840,405,1050,30),(320,680,322,810,40),(95,500,190,500,0)]
GEARS=[(312,530,312,530,258),(428,588,428,588,178),(540,555,540,555,345),(712,450,712,450,110)]
ROD=[(170,547,410,545,16),(1345,598,1430,590,8)]
RIGHT=[(1432,342,1432,342,72),(1760,328,1760,328,88),(1628,382,1628,382,68),(1875,587,1875,587,76),(1580,675,1580,675,72),
(1330,770,1330,770,60),(1600,780,1600,780,60),(1365,985,1365,985,56),(1892,955,1892,955,60),(1440,920,1440,920,44),
(1432,322,1760,312,46),(1432,345,1435,565,46),(1300,400,1432,340,40),(1760,340,1465,570,48),(1628,385,1450,470,30),
(1480,590,1875,590,44),(1690,450,1850,560,42),(1740,380,1585,670,40),(1365,985,1580,680,40),(1330,770,1600,680,30),
(1330,770,1365,985,30),(1440,920,1600,780,30),(1600,780,1890,950,36),(1440,925,1890,955,40),(1880,590,1890,950,46)]

# behind the front leg, stays dimmer
BACK=[(880,250,880,250,76),(890,270,900,600,44),(620,420,870,245,50),(900,250,1270,250,44),(800,960,800,1110,40),(800,720,720,960,44),(940,640,830,950,40),(1040,600,1270,430,44),(660,520,760,640,120)]
BACKPLATE=[(1110,500,1450,560,120)]

ERASE = [
    [(461, 423), (700, 196), (600, 190), (470, 330)],  # shelf clutter above the upper left diagonal
    [(600, 180), (690, 150), (700, 190), (640, 270), (610, 300), (580, 260)],  # shelf white, upper left
    [(770, 160), (1090, 132), (1090, 90), (770, 110)],  # shelf above the top bar
    [(1150, 285), (1255, 292), (1215, 345), (1140, 345)],  # white gap between the front bars
    [(930, 519), (1028, 445), (1028, 480), (938, 557)],  # wiring seen through the frame
    [(1436, 230), (1436, 306), (1442, 312), (1450, 316), (1456, 321), (1460, 328), (1722, 312), (1736, 306),
     (1748, 298), (1758, 294), (1768, 293), (1768, 230)],  # shelf and white box above the right leg's top bar
    [(1226, 522), (1243, 526), (1248, 560), (1226, 560)],  # tag end at the plate's left edge
    [(1226, 558), (1300, 556), (1322, 556), (1338, 575), (1346, 604), (1200, 640), (1205, 600)],  # cables under the plate
]
SOLID = [
    [(765, 170), (1096, 140), (1091, 216), (765, 247)],  # top bar
    [(775, 595), (1036, 288), (1059, 356), (794, 625)],  # crank pin to top hub
    [(467, 429), (706, 202), (722, 250), (475, 474)],  # upper left diagonal
    [(1450, 329), (1460, 328), (1722, 312), (1722, 352), (1456, 361)],  # right leg's top bar
    [(1245, 526), (1330, 510), (1330, 556), (1300, 556), (1249, 558)],  # plate above the cables
]
# Patches of the photo filled from the wood around them: a red tag on the plate.
RETOUCH = [[(1235, 534), (1272, 534), (1272, 546), (1245, 560), (1233, 560)]]

# The far left leg sits on a busy shelf and its edges wander under the watershed, so inside
# FAR_ZONE the mask is this trace of the wood faces alone (burnt rear edges fall to black).
FAR_ZONE = [(0, 300), (262, 300), (262, 404), (246, 404), (246, 672), (350, 672), (350, 862), (470, 862), (470, 1415), (0, 1415)]
FAR_BARS = [
    [(100, 355), (108, 357), (176, 382), (232, 403), (224, 440), (188, 426), (108, 391), (100, 385)],  # A to C
    [(212, 345), (222, 352), (250, 368), (300, 396), (300, 404), (264, 405), (246, 396), (222, 392), (212, 385)],  # B to gear
    [(96, 400), (108, 404), (60, 540), (45, 530)],  # A to D
    [(117, 400), (132, 400), (172, 534), (158, 534)],  # A to E, wood face
    [(132, 402), (150, 412), (190, 540), (172, 540)],  # A to E, grey edge
    [(186, 428), (206, 436), (178, 486), (166, 474)],  # strut
    [(46, 532), (54, 538), (170, 560), (172, 590), (126, 584), (56, 566)],  # D to bracket
    [(145, 565), (172, 565), (172, 590), (145, 590)],  # bracket
    [(28, 560), (40, 560), (107, 815), (96, 815)],  # D to E
    [(233, 452), (250, 452), (216, 825), (200, 825)],  # C to F
    [(150, 558), (172, 558), (178, 590), (207, 738), (218, 825), (200, 825), (196, 790), (146, 590)],  # double bar to F
    [(131, 826), (198, 822), (200, 854), (140, 856), (131, 850)],  # E to F
    [(235, 797), (305, 800), (305, 836), (270, 838)],  # plate F to G
    [(290, 665), (308, 672), (318, 720), (330, 790), (312, 795), (300, 720)],  # gear to G
    [(320, 680), (339, 680), (328, 800), (308, 800)],  # upright to G
    [(134, 855), (146, 858), (282, 1040), (300, 1062), (288, 1070), (243, 1012), (140, 876)],  # foot H, outer
    [(240, 870), (256, 862), (263, 900), (280, 960), (292, 990), (304, 1052), (298, 1060), (288, 1040), (270, 968), (252, 908)],  # foot H, inner
    [(262, 853), (268, 851), (300, 900), (340, 952), (380, 996), (398, 1040), (390, 1048), (360, 1012), (320, 964), (280, 904)],  # foot J, outer
    [(350, 848), (360, 846), (374, 880), (392, 940), (404, 1020), (412, 1036), (396, 1044), (386, 1010), (370, 928)],  # foot J, inner
]
# cx, cy, rx, ry: hubs foreshortened by the camera, and the dark washers behind them
FAR_HUBS = [(97, 367, 12, 31), (208, 366, 12, 31), (238, 435, 13, 30), (30, 543, 10, 23), (109, 843, 12, 28),
            (209, 845, 13, 30), (318, 826, 12, 26), (340, 826, 22, 28), (120, 843, 12, 30), (240, 838, 22, 36), (306, 1085, 14, 27), (407, 1062, 13, 25)]


def draw(shape, items, scale=1.0, add=0):
    m = np.zeros(shape, 'uint8')
    for x0, y0, x1, y1, w in items:
        if w == 0:
            continue
        t = max(1, int(w * scale + add))
        cv2.line(m, (x0, y0), (x1, y1), 255, t)
        cv2.circle(m, (x0, y0), t // 2, 255, -1)
        cv2.circle(m, (x1, y1), t // 2, 255, -1)
    return m


def draw_far(shape):
    m = np.zeros(shape, 'uint8')
    for poly in FAR_BARS:
        cv2.fillPoly(m, [np.int32(poly)], 255)
    for cx, cy, rx, ry in FAR_HUBS:
        cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    return m


def smooth(mask, sigma):
    """Round off staircase edges: blur then re-threshold."""
    return ((cv2.GaussianBlur(mask, (0, 0), sigma) > 127) * 255).astype('uint8')


def cutout(bgr):
    shape = bgr.shape[:2]
    bars = FRONT + LEFT + RIGHT + BACK
    everything = bars + GEARS + BACKPLATE
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    hue, sat, val = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    wood = (hue >= 10) & (hue <= 32) & (sat > 18) & (sat < 125) & (val > 120)

    # Watershed seeds: bar centrelines and wood inside the gears are robot, the rest is not.
    core = draw(shape, bars, 0.3)
    core[(draw(shape, GEARS + BACKPLATE) > 0) & wood] = 255
    core = cv2.erode(core, np.ones((3, 3)))
    loose = draw(shape, everything, 1.0, 24)
    markers = np.zeros(shape, 'int32')
    markers[loose == 0] = 1
    markers[(val < 70) & (core == 0)] = 1
    markers[core > 0] = 2
    cv2.watershed(cv2.bilateralFilter(bgr, 7, 30, 5), markers)
    fg = cv2.morphologyEx(((markers == 2) * 255).astype('uint8'), cv2.MORPH_OPEN, np.ones((3, 3)))

    # Hard limits: stay near the trace, and away from hubs only wood or char survives.
    fg[draw(shape, everything, 1.0, TIGHT) == 0] = 0
    hubs = draw(shape, [b for b in FRONT + LEFT + RIGHT + BACK if b[:2] == b[2:4]])
    # Pale ply is nearly unsaturated, so reject only solid patches of clearly foreign colour;
    # the opening keeps wood grain from punching holes in the bars.
    foreign = (((hue < 5) | (hue > 40)) & (sat > 45) & (val > 60)) | ((val > 225) & (sat < 10))
    foreign = cv2.morphologyEx((foreign * 255).astype('uint8'), cv2.MORPH_OPEN, np.ones((7, 7)))
    fg[(foreign > 0) & (hubs == 0)] = 0
    # Burnt ply edges are black on the wood's far side. Keeping them adds thickness on near-black.
    rim = ((val < 80) & (draw(shape, everything, 1.0, 4) > 0)).astype('uint8') * 255
    rim = cv2.morphologyEx(rim, cv2.MORPH_OPEN, np.ones((5, 5)))
    a = cv2.max(fg, rim)
    # Hand corrections where the photo gave the watershed nothing to hold on to.
    for poly in ERASE:
        cv2.fillPoly(a, [np.int32(poly)], 0)
    for poly in SOLID:
        cv2.fillPoly(a, [np.int32(poly)], 255)
    # Below the table edge wood sits on wood, so the far legs take the trace itself.
    tabletop = np.zeros(a.shape, 'uint8')
    tabletop[862:, 1290:] = 255
    a[tabletop > 0] = draw(a.shape, RIGHT)[tabletop > 0]
    trace = draw_far(shape)
    zone = np.zeros(shape, 'uint8')
    cv2.fillPoly(zone, [np.int32(FAR_ZONE)], 255)
    a[zone > 0] = 0
    a = cv2.max(a, trace)
    # The far legs sit on same-coloured table and are soft in the photo: smooth harder there.
    far = cv2.max(draw(shape, RIGHT, 1.0, 16), cv2.dilate(trace, np.ones((17, 17))))
    front = draw(shape, FRONT + GEARS, 1.0, 6)
    a = np.where((far > 0) & (front == 0), smooth(a, 3.0), smooth(a, 1.4))
    a = cv2.max(a.astype('uint8'), draw(shape, ROD))
    return cv2.GaussianBlur(a, (0, 0), 1.0), front


def compose(bgr, alpha, front):
    h, w = bgr.shape[:2]
    a = alpha.astype('float32') / 255
    rgb = bgr[..., ::-1].astype('float32') / 255
    lin = rgb ** 2.2

    # Recover some bite from the soft phone photo before grading.
    lum0 = lin.mean(2)
    lin *= (1 + 0.45 * (lum0 - cv2.GaussianBlur(lum0, (0, 0), 4)) / (lum0 + 0.02))[..., None].clip(0.5, 1.7)

    # Depth: front leg and drive gears get the light, everything behind it steps down.
    depth = cv2.GaussianBlur((front > 0).astype('float32'), (0, 0), 2.5) * 0.62 + 0.38
    # Key light from upper left of the front leg, soft falloff to both sides.
    yy, xx = np.mgrid[0:h, 0:w].astype('float32')
    d = np.hypot((xx - 820) / 860, (yy - 430) / 780)
    pool = np.exp(-(d ** 2) * 1.5)
    # A raking direction across the frame, warm on the lit side.
    rake = np.clip(1.15 - (xx - 300) / 2100, 0.45, 1.15)
    light = (0.05 + 0.95 * pool * rake) * depth
    lit = lin * light[..., None] * np.array([1.12, 0.93, 0.72], 'float32')

    # To card space (premultiplied, area-resampled so edges stay clean).
    k = SCALE
    m = np.float32([[k, 0, W_OUT / 2 - CX_SRC * k], [0, k, TOP_OUT - TOP_SRC * k]])
    size = (W_OUT, H_OUT)
    def warp(x):
        s = 2
        big = cv2.warpAffine(x, m * np.float32([[s], [s]]), (W_OUT * s, H_OUT * s), flags=cv2.INTER_CUBIC)
        return cv2.resize(big, size, interpolation=cv2.INTER_AREA)
    pm = warp(lit * a[..., None]).clip(0, None)
    # Let the legs run down into the dark instead of stopping at the frame.
    pm *= (1 - 0.92 * np.clip((np.arange(H_OUT, dtype='float32') - 790) / 110, 0, 1) ** 1.5)[:, None, None]
    A = warp(a).clip(0, 1)

    # Ground: near-black, a faint pool of light behind the robot, then a floor glow.
    Y, X = np.mgrid[0:H_OUT, 0:W_OUT].astype('float32')
    bg = np.full((H_OUT, W_OUT, 3), 0.0011, 'float32')
    halo = np.exp(-(((X - 760) / 620) ** 2 + ((Y - 425) / 300) ** 2))
    bg += (halo * 0.0075)[..., None] * np.array([1.0, 0.62, 0.36], 'float32')
    floor = np.exp(-(((X - 760) / 640) ** 2)) * np.clip((Y - 640) / 260, 0, 1) ** 1.6 * 0.006
    bg += floor[..., None] * np.array([1.0, 0.7, 0.45], 'float32')
    # Shadow the robot casts on that glow.
    bg *= (1 - 0.8 * cv2.GaussianBlur(A, (0, 0), 16))[..., None]
    img = bg * (1 - A[..., None]) + pm

    # Filmic curve, then a trace of grain to stop banding in the dark gradients.
    img = img * 1.5
    img = (img * (2.51 * img + 0.03)) / (img * (2.43 * img + 0.59) + 0.14)
    img = img.clip(0, 1) ** (1 / 2.2)
    rng = np.random.default_rng(7)
    img += rng.normal(0, 0.0035, img.shape[:2])[..., None]
    return (img.clip(0, 1) * 255 + 0.5).astype('uint8')


def main():
    bgr = cv2.cvtColor(np.array(Image.open(SRC).convert('RGB')), cv2.COLOR_RGB2BGR)
    spot = np.zeros(bgr.shape[:2], 'uint8')
    cv2.fillPoly(spot, [np.int32(p) for p in RETOUCH], 255)
    bgr = cv2.inpaint(bgr, spot, 5, cv2.INPAINT_TELEA)
    alpha, front = cutout(bgr)
    if '--debug' in sys.argv:
        d = Path(sys.argv[sys.argv.index('--debug') + 1])
        cv2.imwrite(str(d / 'alpha.png'), alpha)
        cv2.imwrite(str(d / 'cut.png'), (bgr * (alpha[..., None] / 255.0)).astype('uint8'))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(compose(bgr, alpha, front)).save(OUT, quality=86, subsampling=0, optimize=True)
    print(OUT, OUT.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    main()
