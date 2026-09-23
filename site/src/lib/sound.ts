import { rt } from './runtime';

// Optional Web Audio layer. Nothing is created until the user turns sound on.

let ctx: AudioContext | null = null;
let master: GainNode;
let droneG: GainNode;
let dO: OscillatorNode;
let dF: BiquadFilterNode;

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const c = (ctx = new AC());
  master = c.createGain(); master.gain.value = 0; master.connect(c.destination);
  const o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter();
  droneG = c.createGain(); droneG.gain.value = 0;
  o.type = 'sawtooth'; o.frequency.value = 55;
  o2.type = 'sine'; o2.frequency.value = 82.5;
  f.type = 'lowpass'; f.frequency.value = 400;
  o.connect(f); o2.connect(f); f.connect(droneG); droneG.connect(master);
  o.start(); o2.start();
  dO = o; dF = f;
  return c;
}

/** Short sine blip with a pitch drop over 250ms. Silent unless sound is on. */
export function blip(freq = 660, vol = 0.12) {
  if (!rt.sound || !ctx) return;
  const c = ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.2);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.3);
}

/** Returns false when Web Audio is unavailable. */
export function setSound(on: boolean) {
  const c = ensure();
  if (!c) return false;
  c.resume?.();
  master.gain.setTargetAtTime(on ? 0.5 : 0, c.currentTime, 0.15);
  rt.sound = on;
  blip(on ? 880 : 440, 0.15);
  return true;
}

/** Drone follows the hold-to-charge amount. Called every frame. */
export function updateDrone(charge: number) {
  if (!ctx || !rt.sound) return;
  const t = ctx.currentTime;
  droneG.gain.setTargetAtTime(0.02 + charge * 0.18, t, 0.1);
  dO.frequency.setTargetAtTime(55 + charge * 55, t, 0.1);
  dF.frequency.setTargetAtTime(300 + charge * 1800, t, 0.1);
}

export function disposeSound() {
  ctx?.close();
  ctx = null;
  rt.sound = false;
}
