// Design tweak defaults chosen in the design handoff.
export const ACCENT = '#C8FF3C';
export const GRAIN = true;
/** Multiplies the object's noise displacement amplitude (range 0.3–2). */
export const INTENSITY = 2;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://parallelhours.studio';
export const EMAIL = 'hello@parallelhours.studio';

export const SCENES = ['Introduction', 'Discovery', 'Transformation', 'Worlds', 'Index', 'Finale'] as const;

export type GenKind = 'flow' | 'rings' | 'dunes' | 'halftone' | 'bars';

export interface Project {
  n: string;
  t: string;
  d: string;
  y: string;
  kind: GenKind;
  seed: number;
  inv: boolean;
  w: string;
  h: string;
  self: 'center' | 'flex-start' | 'flex-end';
  alt: string;
}

export const PROJECTS: Project[] = [
  { n: '01', t: 'Tidal Archive', d: 'Installation · WebGL', y: '2026', kind: 'flow', seed: 11, inv: false, w: 'max(36vw,300px)', h: '60vh', self: 'center', alt: 'Generative flow lines, key visual for Tidal Archive' },
  { n: '02', t: 'Hollow Choir', d: 'Album world · Spatial sound', y: '2025', kind: 'rings', seed: 23, inv: true, w: 'max(24vw,250px)', h: '44vh', self: 'flex-end', alt: 'Concentric rings, key visual for Hollow Choir' },
  { n: '03', t: 'Atlas of Slow Things', d: 'Data story · Editorial', y: '2025', kind: 'dunes', seed: 5, inv: false, w: 'max(40vw,320px)', h: '50vh', self: 'flex-start', alt: 'Layered ridge lines, key visual for Atlas of Slow Things' },
  { n: '04', t: 'Ferrous', d: 'Real-time 3D configurator', y: '2024', kind: 'halftone', seed: 41, inv: false, w: 'max(26vw,260px)', h: '58vh', self: 'center', alt: 'Halftone sphere, key visual for Ferrous' },
  { n: '05', t: 'Night Shift Museum', d: 'Virtual exhibition', y: '2024', kind: 'bars', seed: 7, inv: true, w: 'max(32vw,280px)', h: '46vh', self: 'flex-end', alt: 'Rhythmic bars, key visual for Night Shift Museum' },
  { n: '06', t: 'Paper Satellites', d: 'Learning game · Mobile', y: '2023', kind: 'flow', seed: 99, inv: true, w: '', h: '', self: 'center', alt: 'Generative flow lines, key visual for Paper Satellites' },
];

/** Words prefixed with * render italic in the accent colour. */
export const MANIFESTO =
  "Parallel Hours is an independent studio for interactive worlds. We treat code like *clay, light like *paint and scroll like *time — building experiences people don't just see, but remember with their hands.";

export const CAPS = [
  { k: 'Stage 01', t: 'Solid', b: 'Every project begins as a mass — dense, undivided, full of possibility. We start by holding it in our hands and listening to it.' },
  { k: 'Stage 02', t: 'Fracture', b: 'Then we break it open. Research, prototypes and failed experiments reveal the structure that was hiding inside.' },
  { k: 'Stage 03', t: 'System', b: 'The pieces become a system: typography, motion, sound and code orbiting a single idea, each fragment in its place.' },
];
