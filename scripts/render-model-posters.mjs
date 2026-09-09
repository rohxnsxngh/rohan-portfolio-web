/**
 * Renders the four hero models to still posters for phones.
 *
 * Phones do not run the WebGL heroes (src/scripts/heavy3d.ts), and a hero
 * with nothing behind the copy reads as a broken page. Each viewer instead
 * shows one of these images until the visitor asks for the live scene. The
 * poster has to be what the desktop scene looks like with the pointer over it:
 * at rest the scenes are near-black (mean luma 2 to 5 out of 255) and only the
 * mouse-follow lights make the robots read, so every render here has that
 * hover rig switched on.
 *
 * How it works:
 *   1. a tiny static server serves node_modules/three, public/models,
 *      public/draco and the render page below from memory
 *   2. headless Chrome on SwiftShader loads the page once per model; the page
 *      is the viewer's scene rebuilt from the same numbers (light rig, material
 *      override, Sobel pass, camera) and posts back a PNG per size
 *   3. sharp flattens each PNG onto #000000 (the page background the poster
 *      sits on) and writes WebP and AVIF at 2x and 3x iPhone widths
 *
 * This is also the load test for the stripped GLBs (strip-glb-textures.mjs):
 * a file three's GLTFLoader cannot parse fails the render here, on the
 * machine, instead of on the site.
 *
 * Runs on a Mac with Chrome installed and is NOT part of `npm run build`:
 * Vercel has no browser, and the outputs are committed.
 *
 * Usage: node scripts/render-model-posters.mjs [--only home,blog] [--png]
 *   --only   render a subset of home, project, contact, blog
 *   --png    also keep the raw PNG next to the outputs, for inspection
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'public', 'models', 'posters');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RENDER_TIMEOUT_MS = 240_000;

// iPhone portrait at DPR 2 and DPR 3 (393x852 CSS px). The viewer picks one
// with srcset, so both are rendered natively rather than downscaled: the Sobel
// edge kernel works in texels and a downscaled 3x render would soften edges.
const SIZES = [
  { suffix: '2x', w: 786, h: 1704 },
  { suffix: '3x', w: 1179, h: 2556 },
];

// Encode settings. WebP q75 was the knee of the size/quality curve in the
// prototype; AVIF lands about 40% smaller again at a slightly lower nominal q.
const WEBP_QUALITY = 75;
const AVIF_QUALITY = { '2x': 45, '3x': 50 };

/**
 * One entry per viewer. The camera, material, rig options and hover rig are
 * copied from the four components and must be kept in step with them: when a
 * viewer's numbers change, update them here and re-run. The one deliberate
 * departure is the `portrait` block, which is poster-only (see below).
 *
 *   cam / target / fov   the viewer's desktop camera
 *   hover                the mouse-follow lights at full strength, as the
 *                        viewer's updateLighting leaves them with the pointer
 *                        on the hero centre: [x, y, z, intensity, distance,
 *                        decay] per colour, yellow 1.2 above the orange and
 *                        red 1.0 below it, intensities baseIntensity x
 *                        (1, 0.7, 0.8) except contact whose yellow and red
 *                        share one target, plus the hemisphere light's cap
 *   hemiColors           the viewer's HemisphereLight sky and ground colours
 *   cyanRadius           radius of the rig's cyan accent orbit in the
 *                        viewer's animate loop (contact hardcodes 6 rather
 *                        than scaling the shared 3)
 *   time                 seconds into the animation clip to pose the model at
 *   portrait             poster-specific override for these tall renders. The
 *                        project and blog desktop cameras are landscape
 *                        framings (the kuma arm sits off-centre bottom-right,
 *                        the keyboard is a thin band) so they get their own
 *                        camera and, where the new camera looks from a
 *                        different side, their own light positions; home and
 *                        contact frame well as they are
 */
