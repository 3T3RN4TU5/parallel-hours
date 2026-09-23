import { rt, mix, ensureEnv } from './runtime';

// One requestAnimationFrame loop drives the whole page: smooth scroll, shared
// input state, every scene's scroll choreography and the WebGL render.

type Tick = (now: number) => void;

const subs: { fn: Tick; order: number }[] = [];
let raf = 0;
let last = 0;

/** Register a per-frame callback. Lower order runs first. Returns an unsubscribe. */
export function addTick(fn: Tick, order = 10) {
  ensureEnv();
  const entry = { fn, order };
  subs.push(entry);
  subs.sort((a, b) => a.order - b.order);
  if (!raf && typeof window !== 'undefined') raf = requestAnimationFrame(loop);
  return () => {
    const i = subs.indexOf(entry);
    if (i >= 0) subs.splice(i, 1);
    if (!subs.length && raf) { cancelAnimationFrame(raf); raf = 0; last = 0; }
  };
}

function loop(now: number) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  rt.dt = dt;
  rt.time += dt * (rt.reduced ? 0.3 : 1);
  rt.frame++;

  // Negative-order subscribers (smooth scroll) run before shared state is read.
  let i = 0;
  for (; i < subs.length && subs[i].order < 0; i++) subs[i].fn(now);

  const sy = window.scrollY, vw = window.innerWidth, vh = window.innerHeight;
  const v = sy - (rt.lastY ?? sy);
  rt.lastY = sy;
  rt.vel += (v - rt.vel) * 0.12;
  if (Math.abs(v) > 0.5) rt.dir = Math.sign(v);

  const m = rt.m, ml = rt.reduced ? 1 : 0.07;
  m.x = mix(m.x, m.tx, ml);
  m.y = mix(m.y, m.ty, ml);
  m.nx = (m.x / vw) * 2 - 1;
  m.ny = (m.y / vh) * 2 - 1;

  rt.charge = rt.down ? Math.min(1, rt.charge + dt * 0.75) : Math.max(0, rt.charge - dt * 1.6);

  for (; i < subs.length; i++) subs[i].fn(now);
}
