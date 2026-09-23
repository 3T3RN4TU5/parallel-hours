'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import { Canvas, advance } from '@react-three/fiber';
import World from './World';
import { rt } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(e: unknown) { console.warn('GL init failed', e); rt.glFailed = true; }
  render() { return this.state.failed ? null : this.props.children; }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/**
 * Fixed full-viewport WebGL layer. Rendering is driven by the shared ticker
 * (frameloop "never" + advance) so scroll choreography and the 3D frame stay
 * in lockstep; rAF pauses automatically while the tab is hidden.
 */
export default function ThreeScene() {
  const [cfg, setCfg] = useState<{ tier: 0 | 1; dpr: number; aa: boolean } | null>(null);

  useEffect(() => {
    if (!hasWebGL()) { rt.glFailed = true; return; }
    const tier: 0 | 1 = rt.mob || (navigator.hardwareConcurrency || 4) <= 4 ? 0 : 1;
    setCfg({ tier, dpr: Math.min(window.devicePixelRatio || 1, tier ? 2 : 1.5), aa: !rt.mob });
    return addTick(now => { if (rt.glReady && !document.hidden) advance(now); }, 90);
  }, []);

  if (!cfg) return null;
  return (
    <GLBoundary>
      <Canvas
        frameloop="never"
        flat
        linear
        legacy
        dpr={[1, cfg.dpr]}
        gl={{ antialias: cfg.aa, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 6] }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); rt.glReady = true; }}
      >
        <World tier={cfg.tier} />
      </Canvas>
    </GLBoundary>
  );
}
