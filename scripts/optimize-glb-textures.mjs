/**
 * Recompresses the textures embedded in a .glb without touching its geometry.
 *
 * Draco only compresses geometry, so it does nothing for a model whose weight is
 * mostly texture. walking_robot.glb is 67% texture, and two of the largest maps
 * in these models are 1024x1024 PNGs in RGB mode: PNG with no alpha to spend it
 * on, costing about a megabyte each where a JPEG costs a tenth of that.
 *
 * Rules:
 *   RGB  PNG -> JPEG        (the big win, no alpha to lose)
 *   RGBA PNG -> PNG         (alpha is load bearing, just re-optimised)
 *   JPEG     -> JPEG        (re-encoded only if that is actually smaller)
 *
 * Geometry, animations, materials and the node graph are untouched. The BIN
 * chunk is rebuilt because image byte lengths change, so every bufferView gets
 * a fresh 4-byte aligned offset.
 *
 * Usage: node scripts/optimize-glb-textures.mjs <in.glb> <out.glb> [--quality 88]
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

const [, , inPath, outPath, ...rest] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: optimize-glb-textures.mjs <in.glb> <out.glb> [--quality N]');
  process.exit(1);
}
const qIdx = rest.indexOf('--quality');
const QUALITY = qIdx !== -1 ? Number(rest[qIdx + 1]) : 88;

const buf = await readFile(inPath);
if (buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${inPath} is not a GLB`);

// ---- parse chunks --------------------------------------------------------
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

const bufferViews = json.bufferViews ?? [];
const images = json.images ?? [];

// ---- recompress each embedded image -------------------------------------
const replacement = new Map(); // bufferView index -> { data, mimeType }
let savedBytes = 0;

for (const image of images) {
  if (image.bufferView === undefined) continue; // external URI, not embedded
  const view = bufferViews[image.bufferView];
  const start = view.byteOffset ?? 0;
  const original = bin.subarray(start, start + view.byteLength);

  const meta = await sharp(original).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);

  let encoded;
  let mimeType;
  if (hasAlpha) {
    // Alpha is load bearing, so it stays PNG. Palette mode is a large win on
    // the flat, low-colour maps these models use.
    encoded = await sharp(original).png({ compressionLevel: 9, palette: true }).toBuffer();
    mimeType = 'image/png';
  } else {
    encoded = await sharp(original).jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    mimeType = 'image/jpeg';
  }

  // Never make a texture bigger than it already was.
  if (encoded.length >= original.length) {
    encoded = original;
    mimeType = image.mimeType;
  }

  savedBytes += original.length - encoded.length;
  replacement.set(image.bufferView, { data: encoded, mimeType });
  image.mimeType = mimeType;

  const label = `${meta.width}x${meta.height} ${hasAlpha ? 'RGBA' : 'RGB'}`;
  console.log(
    `    ${label.padEnd(16)} ${(original.length / 1024).toFixed(0).padStart(5)} KB -> ` +
    `${(encoded.length / 1024).toFixed(0).padStart(5)} KB  ${image.mimeType}`
  );
}

// ---- rebuild BIN with fresh 4-byte aligned offsets -----------------------
const pieces = [];
let cursor = 0;
for (const view of bufferViews) {
  const swap = replacement.get(bufferViews.indexOf(view));
  const start = view.byteOffset ?? 0;
  const data = swap ? swap.data : bin.subarray(start, start + view.byteLength);

  const pad = (4 - (cursor % 4)) % 4;
  if (pad) {
    pieces.push(Buffer.alloc(pad));
    cursor += pad;
  }
  view.byteOffset = cursor;
  view.byteLength = data.length;
  pieces.push(data);
  cursor += data.length;
}

let newBin = Buffer.concat(pieces);
const binPad = (4 - (newBin.length % 4)) % 4;
if (binPad) newBin = Buffer.concat([newBin, Buffer.alloc(binPad)]);
json.buffers[0].byteLength = cursor;

// ---- reassemble ----------------------------------------------------------
let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]); // pad with spaces

const total = 12 + 8 + jsonBuf.length + 8 + newBin.length;
const out = Buffer.alloc(total);
out.writeUInt32LE(GLB_MAGIC, 0);
out.writeUInt32LE(2, 4);
out.writeUInt32LE(total, 8);
out.writeUInt32LE(jsonBuf.length, 12);
out.writeUInt32LE(CHUNK_JSON, 16);
jsonBuf.copy(out, 20);
const binHeader = 20 + jsonBuf.length;
out.writeUInt32LE(newBin.length, binHeader);
out.writeUInt32LE(CHUNK_BIN, binHeader + 4);
newBin.copy(out, binHeader + 8);

await writeFile(outPath, out);
console.log(
  `    ${(buf.length / 1048576).toFixed(2)} MB -> ${(out.length / 1048576).toFixed(2)} MB ` +
  `(${(100 * (1 - out.length / buf.length)).toFixed(0)}% smaller, textures saved ${(savedBytes / 1048576).toFixed(2)} MB)`
);