const SETUPS = {
  home: { // RobotModelViewer.astro
    glb: '/models/robot_playground_draco.glb', fov: 75, cam: [0, 0.5, 4.5], target: [0, 0, 0],
    exposure: 0.42, rig: {}, pos: [0, -0.4, 0], rot: [0, 0, 0], scale: 1.5, timeScale: 1, time: 0,
    mat: { color: '#000000', emissive: '#000000', specular: '#ffffff', shininess: 15, flatShading: true },
    hover: { orange: [0, 0.9, 3.0, 10.8, 30, 1.0], yellow: [0, 2.1, 3.0, 7.56, 25, 1.2], red: [0, -0.1, 3.0, 8.64, 25, 1.2], hemi: 0.48 },
    hemiColors: [0xffcc44, 0x661100], cyanRadius: 3,
  },
  project: { // HeavyRobotModelViewer.astro
    glb: '/models/kuma_heavy_robot_draco.glb', fov: 75, cam: [-20, -40, 10], target: [0, -0.5, -75],
    exposure: 1.15, rig: { spotlight: false, shadowMapSize: 512 }, pos: [0, -0.5, -75], rot: [0, Math.PI / 2, 0], scale: 0.025, timeScale: 1.5, time: 0,
    mat: { color: '#444444', emissive: '#111111', specular: '#aaaaaa', shininess: 20, flatShading: false },
    hover: { orange: [0, 5, -60, 21, 200, 0.8], yellow: [0, 6.2, -60, 14.7, 150, 1.0], red: [0, 4, -60, 16.8, 150, 1.0], hemi: 0.36 },
    hemiColors: [0xffcc44, 0x661100], cyanRadius: 3,
    portrait: {
      cam: [-35, -45, 30], target: [0.7, -2, -47],
      // HeavyRobotModelViewer.updateLighting: orange sits on the pointer ray,
      // yellow 15 above it, red 12 below, at 21 x 2 (pointer on the robot's
      // centre) x (1, 0.7, 0.8). On desktop the ray puts them about 55 units
      // from the arm, where the fixed light happens to land inside a cavity;
      // here they sit 80% of the way down the ray so the panels catch them.
      hover: { orange: [-6.4, -10.6, -31.6, 42, 200, 0.8], yellow: [-6.4, 4.4, -31.6, 29.4, 150, 1.0], red: [-6.4, -22.6, -31.6, 33.6, 150, 1.0], hemi: 0.36 },
    },
  },
  contact: { // ContactRobotViewer.astro
    glb: '/models/walking_robot.glb', fov: 75, cam: [0, 4, 35], target: [0, 1.5, 0],
    exposure: 0.65, rig: { scale: 1.6 }, pos: [0, 0, 0], rot: [0, 0, 0], scale: 1.5, timeScale: 1, time: 0,
    mat: { color: '#000000', emissive: '#000000', specular: '#ffffff', shininess: 15, flatShading: true },
    hover: { orange: [0, 5, 20, 9.0, 100, 0.8], yellow: [0, 6.2, 20, 7.2, 80, 1.0], red: [0, 4, 20, 7.2, 80, 1.0], hemi: 0.9 },
    hemiColors: [0xffaa44, 0x442200], cyanRadius: 6,
  },
  blog: { // BlogRobotViewer.astro
    glb: '/models/keyboard_draco.glb', fov: 45, cam: [0, 3, 5], target: [0, 0, 0],
    exposure: 0.85, rig: { shadowMapSize: 512 }, fit: 3, rot: [-0.2, 0.15, 0], timeScale: 4, time: 0,
    mat: { color: '#2a2a2a', emissive: '#080808', specular: '#ffffff', shininess: 25, flatShading: false },
    hover: { orange: [0, 2, 3, 6.0, 30, 1.0], yellow: [0, 3.2, 3, 4.2, 25, 1.2], red: [0, 1, 3, 4.8, 25, 1.2], hemi: 0.3 },
    hemiColors: [0xffcc44, 0x661100], cyanRadius: 3,
    portrait: {
      cam: [0, 5.7, 3.3], target: [0, 0, 0], rot: [0, -1.15, 0],
      hover: { orange: [1.0, 3.2, 1.2, 6.0, 30, 1.0], yellow: [-1.2, 4.2, 0, 4.2, 25, 1.2], red: [0.5, 2.6, 2.6, 4.8, 25, 1.2] },
    },
  },
};

