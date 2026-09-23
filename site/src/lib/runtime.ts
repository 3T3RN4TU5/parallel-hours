// Shared mutable per-frame state. Written by the ticker and interaction
// handlers, read by every scene. Kept outside React so 60fps updates never
// trigger re-renders.

export interface Choreo {
  x: number; y: number; s: number; ex: number; noise: number;
  op: number; tw: number; cz: number; heat: number; spread: number;
}

export const rt = {
  reduced: false,
  fine: false,
  mob: false,
  /** Mouse: target (tx,ty), lerped (x,y), normalised lerped (nx,ny in −1..1). */
  m: { x: 0, y: 0, tx: 0, ty: 0, nx: 0, ny: 0 },
  time: 0,
  dt: 0,
  frame: 0,
  /** Smoothed scroll velocity (px/frame) and last non-zero direction. */
  vel: 0,
  dir: 1,
  lastY: null as number | null,
  /** Hold-to-charge amount 0..1. */
  charge: 0,
  down: false,
  dragV: 0,
  rot: 0,
  /** Preloader has exited. */
  entered: false,
  glReady: false,
  glFailed: false,
  sound: false,
  /** Horizontal track offset (px); reset by scene jumps. */
  hx: 0,
  /** Transformation pin progress 0..1. */
  tp: 0,
  fragments: 0,
  /** Current (lerped) 3D choreography values. */
  C: { x: 0, y: 0, s: 1, ex: 0, noise: 0.2, op: 0, tw: 0, cz: 6, heat: 0, spread: 0 } as Choreo,
};

let envReady = false;
/** Detect device capabilities once, on the client. Safe to call repeatedly. */
export function ensureEnv() {
  if (envReady || typeof window === 'undefined') return;
  envReady = true;
  rt.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  rt.fine = matchMedia('(pointer: fine)').matches;
  rt.mob = innerWidth < 768;
  const cx = innerWidth / 2, cy = innerHeight / 2;
  Object.assign(rt.m, { x: cx, y: cy, tx: cx, ty: cy });
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** How far an element has entered the viewport from below (0 → top at bottom edge, 1 → top at top edge). */
export const enterProgress = (el: Element | null, vh: number) =>
  el ? clamp01(1 - el.getBoundingClientRect().top / vh) : 0;

/** Progress through a tall pinned section (0 at its top, 1 when its bottom reaches the viewport bottom). */
export const pinProgress = (el: Element | null, vh: number) => {
  if (!el) return 0;
  const b = el.getBoundingClientRect();
  return clamp01(-b.top / Math.max(1, b.height - vh));
};
