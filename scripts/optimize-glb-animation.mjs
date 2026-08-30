/**
 * Removes redundant animation keyframes from a .glb.
 *
 * robot_playground_draco.glb is 83.6% animation data: 4.86MB of keyframes
 * against 0.13MB of geometry. Decimating the mesh would have saved nothing.
 * The animation is 25 seconds baked at a flat 50 keyframes per second across
 * 265 samplers, which is far more than LINEAR interpolation needs for joints
 * that mostly move smoothly.
 *
 * This runs Douglas-Peucker over each sampler's value curve and keeps only the
 * keyframes that carry shape: a frame is dropped when interpolating between its
 * neighbours reproduces it within tolerance. Constant channels collapse to two
 * keyframes. Nothing is resampled onto a new grid, so surviving keyframes keep
 * their exact original times and values, and the motion is unchanged wherever
 * the curve was actually doing something.
 *
 * Rotations are measured as an angle between quaternions, using slerp, because
 * glTF requires spherical interpolation for rotation channels. Translation and
 * scale use a tolerance relative to each channel's own range, so a joint that
 * travels a metre and one that travels a millimetre are held to the same
 * proportional standard.
 *
 * Usage: node scripts/optimize-glb-animation.mjs <in.glb> <out.glb>
 *          [--rot-deg 0.1] [--rel 0.001]
 */
import { readFile, writeFile } from 'node:fs/promises';

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

const [, , inPath, outPath, ...rest] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: optimize-glb-animation.mjs <in.glb> <out.glb> [--rot-deg N] [--rel N]');
  process.exit(1);
}
const arg = (name, dflt) => {
  const i = rest.indexOf(name);
  return i === -1 ? dflt : Number(rest[i + 1]);
};
const ROT_TOL = (arg('--rot-deg', 0.1) * Math.PI) / 180; // radians
const REL_TOL = arg('--rel', 0.001);                      // fraction of channel range

