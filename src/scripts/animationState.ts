/**
 * Animation State Management
 *
 * Tracks which page intro animations have been seen during a browser session.
 * Uses sessionStorage so state persists during navigation but resets on tab close.
 */

const STORAGE_KEY = 'seenAnimations';

export type AnimationKey = 'projects-intro' | 'blog-intro';

/**
 * Check if an animation has already been seen this session
 */
export function hasSeenAnimation(key: AnimationKey): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) return false;

    const seenAnimations: string[] = JSON.parse(seen);
    return seenAnimations.includes(key);
  } catch {
    return false;
  }
}

/**
 * Mark an animation as seen
 */
export function markAnimationSeen(key: AnimationKey): void {
  if (typeof window === 'undefined') return;

  try {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    const seenAnimations: string[] = seen ? JSON.parse(seen) : [];

    if (!seenAnimations.includes(key)) {
      seenAnimations.push(key);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seenAnimations));
    }
  } catch {
    // Silently fail if sessionStorage is not available
  }
}

/**
 * Clear all animation state (useful for testing)
 */
export function clearAnimationState(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
