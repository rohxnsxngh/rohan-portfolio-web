#!/usr/bin/env python3
"""Home card for the RNN and CTC speech recognition project.

The encoder as a stepped machined block. Each terrace is a layer and each key
on it is one time step: the two BiLSTM layers keep every frame, then the two
pyramidal layers each merge adjacent pairs, so the top terrace runs at a quarter
of the frame rate, as on the project page. Orange keys on top are the steps that
emit a phoneme and white ones the CTC blanks, spelling B UH K _ K EY S with the
blank that lets the double K survive the merge.

The layer structure is real; the alignment on the top terrace is illustrative,
not model output, and the step count is a drawing choice.

Run from the repo root:
    python3 scripts/project-cards/connectionist-temporal-classification.py
Options: --scale 0.5 --spp 64 --out /path/preview.jpg  for quick looks.
"""
import argparse

from _studio import render_card

ap = argparse.ArgumentParser()
ap.add_argument("--scale", type=float, default=1.0)
ap.add_argument("--spp", type=int, default=420)
ap.add_argument("--out", default="public/images/project/cards/connectionist-temporal-classification.jpg")
args = ap.parse_args()

WHITE, ORANGE, GRAPHITE = 0, 1, 2
FRAMES = 48
LENGTH = 16.0
GAP = 0.05
RISE = 0.62
DEPTH = 1.35

# Top terrace: which of the 12 steps emit a phoneme. The rest are blanks.
EMITS = {1, 3, 5, 7, 8, 10}  # B UH K / K EY S, with a blank between the two Ks

#         keys,  depth
LAYERS = [(48, 4 * DEPTH), (48, 3 * DEPTH), (24, 2 * DEPTH), (12, 1 * DEPTH)]

boxes = []
for level, (keys, depth) in enumerate(LAYERS):
    y0 = LAYERS[0][1] - depth  # terraces step up and away from the camera
    z0, z1 = level * RISE, (level + 1) * RISE - 0.03
    pitch = LENGTH / keys
    for k in range(keys):
        x0 = k * pitch + GAP / 2
        mat = ORANGE if level == len(LAYERS) - 1 and k in EMITS else WHITE
        boxes.append(((x0, y0, z0), (x0 + pitch - GAP, LAYERS[0][1], z1), mat))

camera = dict(eye=(LENGTH * 0.5 + 8, -26, 15), target=(LENGTH * 0.5 + 0.1, 2.6, 0.9),
              fl=2.95, ap=0.05, bevel=0.012)
lights = dict(
    key=((-7, -10, 13), (LENGTH * 0.5, 2, 0), 9, 6, (5.6, 5.45, 5.2)),
    rim=((LENGTH + 8, 12, 8), (LENGTH * 0.6, 2, 1), 4, 5, (1.2, 1.3, 1.6)),
)
render_card(boxes, camera, lights, args.out, spp=args.spp, scale=args.scale)
