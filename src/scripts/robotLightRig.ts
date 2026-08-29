import * as THREE from 'three';

/**
 * The single lighting rig shared by every 3D robot viewer.
 *
 * The four viewers were each carrying their own hand-tuned copy of the same
 * seven lights, and the intensities had drifted badly apart — the key light
 * ranged from 0.18 on the home page to 0.9 on the projects page, a 5x spread,
 * so the same model read as a different object on every route.
 *
 * The light *ratios* live here and never vary; each page passes a single
 * `exposure` multiplier. That keeps the rig uniform in character while letting
 * a page be deliberately moodier or brighter than its neighbours.
 */

/** Base intensities at `exposure: 1`. Tuned as a set — change them together. */
const BASE = {
  ambient: 0.18,
  key: 0.55,
  fill: 0.2,
  cyan: 0.32,
  magenta: 0.26,
  rim: 0.34,
  spot: 0.3,
} as const;

const COLOR = {
  ambient: 0x404040,
  key: 0xffffff,
  fill: 0x8899ff,
  cyan: 0x00ffff,
  magenta: 0xff00ff,
  rim: 0xffffff,
  spot: 0xffffff,
} as const;

export interface RobotLightRigOptions {
  /** Master intensity multiplier applied to every light in the rig. */
  exposure?: number;
  /**
   * Distance multiplier for the light positions, for scenes whose model is
   * framed further from the origin (the contact viewer sits ~1.6x out).
   */
  scale?: number;
  /**
   * Include the overhead spotlight. Off for scenes where the model is not near
   * the origin, since a fixed overhead spot would not reach it.
   */
  spotlight?: boolean;
  /** Shadow map resolution for the key light. */
  shadowMapSize?: number;
}

export interface RobotLightRig {
  ambientLight: THREE.AmbientLight;
  mainLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  cyanAccent: THREE.PointLight;
  magentaAccent: THREE.PointLight;
  rimLight: THREE.DirectionalLight;
  spotlight: THREE.SpotLight | null;
  /** Every light created, for disposal/removal. */
  all: THREE.Light[];
}

/**
 * Builds the rig and adds it to `scene`.
 *
 * Only the key light casts shadows. Previously the home and contact viewers
 * also had a shadow-casting spotlight, which meant rendering two shadow maps
 * per frame for a scene that runs behind a Sobel post-process where the second
 * one was barely legible.
 */
export function createRobotLightRig(
  scene: THREE.Scene,
  options: RobotLightRigOptions = {}
): RobotLightRig {
  const {
    exposure = 1,
    scale = 1,
    spotlight: withSpotlight = true,
    shadowMapSize = 1024,
  } = options;

  const i = (base: number) => base * exposure;
  const s = (x: number, y: number, z: number) =>
    [x * scale, y * scale, z * scale] as const;

  const ambientLight = new THREE.AmbientLight(COLOR.ambient, i(BASE.ambient));
  scene.add(ambientLight);

  // KEY LIGHT — top-right, the only shadow caster.
  const mainLight = new THREE.DirectionalLight(COLOR.key, i(BASE.key));
  mainLight.position.set(...s(3, 5, 4));
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = shadowMapSize;
  mainLight.shadow.mapSize.height = shadowMapSize;
  mainLight.shadow.bias = -0.001;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 20 * scale;
  mainLight.shadow.camera.left = -5 * scale;
  mainLight.shadow.camera.right = 5 * scale;
  mainLight.shadow.camera.top = 5 * scale;
  mainLight.shadow.camera.bottom = -5 * scale;
  scene.add(mainLight);

  // FILL — cool, from the opposite side, softens the shadow terminator.
  const fillLight = new THREE.DirectionalLight(COLOR.fill, i(BASE.fill));
  fillLight.position.set(...s(-3, 2, 2));
  scene.add(fillLight);

  // CYAN / MAGENTA accents — the complementary colour pop.
  const cyanAccent = new THREE.PointLight(COLOR.cyan, i(BASE.cyan), 10 * scale);
  cyanAccent.position.set(...s(-2, 1, 3));
  scene.add(cyanAccent);

  const magentaAccent = new THREE.PointLight(COLOR.magenta, i(BASE.magenta), 10 * scale);
  magentaAccent.position.set(...s(2, 0.5, -2));
  scene.add(magentaAccent);

  // RIM — backlight that separates the silhouette from the black background.
  const rimLight = new THREE.DirectionalLight(COLOR.rim, i(BASE.rim));
  rimLight.position.set(...s(0, 3, -5));
  scene.add(rimLight);

  let spotlight: THREE.SpotLight | null = null;
  if (withSpotlight) {
    spotlight = new THREE.SpotLight(COLOR.spot, i(BASE.spot));
    spotlight.position.set(...s(0, 6, 0));
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.5;
    spotlight.decay = 2;
    spotlight.distance = 20 * scale;
    spotlight.castShadow = false;
    scene.add(spotlight);
  }

  const all: THREE.Light[] = [
    ambientLight, mainLight, fillLight, cyanAccent, magentaAccent, rimLight,
  ];
  if (spotlight) all.push(spotlight);

  return { ambientLight, mainLight, fillLight, cyanAccent, magentaAccent, rimLight, spotlight, all };
}

/**
 * Per-route exposure. Uniform rig, deliberately different mood per page —
 * the home hero is the darkest because the robot sits behind the hero copy
 * under a heavy scrim, the projects hero is the brightest because the model
 * is the subject there.
 */
export const ROBOT_EXPOSURE = {
  home: 0.42,
  blog: 0.85,
  contact: 0.65,
  project: 1.15,
} as const;
