#!/usr/bin/env python3
"""Home card for the LiDAR Maze Robot project. Run from the repo root:

    python3 scripts/project-cards/lidar-maze-robot.py [--samples 400] [--out path.jpg]

The robot is rebuilt in three.js from the proportions of the CAD render in
public/images/project/MazeBotModel.png (the source is too small to relight). The maze
is illustrative: a pegboard floor and pinned walls, as the project planned. The scan
is a real 2D ray cast, 720 rays at 0.5 degree from the sensor against those walls, so
shadowed wall gets no returns; rays and returns dim with range and grazing incidence. Each sample jitters the camera and the lights, and the
samples average into a soft-shadowed HDR frame, which is graded here in numpy.
"""
import argparse, base64, json, pathlib
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
W, H = 1600, 900

PAGE = r"""<!doctype html><html><body style="margin:0;background:#000"><canvas id=c></canvas>
<script type=importmap>{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type=module>
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = 1600, H = 900;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: false, preserveDrawingBuffer: true });
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0, 0, 0);
const camera = new THREE.PerspectiveCamera(CAM.fov, W / H, 1, 900);
camera.position.set(...CAM.pos); camera.lookAt(...CAM.look);

// ---------- materials ----------
const std = (c, rough = 0.55, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, ...extra });
const M = {
  body: std(0x737480, 0.46), bodyDark: std(0x83858f, 0.5), wheel: std(0xa6a8b6, 0.38), tire: std(0x7b7d8a, 0.42),
  black: std(0x111114, 0.34), plate: std(0x5c5d63, 0.42, 0.3), steel: std(0x9c9c9c, 0.32, 0.65), post: std(0x08080a, 0.4),
  gold: std(0xc99a3a, 0.3, 0.9), pcb: std(0x2a2c30, 0.5), conn: std(0xc4c0b0, 0.5), comp: std(0xa8a8ac, 0.42), cap: std(0x6f6a5c, 0.36, 0.4),
  wall: std(0x3a3b44, 0.55), wallTop: std(0x6a6d7a, 0.5), jetson: std(0x5a5b66, 0.55), seam: std(0x101013, 0.6),
};
const R = new THREE.Group();
const add = (mesh, x, y, z, p = R) => { mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; p.add(mesh); return mesh; };
const box = (w, h, d, r, m, x, y, z, p) => add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m), x, y, z, p);
const cyl = (r, h, m, x, y, z, p, seg = 48) => add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m), x, y, z, p);

// ---------- robot, dimensions in cm read off the CAD render ----------
const L = 12, D = 9.6, base = 3.7, mid = 8.1, top = 12.6;
const lathe = (pts, m, x, y, z, p) => add(new THREE.Mesh(new THREE.LatheGeometry(pts.map(q => new THREE.Vector2(...q)), 96), m), x, y, z, p);
// three plates: rounded base, mid deck, top deck
box(L, 0.42, D, 0.12, M.body, 0, base, 0);
box(L + 0.2, 0.42, D, 0.1, M.body, 0, mid, 0);
box(L + 0.5, 0.42, D + 0.3, 0.1, M.body, 0.1, top, 0);
// standoffs between base and mid deck
for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) cyl(0.3, mid - base, M.bodyDark, sx * (L / 2 - 0.75), (mid + base) / 2, sz * (D / 2 - 0.75));
for (const sx of [-1, 1]) for (const sz of [-1, 1]) if (sx > 0 || sz > 0) box(0.5, top - mid, 0.5, 0.06, M.body, sx * (L / 2 - 0.28), (mid + top) / 2, sz * (D / 2 - 0.28));
// far end panel and side panel of the upper bay, the Jetson's end plate
box(0.28, top - mid, D - 0.8, 0.05, M.bodyDark, L / 2 - 0.2, (top + mid) / 2, 0);
box(0.32, top - base + 0.6, D, 0.05, M.body, -L / 2 + 0.1, (top + base) / 2 - 0.1, 0);
box(L - 7, top - mid, 0.26, 0.04, M.bodyDark, L / 2 - (L - 7) / 2 - 0.1, (top + mid) / 2, -D / 2 + 0.2);
// Jetson Nano enclosure hung off the end of the frame
box(3.1, 7.9, D - 0.7, 0.1, M.jetson, -L / 2 - 1.75, base + 3.85, -0.1);
box(1.4, 0.34, D - 0.7, 0.05, M.bodyDark, -L / 2 - 0.65, top - 0.8, -0.1);
// its panel: a cover seam, screws, a vent bank and a port row on the outer face, a seam on the front
{ const fx = -L / 2 - 3.3, fz = 4.35, cz = -0.1;
  box(0.06, 0.09, D - 1.5, 0.02, M.seam, fx, base + 2.5, cz);
  box(0.06, 5.0, 0.09, 0.02, M.seam, fx, base + 5.1, cz + 1.2);
  for (const [y, z] of [[0.7, 3.7], [0.7, -3.9], [7.2, 3.7], [7.2, -3.9]]) { const n = cyl(0.17, 0.08, M.steel, fx, base + y, z, undefined, 16); n.rotation.z = Math.PI / 2; }
  for (let i = 0; i < 7; i++) box(0.06, 0.14, 2.5, 0.02, M.seam, fx, base + 3.3 + i * 0.58, cz - 1.9);
  for (let i = 0; i < 3; i++) box(0.08, 0.62, 0.95, 0.02, M.seam, fx, base + 3.6 + i * 0.95, cz + 2.8);
  box(0.09, 0.42, 1.5, 0.02, M.steel, fx, base + 1.25, cz + 2.2);
  box(0.09, 0.42, 1.5, 0.02, M.seam, fx, base + 1.25, cz - 0.1);
  box(3.1, 0.09, 0.06, 0.02, M.seam, -L / 2 - 1.75, base + 5.6, fz);
  box(0.09, 2.2, 0.06, 0.02, M.seam, -L / 2 - 1.75, base + 2.4, fz);
  for (let i = 0; i < 4; i++) box(1.6, 0.13, 0.06, 0.02, M.seam, -L / 2 - 1.75, base + 6.2 + i * 0.36, fz); }
// batteries on the base plate
box(4.1, 3.3, 3.5, 0.08, M.bodyDark, -3.2, base + 1.86, 1.3);
box(4.1, 3.3, 3.5, 0.08, M.bodyDark, 2.9, base + 1.86, 1.4);
box(4.1, 3.3, 3.0, 0.08, M.bodyDark, -0.2, base + 1.86, -2.2);
// ODrive board and its four tall connectors
const pcb = new THREE.Group(); pcb.position.set(-3.4, mid + 1.1, 1.0); R.add(pcb);
box(4.4, 0.14, 3.2, 0.03, M.pcb, 0, 0, 0, pcb);
for (const [x, z] of [[-1.5, -1.0], [-0.3, -0.5], [0.8, -0.1], [-0.6, 0.9]]) box(1.25, 1.75, 1.0, 0.05, M.conn, x, 0.95, z, pcb);
for (let i = 0; i < 26; i++) box(0.22 + rnd() * .2, 0.1 + rnd() * .16, 0.2 + rnd() * .2, 0.02, rnd() > .5 ? M.comp : M.steel, -2 + rnd() * 4, 0.14, -1.4 + rnd() * 2.8, pcb);
cyl(0.42, 0.6, M.cap, -0.3, -0.36, 1.1, pcb);
for (const [x, z] of [[-2, -1.4], [2, -1.4], [-2, 1.4], [2, 1.4]]) cyl(0.09, 1.0, M.steel, x, -0.55, z, pcb, 12);
// step-down converter
const sd = new THREE.Group(); sd.position.set(2.7, mid + 1.05, 0.7); R.add(sd);
box(4.0, 0.12, 2.2, 0.03, M.pcb, 0, 0, 0, sd);
for (const [w, h, d, x, z] of [[.8, .7, .7, -1.3, -.3], [.7, .9, .9, 1.1, .3], [.6, .55, .6, -.5, .4], [.9, .6, .7, .1, -.5], [.5, .4, .5, 1.3, -.6]]) box(w, h, d, 0.04, M.comp, x, 0.06 + h / 2, z, sd);
cyl(0.36, 0.9, M.cap, -0.2, 0.5, 0.5, sd);
for (const [x, z] of [[-1.8, -.9], [1.8, -.9], [-1.8, .9], [1.8, .9]]) cyl(0.08, 0.9, M.steel, x, -0.5, z, sd, 12);
// drive: motor block under the base, wheels on the axle
box(3.2, 1.6, 6, 0.12, M.bodyDark, 0.2, base - 0.95, 0);
for (const s of [1, -1]) {
  const w = new THREE.Group(); w.position.set(0.5, 3.6, s * (D / 2 + 1.0)); R.add(w);
  const tire = cyl(3.6, 1.5, M.tire, 0, 0, 0, w, 128); tire.rotation.x = Math.PI / 2;
  const pts = [[0, .78], [3.05, .78], [3.1, .84], [3.42, .84], [3.6, .7]];
  for (const f of [1, -1]) { const face = lathe(pts.map(([a, b]) => [a, b * f]), M.wheel, 0, 0, 0, w); face.rotation.x = Math.PI / 2; }
  const hub = cyl(0.2, 0.3, M.steel, 0, 0, s * 0.86, w, 32); hub.rotation.x = Math.PI / 2;
}
// RPLidar A1: stepped mast, mounting plate, black scanner puck
const lx = 0.2, lz = 0.1, plateY = top + 3.1, puckY = plateY + 0.32;
cyl(1.28, 2.3, M.steel, lx + 0.9, top + 1.35, lz + 1.1);
cyl(1.3, 0.3, M.plate, lx + 0.9, top + 2.65, lz + 1.1);
for (const [x, z] of [[-2.1, 1.3], [2.5, -0.4], [-1.4, -1.9]]) cyl(0.22, 3.0, M.post, lx + x, top + 1.5, lz + z, undefined, 16);
const shape = new THREE.Shape(); shape.absarc(0, 0, 3.55, Math.PI * 0.82, Math.PI * 2.2, false);
shape.quadraticCurveTo(4.05, -2.0, 3.1, -3.0); shape.quadraticCurveTo(2.5, -3.4, 1.6, -3.1); shape.lineTo(-3.1, -1.6);
const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.44, bevelEnabled: true, bevelSize: .07, bevelThickness: .07, bevelSegments: 3, curveSegments: 64 }), M.plate);
plate.rotation.x = -Math.PI / 2; add(plate, lx, plateY - 0.22, lz);
lathe([[0, 2.35], [2.2, 2.35], [2.62, 2.27], [2.82, 2.05], [2.9, 1.8], [2.92, 0], [0, 0]].reverse(), M.black, lx, puckY, lz);
cyl(0.62, 0.42, M.black, lx + 2.25, plateY + 0.4, lz + 2.35, undefined, 32);
cyl(0.2, 0.1, M.gold, lx + 2.25, plateY + 0.65, lz + 2.35, undefined, 24);
for (let a = 0; a < 4; a++) cyl(0.09, 0.05, M.plate, lx + Math.cos(a * 1.57 + .6) * 1.9, puckY + 2.35, lz + Math.sin(a * 1.57 + .6) * 1.9, undefined, 12);
R.rotation.y = ROBOT.yaw; scene.add(R);
const scanH = puckY + 1.05;

// ---------- maze: walls pinned into a pegboard, wall list is [x0,z0,x1,z1] on a grid ----------
const T = 1.1, WH = 20;
const segs = [];
for (const [a, b, c, d] of WALLS) {
  const len = Math.hypot(c - a, d - b) + T, g = new RoundedBoxGeometry(c === a ? T : len, WH, c === a ? len : T, 2, 0.18);
  add(new THREE.Mesh(g, M.wall), (a + c) / 2, WH / 2, (b + d) / 2, scene);
  // a lighter top face, so the walls read as a plan from above
  add(new THREE.Mesh(new THREE.BoxGeometry(c === a ? T : len, 0.08, c === a ? len : T), M.wallTop), (a + c) / 2, WH + 0.03, (b + d) / 2, scene);
  const dx = c === a ? T / 2 : 0, dz = c === a ? 0 : T / 2, ex = c === a ? 0 : T / 2, ez = c === a ? T / 2 : 0;
  const q = [[a - ex - dx, b - ez - dz], [c + ex - dx, d + ez - dz], [c + ex + dx, d + ez + dz], [a - ex + dx, b - ez + dz]];
  for (let i = 0; i < 4; i++) segs.push([...q[i], ...q[(i + 1) % 4]]);
}
// ---------- the scan: one revolution at 0.5 degree, first wall hit per ray ----------
const O = new THREE.Vector3(lx, scanH, lz).applyMatrix4(new THREE.Matrix4().makeRotationY(ROBOT.yaw));
const RANGE = 240, hits = [], NR = 720;
for (let k = 0; k < NR; k++) {
  const a = (k + 0.37) / NR * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
  let best = RANGE, hit = false, nx = 0, nz = 1;
  for (const [ax, az, bx, bz] of segs) {
    const ex = bx - ax, ez = bz - az, den = dx * ez - dz * ex; if (Math.abs(den) < 1e-9) continue;
    const t = ((ax - O.x) * ez - (az - O.z) * ex) / den, u = ((ax - O.x) * dz - (az - O.z) * dx) / den;
    if (t > 0.5 && u >= 0 && u <= 1 && t < best) { best = t; hit = true; const l = Math.hypot(ex, ez); nx = -ez / l; nz = ex / l; if (nx * dx + nz * dz > 0) { nx = -nx; nz = -nz; } }
  }
  hits.push({ a, t: best, hit, nx, nz, x: O.x + dx * best, z: O.z + dz * best, incid: Math.abs(nx * dx + nz * dz) });
}
// Two falloffs shape everything drawn for the scan. +z faces the camera, so the fan's near side dissolves
// by bearing instead of ending on a line, and everything dims with range.
const sstep = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const bearing = a => 1 - sstep(SCAN.nearFrom, SCAN.nearTo, Math.sin(a));
const rangeFade = t => Math.exp(-t / SCAN.rangeFall);
const rayPos = [], rayCol = [];
const A = new THREE.Color(...SCAN.ray), Bc = new THREE.Color(...SCAN.rayFar);
hits.forEach((h, k) => {
  if (k % SCAN.rayEvery) return;
  const n = 24, gain = bearing(h.a), jit = 0.7 + 0.3 * rnd(); if (gain <= 0) return;
  for (let i = 0; i < n; i++) {
    const t0 = 3 + (h.t - 3) * i / n, t1 = 3 + (h.t - 3) * (i + 1) / n;
    for (const t of [t0, t1]) {
      const f = t / h.t, fade = gain * jit * SCAN.rayGain * rangeFade(t) * (0.3 + 0.7 * Math.pow(1 - f, 0.6));
      rayPos.push(O.x + Math.cos(h.a) * t, scanH, O.z + Math.sin(h.a) * t);
      const c = A.clone().lerp(Bc, f); rayCol.push(c.r * fade, c.g * fade, c.b * fade);
    }
  }
});
const rg = new THREE.BufferGeometry();
rg.setAttribute('position', new THREE.Float32BufferAttribute(rayPos, 3));
rg.setAttribute('color', new THREE.Float32BufferAttribute(rayCol, 3));
window.rays = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); scene.add(window.rays);
// Faint sheet that keeps the fan legible at thumbnail size once single rays average out. Radial rings carry the range falloff.
{ const p = [], c = [], idx = [], rings = 14;
  for (let k = 0; k < NR; k++) { const h = hits[k], g = bearing(h.a);
    for (let r = 0; r <= rings; r++) { const t = 3 + (h.t - 3) * r / rings, e = g * rangeFade(t) * (1 - Math.pow(r / rings, 3));
      p.push(O.x + Math.cos(h.a) * t, scanH, O.z + Math.sin(h.a) * t); c.push(SCAN.sheet[0] * e, SCAN.sheet[1] * e, SCAN.sheet[2] * e); } }
  const v = (k, r) => (k % NR) * (rings + 1) + r;
  for (let k = 0; k < NR; k++) for (let r = 0; r < rings; r++) idx.push(v(k, r), v(k + 1, r), v(k + 1, r + 1), v(k, r), v(k + 1, r + 1), v(k, r + 1));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.setIndex(idx);
  window.sheet = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })); scene.add(window.sheet); }
// Returns: fine points on the wall surface, weaker with range and grazing incidence, with a little range noise and dropout.
{ const geo = new THREE.SphereGeometry(SCAN.dot, 10, 6), keep = hits.filter(h => h.hit && bearing(h.a) > 0 && rnd() > 0.1 + 0.5 * (1 - h.incid));
  keep.forEach(h => { h.power = bearing(h.a) * (SCAN.hitFloor + (1 - SCAN.hitFloor) * rangeFade(h.t)) * (0.35 + 0.65 * h.incid); const j = (rnd() - .5) * 0.5; h.x += Math.cos(h.a) * j; h.z += Math.sin(h.a) * j; });
  const hc = new THREE.Color(...SCAN.hit), sc0 = new THREE.Color(...SCAN.spillColor), col = new THREE.Color();
  const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), keep.length), m4 = new THREE.Matrix4();
  keep.forEach((h, i) => { m4.setPosition(h.x, scanH, h.z); im.setMatrixAt(i, m4); im.setColorAt(i, col.copy(hc).multiplyScalar(h.power)); }); scene.add(im); window.dots = im;
  // Each return spills a little light on the wall that made it, so unscanned wall stays dark.
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, '#fff'); r.addColorStop(.25, '#888'); r.addColorStop(.6, '#1c1c1c'); r.addColorStop(1, '#000'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const sp = new THREE.InstancedMesh(new THREE.PlaneGeometry(SCAN.spill, SCAN.spill), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), keep.length);
  const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 0, 1), sc = new THREE.Vector3(1, 1, 1);
  keep.forEach((h, i) => { q.setFromUnitVectors(up, new THREE.Vector3(h.nx, 0, h.nz)); m4.compose(new THREE.Vector3(h.x + h.nx * .02, scanH - 1, h.z + h.nz * .02), q, sc); sp.setMatrixAt(i, m4); sp.setColorAt(i, col.copy(sc0).multiplyScalar(h.power)); }); scene.add(sp); }
// Laser window: thin warm line around the puck at the scan plane.
{ const g = new THREE.TorusGeometry(2.94, 0.035, 8, 128); g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(...SCAN.ring), toneMapped: false })); m.position.copy(O); scene.add(m); window.ring = m; }

// ---------- pegboard floor ----------
const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x2 = cv.getContext('2d');
x2.fillStyle = '#fff'; x2.fillRect(0, 0, 512, 512); x2.fillStyle = '#000';
x2.beginPath(); x2.arc(256, 256, 62, 0, 7); x2.fill();
const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(160, 160); tex.anisotropy = 16; tex.colorSpace = THREE.SRGBColorSpace;
const floorM = std(0x2a2b31, 0.48, 0, { map: tex, transparent: true, opacity: FLOOR.opacity });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), floorM);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.renderOrder = -1; scene.add(floor);  // drawn before the additive scan, or it paints over the rays

// ---------- lights: two jittered area lights plus a shadowed dome ----------
const sun = (i) => { const l = new THREE.DirectionalLight(0xffffff, i); l.castShadow = true; l.shadow.mapSize.set(4096, 4096);
  Object.assign(l.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 500 }); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.05; scene.add(l); scene.add(l.target); return l; };
const key = new THREE.SpotLight(...LIGHT.key); key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.camera.near = 10; key.shadow.camera.far = 400; key.shadow.bias = -0.0002; key.angle = LIGHT.keyAngle; key.penumbra = 1; key.decay = 0; scene.add(key); key.target.position.set(0, 15, 0); scene.add(key.target);
const rim = new THREE.SpotLight(...LIGHT.rim); rim.castShadow = true; rim.shadow.mapSize.set(2048, 2048); rim.shadow.camera.near = 10; rim.shadow.camera.far = 400; rim.angle = 0.11; rim.penumbra = 1; rim.decay = 0; scene.add(rim); rim.target.position.set(0, 12, 0); scene.add(rim.target);
const fill = new THREE.DirectionalLight(0xfff2e6, LIGHT.fill); fill.position.set(-30, 12, 100); scene.add(fill);
const warm = new THREE.PointLight(0xff6a18, LIGHT.warm, 0, 2); warm.position.set(O.x, scanH, O.z); warm.castShadow = true; warm.shadow.mapSize.set(1024, 1024); warm.shadow.camera.near = 3.2; warm.shadow.camera.far = 60; warm.shadow.bias = -0.002; scene.add(warm);
const dome = sun(LIGHT.dome); dome.color.setRGB(...LIGHT.domeColor);

// ---------- accumulate ----------
const opts = { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false };
const frame = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
let acc = [new THREE.WebGLRenderTarget(W, H, opts), new THREE.WebGLRenderTarget(W, H, opts)];
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  uniforms: { a: { value: null }, b: { value: null }, k: { value: 0 } }, depthTest: false, depthWrite: false,
  vertexShader: 'varying vec2 u; void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader: 'varying vec2 u; uniform sampler2D a,b; uniform float k; void main(){vec4 p=texture2D(a,u),c=texture2D(b,u);bool bad=!(c.r==c.r&&c.g==c.g&&c.b==c.b)||max(c.r,max(c.g,c.b))>64.;gl_FragColor=mix(p,bad?p:c,k);}',
}));
const qs = new THREE.Scene(); qs.add(quad); const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
window.renderCard = async (N) => {
  for (let i = 0; i < N; i++) {
    const u = halton(i + 1, 2), v = halton(i + 1, 3), p = halton(i + 1, 5), q = halton(i + 1, 7);
    camera.setViewOffset(W, H, u - .5, v - .5, W, H);
    const r = Math.sqrt(u) * LIGHT.keySize, th = v * 6.283;
    key.position.set(LIGHT.keyPos[0] + r * Math.cos(th), LIGHT.keyPos[1], LIGHT.keyPos[2] + r * Math.sin(th));
    rim.position.set(LIGHT.rimPos[0] + (p - .5) * 30, LIGHT.rimPos[1] + (q - .5) * 20, LIGHT.rimPos[2]);
    const cz = Math.sqrt(1 - p * 0.92), sz = Math.sqrt(1 - cz * cz), ph = q * 6.283;
    dome.position.set(sz * Math.cos(ph) * 200, cz * 200, sz * Math.sin(ph) * 200);
    renderer.setRenderTarget(frame); renderer.clear(); renderer.render(scene, camera);
    quad.material.uniforms.a.value = acc[0].texture; quad.material.uniforms.b.value = frame.texture; quad.material.uniforms.k.value = 1 / (i + 1);
    renderer.setRenderTarget(acc[1]); renderer.render(qs, qc); acc.reverse();
    if (i % 32 === 31) await new Promise(r => setTimeout(r));
  }
  const d = new Float32Array(W * H * 4); renderer.readRenderTargetPixels(acc[0], 0, 0, W, H, d);
  const rgb = new Float32Array(W * H * 3); for (let i = 0; i < W * H; i++) { rgb[3 * i] = d[4 * i]; rgb[3 * i + 1] = d[4 * i + 1]; rgb[3 * i + 2] = d[4 * i + 2]; }
  const bytes = new Uint8Array(rgb.buffer); let s = ''; const parts = [];
  for (let i = 0; i < bytes.length; i += 0x6000) parts.push(btoa(String.fromCharCode.apply(null, bytes.subarray(i, i + 0x6000))));
  return parts;
};
window.ready = true;
</script></body></html>"""