// ---------------------------------------------------------------------------
// The render page. Served from memory at /render.html. It rebuilds the viewer
// scene from SETUPS (injected as JSON) and posts { sizes: { '2x': <png b64>,
// ... }, bbox, error } back to /out when done.
// ---------------------------------------------------------------------------
function renderPage(setups) {
  return `<!doctype html>
<meta charset="utf-8">
<title>poster render</title>
<style>html,body{margin:0;background:#000}</style>
<script type="importmap">
{ "imports": {
  "three": "/node_modules/three/build/three.module.js",
  "three/addons/": "/node_modules/three/examples/jsm/"
} }
</script>
<div id="mount"></div>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const SETUPS = ${JSON.stringify(setups)};
const q = new URLSearchParams(location.search);
const which = q.get('model');
const SIZES = q.get('sizes').split(',').map(s => { const [suffix, w, h] = s.split(':'); return { suffix, w: +w, h: +h }; });
const S = SETUPS[which];

// src/scripts/robotLightRig.ts, verbatim ratios
const BASE = { ambient: 0.18, key: 0.55, fill: 0.2, cyan: 0.32, magenta: 0.26, rim: 0.34, spot: 0.3 };
function createRobotLightRig(scene, { exposure = 1, scale = 1, spotlight: withSpot = true, shadowMapSize = 1024 } = {}) {
  const i = b => b * exposure, s = (x, y, z) => [x * scale, y * scale, z * scale];
  scene.add(new THREE.AmbientLight(0x404040, i(BASE.ambient)));
  const main = new THREE.DirectionalLight(0xffffff, i(BASE.key)); main.position.set(...s(3, 5, 4));
  main.castShadow = true; main.shadow.mapSize.set(shadowMapSize, shadowMapSize); main.shadow.bias = -0.001;
  main.shadow.camera.near = 0.5; main.shadow.camera.far = 20 * scale;
  main.shadow.camera.left = -5 * scale; main.shadow.camera.right = 5 * scale; main.shadow.camera.top = 5 * scale; main.shadow.camera.bottom = -5 * scale;
  scene.add(main);
  const fill = new THREE.DirectionalLight(0x8899ff, i(BASE.fill)); fill.position.set(...s(-3, 2, 2)); scene.add(fill);
  const cyan = new THREE.PointLight(0x00ffff, i(BASE.cyan), 10 * scale); cyan.position.set(...s(-2, 1, 3)); scene.add(cyan);
  const magenta = new THREE.PointLight(0xff00ff, i(BASE.magenta), 10 * scale); magenta.position.set(...s(2, 0.5, -2)); scene.add(magenta);
  const rim = new THREE.DirectionalLight(0xffffff, i(BASE.rim)); rim.position.set(...s(0, 3, -5)); scene.add(rim);
  let spot = null;
  if (withSpot) { spot = new THREE.SpotLight(0xffffff, i(BASE.spot)); spot.position.set(...s(0, 6, 0)); spot.angle = Math.PI / 6; spot.penumbra = 0.5; spot.decay = 2; spot.distance = 20 * scale; scene.add(spot); }
  return { spot, cyan, magenta };
}

// Sobel pass, copied from RobotModelViewer.astro
const SOBEL_FRAG = \`
  uniform sampler2D tDiffuse; uniform vec2 resolution; varying vec2 vUv;
  void main(){
    vec2 texel = vec2(1.0/resolution.x, 1.0/resolution.y);
    vec4 original = texture2D(tDiffuse, vUv);
    if (original.a < 0.01) discard;
    float Gx00 = texture2D(tDiffuse, vUv + texel*vec2(-1, 1)).r;
    float Gx01 = texture2D(tDiffuse, vUv + texel*vec2(-1, 0)).r*2.0;
    float Gx02 = texture2D(tDiffuse, vUv + texel*vec2(-1,-1)).r;
    float Gx10 = texture2D(tDiffuse, vUv + texel*vec2( 1, 1)).r;
    float Gx11 = texture2D(tDiffuse, vUv + texel*vec2( 1, 0)).r*2.0;
    float Gx12 = texture2D(tDiffuse, vUv + texel*vec2( 1,-1)).r;
    float Gy00 = texture2D(tDiffuse, vUv + texel*vec2(-1, 1)).r;
    float Gy01 = texture2D(tDiffuse, vUv + texel*vec2( 0, 1)).r*2.0;
    float Gy02 = texture2D(tDiffuse, vUv + texel*vec2( 1, 1)).r;
    float Gy10 = texture2D(tDiffuse, vUv + texel*vec2(-1,-1)).r;
    float Gy11 = texture2D(tDiffuse, vUv + texel*vec2( 0,-1)).r*2.0;
    float Gy12 = texture2D(tDiffuse, vUv + texel*vec2( 1,-1)).r;
    float Gx = Gx00 - Gx02 + Gx10 - Gx12 + Gx01 - Gx11;
    float Gy = Gy00 - Gy10 + Gy02 - Gy12 + Gy01 - Gy11;
    float G = clamp(sqrt(Gx*Gx + Gy*Gy) * 2.5, 0.0, 1.0);
    vec3 blended = mix(original.rgb, original.rgb + vec3(G)*0.8, 0.75);
    gl_FragColor = vec4(blended, original.a);
  }\`;
const SOBEL_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';

const out = { model: which, sizes: {}, bbox: null, error: null, ms: 0 };
const t0 = performance.now();
try {
  const scene = new THREE.Scene();
  scene.background = null;
  const { spot, cyan, magenta } = createRobotLightRig(scene, { exposure: S.exposure, ...S.rig });

  // The hover rig. On the site these follow the pointer; here they sit at the
  // positions the viewer gives them when the pointer is over the hero centre.
  // A portrait camera that looks from a different side needs them moved too,
  // or it sees the unlit back of the model.
  const hover = { ...S.hover, ...(S.portrait?.hover ?? {}) };
  for (const k of ['orange', 'yellow', 'red']) {
    const [x, y, z, I, dist, decay] = hover[k];
    const l = new THREE.PointLight({ orange: 0xff8800, yellow: 0xffee00, red: 0xff2200 }[k], I, dist, decay);
    l.position.set(x, y, z); scene.add(l);
  }
  scene.add(new THREE.HemisphereLight(S.hemiColors[0], S.hemiColors[1], hover.hemi));

  const draco = new DRACOLoader(); draco.setDecoderPath('/draco/');
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  const glb = await loader.loadAsync(S.glb);
  const root = glb.scene;
  const mat = new THREE.MeshPhongMaterial({ ...S.mat, color: new THREE.Color(S.mat.color), emissive: new THREE.Color(S.mat.emissive), specular: new THREE.Color(S.mat.specular) });
  root.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = true; o.receiveShadow = true; } });
  if (S.fit) { // blog: centre and auto-fit like BlogRobotViewer
    const box = new THREE.Box3().setFromObject(root); const c = box.getCenter(new THREE.Vector3()); const sz = box.getSize(new THREE.Vector3());
    root.position.set(-c.x, -c.y, -c.z); root.scale.setScalar(S.fit / Math.max(sz.x, sz.y, sz.z));
  } else { root.position.set(...S.pos); root.scale.setScalar(S.scale); }
  root.rotation.set(...(S.portrait?.rot ?? S.rot));
  scene.add(root);

  const mixer = new THREE.AnimationMixer(root); mixer.timeScale = S.timeScale;
  if (glb.animations.length) mixer.clipAction(glb.animations[0]).play();
  mixer.update(S.time || 0);
  const elapsed = S.time || 0;
  if (spot) spot.intensity *= 1 + Math.sin(elapsed * 0.8) * 0.33;
  cyan.position.x = Math.cos(elapsed * 0.3) * S.cyanRadius;
  cyan.position.z = Math.sin(elapsed * 0.3) * S.cyanRadius;
  magenta.intensity *= 1 + Math.sin(elapsed * 1.2) * 0.4;

  // Reported back so a camera can be tuned from numbers, not guesses.
  root.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(root);
  out.bbox = { min: bb.min.toArray(), max: bb.max.toArray(), center: bb.getCenter(new THREE.Vector3()).toArray(), size: bb.getSize(new THREE.Vector3()).toArray() };

  const cam = S.portrait?.cam ?? S.cam, target = S.portrait?.target ?? S.target, fov = S.portrait?.fov ?? S.fov;
  for (const { suffix, w, h } of SIZES) {
    const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 1000);
    camera.position.set(...cam); camera.lookAt(...target);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, precision: 'mediump', preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 0); renderer.setPixelRatio(1); renderer.setSize(w, h);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
    document.getElementById('mount').appendChild(renderer.domElement);

    const rt = new THREE.WebGLRenderTarget(w, h, { format: THREE.RGBAFormat, type: THREE.UnsignedByteType });
    const composer = new EffectComposer(renderer, rt);
    const rp = new RenderPass(scene, camera); rp.clearAlpha = 0; composer.addPass(rp);
    composer.addPass(new ShaderPass({
      uniforms: { tDiffuse: { value: null }, resolution: { value: new THREE.Vector2(w, h) } },
      vertexShader: SOBEL_VERT, fragmentShader: SOBEL_FRAG,
    }));
    composer.render();
    out.sizes[suffix] = renderer.domElement.toDataURL('image/png').split(',')[1];
    composer.dispose(); rt.dispose(); renderer.dispose(); renderer.domElement.remove();
  }
} catch (e) { out.error = String(e && e.stack || e); }
out.ms = Math.round(performance.now() - t0);
await fetch('/out?model=' + encodeURIComponent(which), { method: 'POST', body: JSON.stringify(out) });
document.title = 'DONE';
</script>
`;
}

