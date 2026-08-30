/**
 * Runs `onReady` once the element has a non-zero layout size.
 *
 * Every WebGL viewer on this site sizes its camera and drawing buffer from a
 * live DOM measurement. If that measurement happens before layout has given the
 * container a size, the camera aspect becomes 0/0 (NaN) and the renderer
 * allocates a 0x0 drawing buffer. That failure is silent and it does not look
 * like a missing canvas: the stylesheets stretch the dead buffer across the
 * whole hero, so it paints a flat panel where the scene should be.
 *
 * Calls back synchronously when the element already has a size, so the common
 * path costs nothing.
 *
 * Returns a cancel function. Call it from the component's cleanup so a pending
 * wait cannot fire against a container that has since been swapped away.
 */
export function whenSized(
  el: HTMLElement,
  onReady: () => void,
  { timeoutMs = 4000, pollMs = 100 }: { timeoutMs?: number; pollMs?: number } = {}
): () => void {
  const hasSize = () => el.clientWidth > 0 && el.clientHeight > 0;

  if (hasSize()) {
    onReady();
    return () => {};
  }

  let settled = false;
  let pollId = 0;
  let waited = 0;

  const observer =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => attempt()) : null;

  const cancel = () => {
    settled = true;
    observer?.disconnect();
    if (pollId) clearTimeout(pollId);
  };

  function attempt() {
    if (settled) return;
    if (hasSize()) {
      cancel();
      onReady();
    }
  }

  // ResizeObserver is the right primary signal, but its callbacks are delivered
  // with the rendering steps, which a backgrounded tab throttles. The poll makes
  // recovery independent of that, and bounds the wait so a container that never
  // gets a size does not leave a timer running forever.
  const poll = () => {
    if (settled) return;
    waited += pollMs;
    if (waited > timeoutMs) {
      cancel();
      return;
    }
    attempt();
    if (!settled) pollId = window.setTimeout(poll, pollMs);
  };

  observer?.observe(el);
  pollId = window.setTimeout(poll, pollMs);

  return cancel;
}
