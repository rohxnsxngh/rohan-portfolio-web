#!/usr/bin/env python3
"""Home card for the CNN face recognition project.

The network itself as a machined object. Reading left to right: the input
plate, the stem, three residual blocks and the embedding. Each stage is a bank
of fins that gets smaller and deeper, because the feature maps shrink while the
channels widen from 64 to 512, and graphite staples are the skip connections.
The one orange bar is the 512-d embedding, the part kept for verification.

Stage order and channel counts come from the project page. Sizes are
proportional, not to scale, and fin counts are a drawing choice.

Run from the repo root:
    python3 scripts/project-cards/face-recognition-and-verification.py
Options: --scale 0.5 --spp 64 --out /path/preview.jpg  for quick looks.
"""
import argparse

from _studio import render_card

ap = argparse.ArgumentParser()
ap.add_argument("--scale", type=float, default=1.0)
ap.add_argument("--spp", type=int, default=420)
ap.add_argument("--out", default="public/images/project/cards/face-recognition-and-verification.jpg")
args = ap.parse_args()

WHITE, ORANGE, GRAPHITE = 0, 1, 2
FIN_GAP = 0.07

#          side, fins, fin thickness, gap after, has a skip connection
STAGES = [(3.70, 5, 0.11, 0.50, False),   # stem, 64 channels
          (3.05, 7, 0.11, 0.50, True),    # block, 128
          (2.45, 9, 0.11, 0.50, True),    # block, 256
          (1.90, 12, 0.11, 0.62, True)]   # block with squeeze-and-excitation, 512

boxes = []
x = 0.0
# input: one thin plate, a 112 by 112 crop
boxes.append(((x, -2.2, 0), (x + 0.1, 2.2, 4.4), WHITE))
x += 0.1 + 0.62
for side, fins, thick, gap, skip in STAGES:
    start = x
    for _ in range(fins):
        boxes.append(((x, -side / 2, 0), (x + thick, side / 2, side), WHITE))
        x += thick + FIN_GAP
    end = x - FIN_GAP
    if skip:
        top = side + 0.28
        y = 0.0
        boxes.append(((start - 0.06, y - 0.05, 0), (start + 0.0, y + 0.05, top), GRAPHITE))
        boxes.append(((end, y - 0.05, 0), (end + 0.06, y + 0.05, top), GRAPHITE))
        boxes.append(((start - 0.06, y - 0.05, top), (end + 0.06, y + 0.05, top + 0.1), GRAPHITE))
    x = end + gap
# embedding: the vector the whole stack exists to produce
boxes.append(((x, -0.17, 0), (x + 0.34, 0.17, 3.0), ORANGE))
length = x + 0.34

camera = dict(eye=(length * 0.5 + 9.5, -24.0, 7.5), target=(length * 0.5 - 0.15, 0, 2.05),
              fl=2.95, ap=0.05, bevel=0.022)
lights = dict(
    key=((-6, -11, 11), (length * 0.5, 0, 1), 9, 6, (6.2, 6.05, 5.75)),
    rim=((length + 6, 9, 8), (length * 0.6, 0, 2), 4, 5, (1.5, 1.65, 2.0)),
)
render_card(boxes, camera, lights, args.out, spp=args.spp, scale=args.scale)
