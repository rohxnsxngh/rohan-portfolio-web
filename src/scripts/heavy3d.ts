/**
 * Whether this device should skip the heavy WebGL heroes, and the loader
 * that fetches three.js for the devices that do not skip it.
 *
 * The model viewers download several megabytes of geometry and then run a
 * scene with a Sobel post-process pass every frame. That is a reasonable trade
 * on a desktop and a bad one on a phone: before this gate a handset on cellular
 * pulled the full hero model and ran the same render loop as a workstation.
 *
 * Skipping is not a degraded page. These viewers sit behind the hero copy under
 * a heavy scrim, so what is lost is ambience, and what is gained is several
 * megabytes and a great deal of battery. Phones now get a still poster of the
 * same scene and a "View in 3D" tap target instead, which is why the viewers
 * need to know *why* the gate fired and not just that it did: a phone skipped
 * for width alone can opt in, a data-saver or reduced-motion visitor cannot.
 *
 * Deliberately not gated on deviceMemory: it reports 4GB or less on plenty of
 * capable laptops, so it would switch the effect off for people who can afford
 * it.
 */
export type Heavy3DSkipReason = 'reduced-motion' | 'data' | 'width';

/**
 * The first reason the heavy scene should not run, or null when it may.
 *
 * Order matters for the viewers' poster state: reduced-motion and data
 * constraints win over width, so a phone on 2g is "off" (no opt-in button)
 * rather than "poster" (tap to load).
 */
export function heavy3DSkipReason(): Heavy3DSkipReason | null {
  if (typeof window === 'undefined') return 'width';

  // Someone who has asked for less motion should not get an animated 3D scene.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced-motion';

  const connection =
    (navigator as any).connection ??
    (navigator as any).mozConnection ??
    (navigator as any).webkitConnection;

  if (connection) {
    // Explicit user request to conserve data.
    if (connection.saveData) return 'data';
    // 2g and slow-2g will not finish a multi-megabyte download in useful time.
    if (typeof connection.effectiveType === 'string' && /(^|-)2g$/.test(connection.effectiveType)) {
      return 'data';
    }
  }

  // Phones and small tablets. Also catches desktop windows dragged very narrow,
  // which is the right call for the same reasons.
  if (window.matchMedia('(max-width: 767px)').matches) return 'width';

  return null;
}

export function shouldSkipHeavy3D(): boolean {
  return heavy3DSkipReason() !== null;
}

/**
 * A touch-first device with no hover: phones and most tablets, including an
 * iPad wide enough to pass the width gate. The viewers use this to decide
 * touch handling (scroll must keep working over a full-hero canvas) and a
 * lower pixel-ratio cap, independently of whether the scene was gated.
 */
export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

// ---------------------------------------------------------------------------
// Loader
//
// three and its example modules are loaded with import() rather than static
// imports. A static import is evaluated before any of a page's own script can
// run, so a phone that was never going to render the scene still had to
// download and compile ~160 KB gz of three.js before the preloader or the
// hero intro could start. With import() the bundler emits those modules as
// separate chunks that only the devices which need them request.
//
// The four robot viewers share one loader so the import list and the module
// tuple's shape live in one place; each viewer used to carry its own copy.
//
// robotLightRig imports three statically, so it has to be loaded the same
// way or the chunk graph pulls three back into the static path.
// ---------------------------------------------------------------------------
const loadThree = () =>
  Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('three/examples/jsm/postprocessing/EffectComposer.js'),
    import('three/examples/jsm/postprocessing/RenderPass.js'),
    import('three/examples/jsm/postprocessing/ShaderPass.js'),
    import('./robotLightRig'),
  ]);

export type ThreeModules = Awaited<ReturnType<typeof loadThree>>;
/** The `three` namespace itself (Scene, PerspectiveCamera, ...). */
export type ThreeCore = ThreeModules[0];
/** The example-module classes and the shared light rig, picked off the tuple. */
export interface ThreeLib {
  GLTFLoader: ThreeModules[1]['GLTFLoader'];
  DRACOLoader: ThreeModules[2]['DRACOLoader'];
  OrbitControls: ThreeModules[3]['OrbitControls'];
  EffectComposer: ThreeModules[4]['EffectComposer'];
  RenderPass: ThreeModules[5]['RenderPass'];
  ShaderPass: ThreeModules[6]['ShaderPass'];
  createRobotLightRig: ThreeModules[7]['createRobotLightRig'];
  ROBOT_EXPOSURE: ThreeModules[7]['ROBOT_EXPOSURE'];
}

// One in-flight (or settled) load, shared by every viewer on the page.
let heavy: Promise<ThreeModules> | null = null;

function startLoad(): Promise<ThreeModules> {
  const load = loadThree();
  // A rejected load must not stay cached. On flaky cellular the first tap of
  // "View in 3D" can fail mid-fetch; if this promise were kept, every later
  // tap would re-reject instantly with no network request and the phone could
  // never load the scene until a full reload. Dropping it lets the next
  // resolveThree() start a fresh import(). (Some browsers also cache a failed
  // module fetch in the module map, so this makes retry possible rather than
  // guaranteed; without it retry is impossible everywhere.)
  //
  // Attaching the handler here also marks the promise handled, so a prefetch
  // that nothing ever awaits (a copy of a viewer's script in a page chunk that
  // is not the bindOnce owner) does not log an unhandled rejection on an
  // offline reload.
  load.catch(() => {
    if (heavy === load) heavy = null;
  });
  heavy = load;
  return load;
}

/**
 * Start fetching three if this device will run the scene. Called at each
 * viewer's module top level, not inside init(), so a desktop starts the
 * fetch as soon as its page script evaluates. Phones leave it alone and
 * resolve on demand from the tap-to-load button.
 */
export function prefetchThree(): void {
  if (heavy || heavy3DSkipReason() !== null) return;
  startLoad();
}

/** The modules, fetching them now if no prefetch happened (or it failed). */
export function resolveThree(): Promise<ThreeModules> {
  return heavy ?? startLoad();
}

/** Unpack the loaded tuple into the two handles the viewers keep. */
export function adoptModules([
  three,
  gltf,
  draco,
  orbit,
  composerMod,
  renderMod,
  shaderMod,
  rig,
]: ThreeModules): { THREE: ThreeCore; lib: ThreeLib } {
  return {
    THREE: three,
    lib: {
      GLTFLoader: gltf.GLTFLoader,
      DRACOLoader: draco.DRACOLoader,
      OrbitControls: orbit.OrbitControls,
      EffectComposer: composerMod.EffectComposer,
      RenderPass: renderMod.RenderPass,
      ShaderPass: shaderMod.ShaderPass,
      createRobotLightRig: rig.createRobotLightRig,
      ROBOT_EXPOSURE: rig.ROBOT_EXPOSURE,
    },
  };
}
