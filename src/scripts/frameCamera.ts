/**
 * Keep a hero's subject framed when the viewport is not the shape the scene
 * was composed for.
 *
 * All four robot scenes were framed on a wide desktop hero. A three.js
 * PerspectiveCamera holds its VERTICAL field of view fixed and derives the
 * horizontal one from the aspect ratio, so as the viewport narrows the
 * horizontal view closes in and the subject grows to fill it. On a 390x844
 * phone (aspect 0.46 against roughly 1.6 on the desktop hero) that put the
 * robot on top of the headline rather than behind it: the home robot's torso
 * covered "ROHAN SINGH", the contact robot covered its own call to action,
 * and the blog keyboard cut a band straight through "CHRONICLES".
 *
 * The textbook fix is to widen the vertical FOV until the horizontal FOV
 * matches the design, but the numbers are brutal at phone aspect: holding a
 * 75 degree wide-hero framing needs about 138 degrees vertically, which
 * smears everything near the edges. Moving the camera further from its target
 * costs nothing in distortion, so that is what this does.
 *
 * A full correction (pulling back by designAspect / aspect) restores the
 * horizontal coverage exactly and leaves the subject looking like a speck in
 * a tall frame, because a portrait hero has height to spare. SOFTEN trades
 * some of that back so the robot still carries the hero.
 *
 * The camera is moved along its CURRENT direction from the target, not the
 * authored one, so a visitor who has orbited the model keeps their angle
 * through a resize (an iOS toolbar collapse fires one on every scroll).
 */
import type { PerspectiveCamera, Vector3 } from 'three';

/** The aspect ratio the scenes were composed at. Above this, nothing changes. */
const DESIGN_ASPECT = 1.6;

/**
 * 1 would fully restore horizontal coverage and shrink the subject too far;
 * 0 would disable the correction. 0.6 keeps the robot dominant on a phone
 * while pulling it clear of the copy.
 */
const SOFTEN = 0.6;

/** A tall phone in portrait lands near 2.2x; past that the subject is lost. */
const MAX_DOLLY = 2.6;

/**
 * How much further from its target the camera should sit at this aspect
 * ratio. 1 means "the framing the scene was authored with".
 */
export function dollyFactor(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect <= 0 || aspect >= DESIGN_ASPECT) return 1;
  return Math.min(MAX_DOLLY, Math.pow(DESIGN_ASPECT / aspect, SOFTEN));
}

/**
 * Set the camera's distance from `target` to suit `aspect`, keeping its
 * current direction, and refresh the projection.
 *
 * `baseDistance` is the authored distance, captured once at scene setup so
 * repeated resizes cannot compound. Returns the factor applied, so the caller
 * can widen OrbitControls' own distance limits to match: without that,
 * controls.update() clamps the camera straight back to the desktop framing.
 */
export function frameCameraForAspect(
  camera: PerspectiveCamera,
  target: Vector3,
  baseDistance: number,
  aspect: number,
): number {
  const factor = dollyFactor(aspect);

  const dir = camera.position.clone().sub(target);
  const len = dir.length();
  // A camera sitting exactly on its target has no direction to preserve.
  if (len > 1e-6) {
    dir.divideScalar(len);
    camera.position.copy(target).addScaledVector(dir, baseDistance * factor);
  }

  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  return factor;
}