const buf = await readFile(inPath);
if (buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${inPath} is not a GLB`);

let offset = 12;
let json = null;
let bin = null;
while (offset < buf.length) {
  const len = buf.readUInt32LE(offset);
  const type = buf.readUInt32LE(offset + 4);
  const data = buf.subarray(offset + 8, offset + 8 + len);
  if (type === CHUNK_JSON) json = JSON.parse(data.toString('utf8'));
  else if (type === CHUNK_BIN) bin = data;
  offset += 8 + len;
}
if (!json || !bin) throw new Error('GLB missing a JSON or BIN chunk');

const accessors = json.accessors ?? [];
const bufferViews = json.bufferViews ?? [];

/** Read a FLOAT accessor into a flat Float32Array. Handles byteStride. */
function readAccessor(index) {
  const a = accessors[index];
  if (a.componentType !== 5126) return null; // only FLOAT is handled
  const comps = COMPONENTS[a.type];
  const view = bufferViews[a.bufferView];
  const base = (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
  const stride = view.byteStride ?? comps * 4;
  const out = new Float32Array(a.count * comps);
  for (let i = 0; i < a.count; i++) {
    for (let c = 0; c < comps; c++) {
      out[i * comps + c] = bin.readFloatLE(base + i * stride + c * 4);
    }
  }
  return { values: out, comps, count: a.count };
}

function quatAngle(a, b) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  dot = Math.min(1, Math.abs(dot));
  return 2 * Math.acos(dot);
}

function slerp(a, b, t) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let bb = b;
  if (dot < 0) { bb = b.map((v) => -v); dot = -dot; }
  if (dot > 0.9995) {
    const r = a.map((v, i) => v + t * (bb[i] - v));
    const n = Math.hypot(...r) || 1;
    return r.map((v) => v / n);
  }
  const theta = Math.acos(dot);
  const s = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / s;
  const w2 = Math.sin(t * theta) / s;
  return a.map((v, i) => v * w1 + bb[i] * w2);
}

/** Douglas-Peucker over the sampler's curve, returning the indices to keep. */
function simplify(times, values, comps, isRotation, tol) {
  const n = times.length;
  if (n <= 2) return [...times.keys()];
  const at = (i) => Array.from(values.subarray(i * comps, i * comps + comps));
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;

  const stack = [[0, n - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    if (hi - lo < 2) continue;
    const a = at(lo);
    const b = at(hi);
    const span = times[hi] - times[lo] || 1;

    let worst = -1;
    let worstIdx = -1;
    for (let i = lo + 1; i < hi; i++) {
      const t = (times[i] - times[lo]) / span;
      const actual = at(i);
      let err;
      if (isRotation) {
        err = quatAngle(actual, slerp(a, b, t));
      } else {
        let sum = 0;
        for (let c = 0; c < comps; c++) {
          const lerp = a[c] + (b[c] - a[c]) * t;
          sum += (actual[c] - lerp) ** 2;
        }
        err = Math.sqrt(sum);
      }
      if (err > worst) { worst = err; worstIdx = i; }
    }
    if (worst > tol && worstIdx !== -1) {
      keep[worstIdx] = 1;
      stack.push([lo, worstIdx], [worstIdx, hi]);
    }
  }
  return [...keep.keys()].filter((i) => keep[i]);
}

// ---- decimate every sampler ---------------------------------------------
const newData = new Map(); // accessor index -> Float32Array
let before = 0;
let after = 0;

for (const anim of json.animations ?? []) {
  const rotationSamplers = new Set(
    anim.channels.filter((c) => c.target.path === 'rotation').map((c) => c.sampler)
  );

  anim.samplers.forEach((sampler, si) => {
    if ((sampler.interpolation ?? 'LINEAR') !== 'LINEAR') return;
    const input = readAccessor(sampler.input);
    const output = readAccessor(sampler.output);
    if (!input || !output) return;
    if (output.count !== input.count) return; // CUBICSPLINE-shaped, leave alone

    const isRotation = rotationSamplers.has(si);
    let tol = ROT_TOL;
    if (!isRotation) {
      // Tolerance proportional to how far this channel actually travels.
      let lo = Infinity;
      let hi = -Infinity;
      for (const v of output.values) { if (v < lo) lo = v; if (v > hi) hi = v; }
      tol = Math.max((hi - lo) * REL_TOL, 1e-6);
    }

    const keep = simplify(input.values, output.values, output.comps, isRotation, tol);
    before += input.count;
    after += keep.length;
    if (keep.length === input.count) return;

    const t = new Float32Array(keep.length);
    const v = new Float32Array(keep.length * output.comps);
    keep.forEach((src, dst) => {
      t[dst] = input.values[src];
      for (let c = 0; c < output.comps; c++) {
        v[dst * output.comps + c] = output.values[src * output.comps + c];
      }
    });
    newData.set(sampler.input, t);
    newData.set(sampler.output, v);
    accessors[sampler.input].count = keep.length;
    accessors[sampler.output].count = keep.length;
    // Times carry min/max in glTF and they must stay truthful.
    accessors[sampler.input].min = [t[0]];
    accessors[sampler.input].max = [t[t.length - 1]];
  });
}

// ---- rebuild BIN ---------------------------------------------------------
// Rebuilt from what is still referenced rather than by copying the old views
// forward, so the replaced keyframe data is dropped instead of being carried
// along as orphaned bytes. Every accessor gets its own tightly packed view.
const COMPONENT_BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };

const pieces = [];
let cursor = 0;
const push = (bytes) => {
  const pad = (4 - (cursor % 4)) % 4;
  if (pad) { pieces.push(Buffer.alloc(pad)); cursor += pad; }
  const start = cursor;
  pieces.push(bytes);
  cursor += bytes.length;
  return start;
};

/** Tightly packed bytes for an accessor, de-interleaving if it had a stride. */
function packAccessor(a) {
  const comps = COMPONENTS[a.type];
  const cb = COMPONENT_BYTES[a.componentType];
  if (!comps || !cb) throw new Error(`unhandled accessor type ${a.type}/${a.componentType}`);
  const elem = comps * cb;
  const view = bufferViews[a.bufferView];
  const base = (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
  const stride = view.byteStride ?? elem;
  if (stride === elem) return Buffer.from(bin.subarray(base, base + a.count * elem));
  const out = Buffer.alloc(a.count * elem);
  for (let i = 0; i < a.count; i++) bin.copy(out, i * elem, base + i * stride, base + i * stride + elem);
  return out;
}

const newViews = [];
const emit = (bytes) => {
  const at = push(bytes);
  newViews.push({ buffer: 0, byteOffset: at, byteLength: bytes.length });
  return newViews.length - 1;
};

for (let i = 0; i < accessors.length; i++) {
  const a = accessors[i];
  if (a.bufferView === undefined) continue; // supplied by Draco, no view of its own
  const replacement = newData.get(i);
  const bytes = replacement
    ? Buffer.from(replacement.buffer, replacement.byteOffset, replacement.byteLength)
    : packAccessor(a);
  a.bufferView = emit(bytes);
  a.byteOffset = 0;
}
for (const im of json.images ?? []) {
  if (im.bufferView === undefined) continue;
  const v = bufferViews[im.bufferView];
  im.bufferView = emit(Buffer.from(bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength)));
}
for (const m of json.meshes ?? []) {
  for (const prim of m.primitives) {
    const e = prim.extensions?.KHR_draco_mesh_compression;
    if (!e) continue;
    const v = bufferViews[e.bufferView];
    e.bufferView = emit(Buffer.from(bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength)));
  }
}

json.bufferViews = newViews;
json.buffers[0].byteLength = cursor;

let newBin = Buffer.concat(pieces);
const binPad = (4 - (newBin.length % 4)) % 4;
if (binPad) newBin = Buffer.concat([newBin, Buffer.alloc(binPad)]);

let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);

const total = 12 + 8 + jsonBuf.length + 8 + newBin.length;
const out = Buffer.alloc(total);
out.writeUInt32LE(GLB_MAGIC, 0);
out.writeUInt32LE(2, 4);
out.writeUInt32LE(total, 8);
out.writeUInt32LE(jsonBuf.length, 12);
out.writeUInt32LE(CHUNK_JSON, 16);
jsonBuf.copy(out, 20);
const bh = 20 + jsonBuf.length;
out.writeUInt32LE(newBin.length, bh);
out.writeUInt32LE(CHUNK_BIN, bh + 4);
newBin.copy(out, bh + 8);

await writeFile(outPath, out);
console.log(
  `    keyframes ${before.toLocaleString()} -> ${after.toLocaleString()} ` +
  `(${(100 * (1 - after / before)).toFixed(1)}% removed)`
);
console.log(
  `    ${(buf.length / 1048576).toFixed(2)} MB -> ${(out.length / 1048576).toFixed(2)} MB ` +
  `(${(100 * (1 - out.length / buf.length)).toFixed(0)}% smaller)`
);
