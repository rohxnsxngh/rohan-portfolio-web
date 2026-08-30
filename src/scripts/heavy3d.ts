/**
 * Whether this device should skip the heavy WebGL heroes.
 *
 * The model viewers download several megabytes of geometry and then run a scene
 * with a Sobel post-process pass every frame. That is a reasonable trade on a
 * desktop and a bad one on a phone: before this gate a handset on cellular
 * pulled the full hero model and ran the same render loop as a workstation.
 *
 * Skipping is not a degraded page. These viewers sit behind the hero copy under
 * a heavy scrim, so what is lost is ambience, and what is gained is several
 * megabytes and a great deal of battery.
 *
 * Deliberately not gated on deviceMemory: it reports 4GB or less on plenty of
 * capable laptops, so it would switch the effect off for people who can afford
 * it.
 */
export function shouldSkipHeavy3D(): boolean {
  if (typeof window === 'undefined') return true;

  // Someone who has asked for less motion should not get an animated 3D scene.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  // Phones and small tablets. Also catches desktop windows dragged very narrow,
  // which is the right call for the same reasons.
  if (window.matchMedia('(max-width: 767px)').matches) return true;

  const connection =
    (navigator as any).connection ??
    (navigator as any).mozConnection ??
    (navigator as any).webkitConnection;

  if (connection) {
    // Explicit user request to conserve data.
    if (connection.saveData) return true;
    // 2g and slow-2g will not finish a multi-megabyte download in useful time.
    if (typeof connection.effectiveType === 'string' && /(^|-)2g$/.test(connection.effectiveType)) {
      return true;
    }
  }

  return false;
}