// ---------------------------------------------------------------------------
// Static server. Only the three directories the page needs are reachable.
// ---------------------------------------------------------------------------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const SERVED_PREFIXES = ['/node_modules/three/', '/models/', '/draco/'];
const DISK = { '/node_modules/three/': join(ROOT, 'node_modules', 'three'), '/models/': join(ROOT, 'public', 'models'), '/draco/': join(ROOT, 'public', 'draco') };

function startServer(page, onResult) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (req.method === 'POST' && url.pathname === '/out') {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        res.writeHead(200).end('ok');
        onResult(url.searchParams.get('model'), JSON.parse(Buffer.concat(chunks).toString('utf8')));
        return;
      }
      if (url.pathname === '/render.html') {
        res.writeHead(200, { 'content-type': 'text/html' }).end(page);
        return;
      }
      const prefix = SERVED_PREFIXES.find((p) => url.pathname.startsWith(p));
      if (!prefix) { res.writeHead(404).end(); return; }
      const rel = normalize(decodeURIComponent(url.pathname.slice(prefix.length)));
      if (rel.startsWith('..') || rel.includes(`..${sep}`)) { res.writeHead(403).end(); return; }
      try {
        const data = await readFile(join(DISK[prefix], rel));
        res.writeHead(200, { 'content-type': MIME[extname(rel)] || 'application/octet-stream' }).end(data);
      } catch {
        res.writeHead(404).end();
      }
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