CONFIG = {
    # About 15 degrees above the old 13 degree view, so the scan plane opens over the floor.
    "CAM": {"fov": 24, "pos": [-11, 76, 113], "look": [0, 9, -14]},
    "ROBOT": {"yaw": 0.42},
    # The robot stands at a junction, 30 cm pitch. Walls ahead of it stay out of the sight line.
    "WALLS": [
        [-105, -15, -15, -15], [15, -15, 45, -15], [75, -15, 135, -15],
        [-15, -45, -15, -15], [15, -45, 15, -15], [-15, -45, 15, -45],
        [45, -45, 45, -15], [75, -45, 75, -15], [45, -45, 75, -45],
        [-75, -75, -15, -75], [-15, -75, -15, -45],
        [-105, 15, -30, 15], [-30, 15, -30, 75], [30, 15, 105, 15], [30, 15, 30, 75],
        [-105, -15, -105, 15], [135, -15, 135, 45], [105, 15, 105, 45],
    ],
    "SCAN": {"ray": [1.0, 0.42, 0.1], "rayFar": [1.0, 0.3, 0.05], "rayGain": 0.5, "rayEvery": 3, "sheet": [0.09, 0.033, 0.009],
             "nearFrom": -0.3, "nearTo": 0.4, "rangeFall": 36, "hit": [5, 1.4, 0.2], "hitFloor": 0.1, "dot": 0.1,
             "spill": 6, "spillColor": [0.035, 0.011, 0.0025], "ring": [5, 1.7, 0.3]},
    "FLOOR": {"opacity": 0.86},
    "LIGHT": {"key": [0xfff4ea, 1.0], "keyPos": [-70, 110, 62], "keySize": 30, "keyAngle": 0.13,
              "rim": [0x9dbfff, 3.4], "rimPos": [46, 120, -74], "fill": 0.2, "warm": 8, "dome": 1.15, "domeColor": [0.75, 0.85, 1.0]},
}


