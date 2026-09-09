/**
 * Removes every embedded texture from a .glb, in place.
 *
 * All four model viewers replace each mesh's material with a flat
 * MeshPhongMaterial the moment the model finishes loading, and nothing ever
 * samples a texture. Yet three of the models embed 0.6 to 1.0 MB of JPEG and
 * PNG each: bytes that are downloaded, and in the case of maps three knows how
 * to use, decoded into 1024x1024 RGBA buffers, and then thrown away. Recompressing
 * them (optimize-glb-textures.mjs) was the wrong fight; they should not be
 * there at all.
 *
 * What goes:
 *   images, textures, samplers
 *   every texture slot on every material, including the ones inside
 *   KHR_materials_pbrSpecularGlossiness and KHR_materials_specular
 *   the bufferViews those images lived in
 *   KHR_materials_pbrSpecularGlossiness itself, once no material carries it
 *   (three r174 does not implement it, and the contact page logs an
 *   "Unknown extension" warning for it on every load)
 *
 * What stays: geometry (still Draco), skins, animations, nodes, the material
 * entries themselves (minus their maps) and every other extension. The BIN
 * chunk is rebuilt so the surviving bufferViews get fresh 4-byte aligned
 * offsets, the same way optimize-glb-textures.mjs does it.
 *
 * Only plain and Draco-compressed geometry is understood. A file that uses
 * EXT_meshopt_compression is refused up front: that extension hangs off
 * bufferViews and points at buffers, not the other way round, and the
 * bufferView bookkeeping below does not follow it. Refusing is safer than
 * writing a file that verify() cannot vouch for.
 *
 * After writing, the file is re-read and checked: every accessor and Draco
 * bufferView must lie inside the new BIN, and no texture index may survive
 * anywhere in the materials. The poster render (render-model-posters.mjs)
 * is the end-to-end load test: it pushes each stripped file through three's
 * GLTFLoader in a real browser.
 *
 * Usage: node scripts/strip-glb-textures.mjs public/models/a.glb [b.glb ...]
 */
import { readFile, writeFile } from 'node:fs/promises';

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

// Extensions whose only purpose is to describe textures. With no textures
// left they are dead weight in extensionsUsed and, worse, in extensionsRequired.
const TEXTURE_ONLY_EXTENSIONS = new Set([
  'KHR_materials_pbrSpecularGlossiness',
  'KHR_texture_transform',
  'KHR_texture_basisu',
  'EXT_texture_webp',
  'EXT_texture_avif',
]);

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: strip-glb-textures.mjs <file.glb> [more.glb ...]   (rewrites in place)');
  process.exit(1);
}