// ---------------------------------------------------------------------------
// Chrome. One process per model, fresh profile, killed as soon as the page
// has posted its result. Errors go to a log next to the profile so a failed
// render can be diagnosed without re-running.
// ---------------------------------------------------------------------------
async function renderInChrome(port, model, sizes, workDir) {
  const profile = join(workDir, `profile-${model}`);
  const sizesParam = sizes.map((s) => `${s.suffix}:${s.w}:${s.h}`).join(',');
  const url = `http://127.0.0.1:${port}/render.html?model=${model}&sizes=${sizesParam}`;
  const maxW = Math.max(...sizes.map((s) => s.w)) + 40;
  const maxH = Math.max(...sizes.map((s) => s.h)) + 40;
  const args = [
    '--headless=new', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`,
    // SwiftShader: a software GL that renders the same on every machine and
    // does not need a display. Slow (tens of seconds per scene) but exact.
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    `--window-size=${maxW},${maxH}`, url,
  ];
  const log = [];
  const child = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  child.stdout.on('data', (d) => log.push(d));
  child.stderr.on('data', (d) => log.push(d));
  return {
    stop: async () => {
      // Chrome forks helpers; kill the whole process group so none linger.
      try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch {} }
      await writeFile(join(workDir, `chrome-${model}.log`), Buffer.concat(log));
    },
  };
}

// ---------------------------------------------------------------------------
async function main() {
  const argv = process.argv.slice(2);
  const onlyIdx = argv.indexOf('--only');
  const only = onlyIdx !== -1 ? argv[onlyIdx + 1].split(',') : Object.keys(SETUPS);
  const keepPng = argv.includes('--png');
  for (const m of only) if (!SETUPS[m]) throw new Error(`unknown model "${m}"; expected one of ${Object.keys(SETUPS).join(', ')}`);

  try { await stat(CHROME); } catch { throw new Error(`Chrome not found at ${CHROME}; this script needs a local Chrome`); }
  await mkdir(OUT_DIR, { recursive: true });
  const workDir = await mkdtemp(join(tmpdir(), 'model-posters-'));

  const pending = new Map(); // model -> resolve(result)
  const page = renderPage(SETUPS);
  const { server, port } = await startServer(page, (model, result) => pending.get(model)?.(result));
  console.log(`[posters] serving ${ROOT} on 127.0.0.1:${port}, work dir ${workDir}`);

  const written = [];
  let failed = false;
  try {
    for (const model of only) {
      const t0 = Date.now();
      const resultPromise = new Promise((resolve, reject) => {
        pending.set(model, resolve);
        setTimeout(() => reject(new Error(`timed out after ${RENDER_TIMEOUT_MS / 1000}s`)), RENDER_TIMEOUT_MS).unref();
      });
      const chrome = await renderInChrome(port, model, SIZES, workDir);
      let result;
      try {
        result = await resultPromise;
      } catch (err) {
        console.error(`[posters] ${model}: ${err.message} (see ${join(workDir, `chrome-${model}.log`)})`);
        failed = true;
        continue;
      } finally {
        // Whether the page posted or timed out, Chrome goes and the resolver
        // goes with it: a late POST from a killed render must not be able to
        // resolve anything.
        await chrome.stop();
        pending.delete(model);
      }

      if (result.error) {
        console.error(`[posters] ${model}: render failed\n${result.error}`);
        failed = true;
        continue;
      }
      const bb = result.bbox;
      const f = (v) => v.map((n) => n.toFixed(2)).join(', ');
      console.log(`[posters] ${model}: rendered in ${result.ms} ms (chrome ${((Date.now() - t0) / 1000).toFixed(1)} s); model bbox centre [${f(bb.center)}] size [${f(bb.size)}]`);

      for (const { suffix, w, h } of SIZES) {
        const png = Buffer.from(result.sizes[suffix], 'base64');
        const meta = await sharp(png).metadata();
        if (meta.width !== w || meta.height !== h) throw new Error(`${model} ${suffix}: rendered ${meta.width}x${meta.height}, expected ${w}x${h}`);
        const stats = await sharp(png).stats();
        const luma = stats.channels.slice(0, 3).reduce((s, c) => s + c.mean, 0) / 3;
        // A poster that came out black is a silent failure: the page would
        // show nothing and nobody would know. Refuse to write it.
        if (luma < 3) throw new Error(`${model} ${suffix}: mean luma ${luma.toFixed(1)}/255, the scene rendered black`);

        // bg-secondary is #000000; the poster sits directly on it.
        const base = sharp(png).flatten({ background: '#000000' });
        const outputs = [
          [`${model}-${suffix}.webp`, await base.clone().webp({ quality: WEBP_QUALITY }).toBuffer()],
          [`${model}-${suffix}.avif`, await base.clone().avif({ quality: AVIF_QUALITY[suffix], effort: 6 }).toBuffer()],
        ];
        if (keepPng) outputs.push([`${model}-${suffix}.png`, png]);
        for (const [name, buf] of outputs) {
          await writeFile(join(OUT_DIR, name), buf);
          written.push([name, buf.length]);
        }
        console.log(`           ${suffix} ${w}x${h}  luma ${luma.toFixed(1)}  ` + outputs.map(([n, b]) => `${extname(n).slice(1)} ${b.length.toLocaleString()} B`).join('  '));
      }
    }
  } finally {
    server.close();
    if (!failed) await rm(workDir, { recursive: true, force: true });
  }

  if (failed) {
    console.error(`[posters] some renders failed; work dir kept at ${workDir}`);
    process.exit(1);
  }
  console.log(`[posters] wrote ${written.length} files to public/models/posters`);
}

main().catch((err) => {
  console.error(`[posters] ${err.message}`);
  process.exit(1);
});
