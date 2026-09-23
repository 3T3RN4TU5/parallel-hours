import Lenis from 'lenis';
import { rt, ensureEnv } from './runtime';
import { addTick } from './ticker';

let lenis: Lenis | null = null;

/** Smooth scroll (Lenis), disabled for reduced motion. Returns a cleanup. */
export function initSmoothScroll() {
  ensureEnv();
  if (rt.reduced) return () => {};
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const off = addTick(now => lenis?.raf(now), -10);
  return () => { off(); lenis?.destroy(); lenis = null; };
}

/** Jump without smoothing (used under the scene-transition wipe). */
export function jumpTo(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, behavior: 'instant' });
}