function parseGlb(buf, label) {
  if (buf.length < 12 || buf.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${label} is not a GLB`);
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
  if (!json || !bin) throw new Error(`${label} is missing a JSON or BIN chunk`);
  return { json, bin };
}

/**
 * Deletes every `*Texture` slot from a material, at the top level, inside
 * pbrMetallicRoughness, and inside each extension block. Matching on the
 * key suffix rather than a fixed list means a slot added by an extension this
 * script has never heard of is still removed, which is the safe direction: a
 * dangling texture index is a load error, a missing one is a default value.
 */
function stripMaterialTextures(material) {
  let removed = 0;
  const strip = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.endsWith('Texture')) {
        delete obj[key];
        removed++;
      }
    }
  };

  // Read before strip() deletes the slot, so this really means "had a map".
  const hadEmissiveMap = material.emissiveTexture !== undefined;
  strip(material);
  strip(material.pbrMetallicRoughness);
  for (const ext of Object.values(material.extensions ?? {})) strip(ext);

  // emissiveFactor is a multiplier on the emissive map. Once the map is gone
  // a factor of [1,1,1] would mean "glow pure white everywhere", which is not
  // what the file meant; the map carried the actual shape of the glow. A
  // material that never had a map uses the factor as a flat glow colour and
  // keeps it.
  if (hadEmissiveMap && material.emissiveFactor) {
    material.emissiveFactor = [0, 0, 0];
  }

  const sg = material.extensions?.KHR_materials_pbrSpecularGlossiness;
  if (sg) {
    // Fold the extension's factors into core PBR so a loader that does not
    // know the extension still gets the intended base colour, then drop it.
    material.pbrMetallicRoughness ??= {};
    if (sg.diffuseFactor) material.pbrMetallicRoughness.baseColorFactor = sg.diffuseFactor;
    material.pbrMetallicRoughness.metallicFactor = 0;
    material.pbrMetallicRoughness.roughnessFactor = 1 - (sg.glossinessFactor ?? 1);
    delete material.extensions.KHR_materials_pbrSpecularGlossiness;
    if (!Object.keys(material.extensions).length) delete material.extensions;
  }
  return removed;
}

/** Every bufferView index something in the document still points at. */
function referencedBufferViews(json) {
  const used = new Set();
  for (const a of json.accessors ?? []) {
    if (a.bufferView !== undefined) used.add(a.bufferView);
    if (a.sparse) {
      used.add(a.sparse.indices.bufferView);
      used.add(a.sparse.values.bufferView);
    }
  }
  for (const img of json.images ?? []) if (img.bufferView !== undefined) used.add(img.bufferView);
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const draco = prim.extensions?.KHR_draco_mesh_compression;
      if (draco) used.add(draco.bufferView);
    }
  }
  return used;
}

/** Rewrites every bufferView reference through `remap` (old index -> new index). */
function remapBufferViews(json, remap) {
  const map = (i) => {
    const next = remap.get(i);
    if (next === undefined) throw new Error(`bufferView ${i} is referenced but was dropped`);
    return next;
  };
  for (const a of json.accessors ?? []) {
    if (a.bufferView !== undefined) a.bufferView = map(a.bufferView);
    if (a.sparse) {
      a.sparse.indices.bufferView = map(a.sparse.indices.bufferView);
      a.sparse.values.bufferView = map(a.sparse.values.bufferView);
    }
  }
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const draco = prim.extensions?.KHR_draco_mesh_compression;
      if (draco) draco.bufferView = map(draco.bufferView);
    }
  }
}

function assemble(json, bin) {
  let jsonBuf = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]); // spec: pad JSON with spaces

  const total = 12 + 8 + jsonBuf.length + 8 + bin.length;
  const out = Buffer.alloc(total);
  out.writeUInt32LE(GLB_MAGIC, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(jsonBuf.length, 12);
  out.writeUInt32LE(CHUNK_JSON, 16);
  jsonBuf.copy(out, 20);
  const binHeader = 20 + jsonBuf.length;
  out.writeUInt32LE(bin.length, binHeader);
  out.writeUInt32LE(CHUNK_BIN, binHeader + 4);
  bin.copy(out, binHeader + 8);
  return out;
}

/**
 * Structural check on a finished file. Throws on the first problem. This is
 * deliberately independent of the code that built the file: it re-parses from
 * bytes and trusts nothing that was computed above.
 */
function verify(buf, label) {
  const { json, bin } = parseGlb(buf, label);
  const views = json.bufferViews ?? [];
  if ((json.buffers?.[0]?.byteLength ?? -1) > bin.length) {
    throw new Error(`${label}: buffers[0].byteLength ${json.buffers[0].byteLength} exceeds BIN ${bin.length}`);
  }
  const inside = (i, who) => {
    const v = views[i];
    if (!v) throw new Error(`${label}: ${who} points at missing bufferView ${i}`);
    const start = v.byteOffset ?? 0;
    if (start % 4 !== 0) throw new Error(`${label}: bufferView ${i} offset ${start} is not 4-byte aligned`);
    if (start + v.byteLength > bin.length) {
      throw new Error(`${label}: bufferView ${i} [${start}, ${start + v.byteLength}) runs past BIN ${bin.length}`);
    }
  };
  (json.accessors ?? []).forEach((a, i) => {
    if (a.bufferView !== undefined) inside(a.bufferView, `accessor ${i}`);
    if (a.sparse) {
      inside(a.sparse.indices.bufferView, `accessor ${i} sparse indices`);
      inside(a.sparse.values.bufferView, `accessor ${i} sparse values`);
    }
  });
  (json.meshes ?? []).forEach((m, mi) =>
    (m.primitives ?? []).forEach((p, pi) => {
      const draco = p.extensions?.KHR_draco_mesh_compression;
      if (draco) inside(draco.bufferView, `mesh ${mi} primitive ${pi} draco`);
    })
  );
  if (json.images?.length || json.textures?.length || json.samplers?.length) {
    throw new Error(`${label}: images/textures/samplers survived`);
  }
  const leftover = JSON.stringify(json.materials ?? []).match(/"[A-Za-z]+Texture"/);
  if (leftover) throw new Error(`${label}: material still references ${leftover[0]}`);
  for (const ext of [...(json.extensionsRequired ?? []), ...(json.extensionsUsed ?? [])]) {
    if (ext === 'KHR_materials_pbrSpecularGlossiness') throw new Error(`${label}: ${ext} still declared`);
  }
  return { accessors: json.accessors?.length ?? 0, bufferViews: views.length };
}

let failed = false;
for (const path of files) {
  const before = await readFile(path);
  let json;
  let bin;
  try {
    ({ json, bin } = parseGlb(before, path));
  } catch (err) {
    console.error(`  ${path}: ${err.message}`);
    failed = true;
    continue;
  }

  const declared = [...(json.extensionsUsed ?? []), ...(json.extensionsRequired ?? [])];
  if (declared.includes('EXT_meshopt_compression')) {
    console.error(`  ${path}: uses EXT_meshopt_compression, which this script does not handle; left as is`);
    failed = true;
    continue;
  }

  const imageCount = json.images?.length ?? 0;
  if (!imageCount && !json.textures?.length) {
    console.log(`  ${path}: no embedded textures, left as is (${before.length.toLocaleString()} B)`);
    continue;
  }

  const imageBytes = (json.images ?? []).reduce(
    (sum, img) => sum + (img.bufferView !== undefined ? json.bufferViews[img.bufferView].byteLength : 0),
    0
  );

  let slots = 0;
  for (const m of json.materials ?? []) slots += stripMaterialTextures(m);
  delete json.images;
  delete json.textures;
  delete json.samplers;

  // Drop bufferViews nothing points at any more (the image payloads), then
  // renumber. Order is preserved so the geometry layout is unchanged.
  const used = referencedBufferViews(json);
  const oldViews = json.bufferViews ?? [];
  const remap = new Map();
  const kept = [];
  oldViews.forEach((view, i) => {
    if (!used.has(i)) return;
    remap.set(i, kept.length);
    kept.push(view);
  });
  remapBufferViews(json, remap);

  // Rebuild BIN with fresh 4-byte aligned offsets.
  const pieces = [];
  let cursor = 0;
  for (const view of kept) {
    const start = view.byteOffset ?? 0;
    const data = bin.subarray(start, start + view.byteLength);
    const pad = (4 - (cursor % 4)) % 4;
    if (pad) {
      pieces.push(Buffer.alloc(pad));
      cursor += pad;
    }
    view.byteOffset = cursor;
    view.buffer = 0;
    pieces.push(data);
    cursor += data.length;
  }
  let newBin = Buffer.concat(pieces);
  const binPad = (4 - (newBin.length % 4)) % 4;
  if (binPad) newBin = Buffer.concat([newBin, Buffer.alloc(binPad)]);
  json.bufferViews = kept;
  json.buffers = [{ byteLength: cursor }];

  // Extension declarations: keep anything a material still carries.
  const stillUsed = new Set();
  for (const m of json.materials ?? []) for (const k of Object.keys(m.extensions ?? {})) stillUsed.add(k);
  const prune = (list) =>
    list?.filter((ext) => !TEXTURE_ONLY_EXTENSIONS.has(ext) || stillUsed.has(ext));
  const droppedExt = (json.extensionsUsed ?? []).filter((e) => !prune(json.extensionsUsed).includes(e));
  json.extensionsUsed = prune(json.extensionsUsed);
  json.extensionsRequired = prune(json.extensionsRequired);
  if (!json.extensionsUsed?.length) delete json.extensionsUsed;
  if (!json.extensionsRequired?.length) delete json.extensionsRequired;

  const out = assemble(json, newBin);
  await writeFile(path, out);

  try {
    const check = verify(await readFile(path), path);
    console.log(
      `  ${path}\n` +
      `    ${before.length.toLocaleString()} B -> ${out.length.toLocaleString()} B ` +
      `(${(100 * (1 - out.length / before.length)).toFixed(0)}% smaller; ` +
      `${imageCount} images / ${imageBytes.toLocaleString()} B, ${slots} texture slots, ` +
      `${oldViews.length - kept.length} bufferViews removed` +
      (droppedExt.length ? `, dropped ${droppedExt.join(', ')}` : '') + ')\n' +
      `    verified: ${check.accessors} accessors and ${check.bufferViews} bufferViews inside BIN`
    );
  } catch (err) {
    // Put the original back rather than leave a file the site cannot load.
    await writeFile(path, before);
    console.error(`  ${path}: verification failed, original restored: ${err.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