def render(samples):
    html = PAGE
    for k, v in CONFIG.items():
        html = html.replace("const W = 1600", f"const {k} = {json.dumps(v)};\nconst W = 1600", 1)
    def route(r):
        path = r.request.url.split("card.local", 1)[1].split("?")[0]
        if path == "/":
            return r.fulfill(body=html, content_type="text/html")
        f = ROOT / "node_modules" / path.lstrip("/")
        r.fulfill(path=str(f), content_type="text/javascript")
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", headless=True, args=["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"])
        pg = b.new_page(viewport={"width": W, "height": H})
        pg.on("console", lambda m: print("[page]", m.text) if m.type in ("error",) else None)
        pg.on("pageerror", lambda e: print("[pageerror]", e))
        pg.route("http://card.local/**", route)
        pg.goto("http://card.local/")
        pg.wait_for_function("window.ready===true", timeout=25000)
        parts = pg.evaluate("n => window.renderCard(n)", samples)
        b.close()
    raw = b"".join(base64.b64decode(s) for s in parts)
    return np.frombuffer(raw, np.float32).reshape(H, W, 3)[::-1].copy()


def grade(hdr):
    hdr = np.maximum(np.nan_to_num(hdr, posinf=0), 0)
    bright = np.maximum(hdr - 0.9, 0)
    glow = sum(w * gaussian_filter(bright, (s, s, 0)) for s, w in [(2, .34), (6, .18), (18, .08), (50, .03)])
    x = (hdr + glow) * 1.15
    x = x * (2.51 * x + 0.03) / (x * (2.43 * x + 0.59) + 0.14)   # ACES fit
    x = np.clip(x, 0, 1)
    yy, xx = np.mgrid[0:H, 0:W]
    v = 1 - 0.45 * np.clip((((xx - W / 2) / (W * .62)) ** 2 + ((yy - H / 2) / (H * .72)) ** 2), 0, 1)
    x = x * v[..., None]
    s = np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(x, 1 / 2.4) - 0.055)
    s = s + np.array([0.020, 0.020, 0.024]) * (1 - s)   # lift to the card's near-black
    rng = np.random.default_rng(3)
    s = s + (rng.random(s.shape[:2])[..., None] - rng.random(s.shape[:2])[..., None]) * 1.0 / 255
    return (np.clip(s, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--samples", type=int, default=400)
    ap.add_argument("--out", default=str(ROOT / "public/images/project/cards/lidar-maze-robot.jpg"))
    a = ap.parse_args()
    img = Image.fromarray(grade(render(a.samples)))
    pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    for q in (86, 84, 82, 80):
        img.save(a.out, quality=q, subsampling=2, optimize=True, progressive=True)
        if pathlib.Path(a.out).stat().st_size < 300_000:
            break
    print(a.out, img.size, "quality", q, pathlib.Path(a.out).stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
