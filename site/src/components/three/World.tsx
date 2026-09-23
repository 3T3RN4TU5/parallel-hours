'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { VS, FS, PVS, PFS } from '@/lib/shaders';
import { ACCENT, INTENSITY } from '@/lib/content';
import { rt, mix, smoothstep, enterProgress, type Choreo } from '@/lib/runtime';

const byId = (() => {
  const cache: Record<string, HTMLElement | null> = {};
  return (id: string) => (cache[id]?.isConnected ? cache[id] : (cache[id] = document.getElementById(id)));
})();

/** Faceted chrome object + orbit rings + particle shell, choreographed by scroll. */
export default function World({ tier }: { tier: 0 | 1 }) {
  const { gl, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const rings = useRef<THREE.Line[]>([]);
  const perf = useRef({ acc: 0, n: 0, cooldown: 0 });

  const { geo, mat } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.25, tier ? 28 : 14);
    const pos = geo.attributes.position, n = pos.count;
    const cen = new Float32Array(n * 3), rnd = new Float32Array(n);
    for (let i = 0; i < n; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
      const cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
      const cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const rr = Math.random();
      for (let k = 0; k < 3; k++) {
        cen[(i + k) * 3] = cx; cen[(i + k) * 3 + 1] = cy; cen[(i + k) * 3 + 2] = cz; rnd[i + k] = rr;
      }
    }
    geo.setAttribute('aCenter', new THREE.BufferAttribute(cen, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    rt.fragments = n / 3;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uNoise: { value: 0.2 }, uExplode: { value: 0 }, uCharge: { value: 0 }, uTwist: { value: 0 },
        uAccent: { value: new THREE.Color(ACCENT) }, uOpacity: { value: 0 }, uHeat: { value: 0 }, uMouse: { value: new THREE.Vector2() },
      },
      vertexShader: VS, fragmentShader: FS, transparent: true, side: THREE.DoubleSide,
    });
    return { geo, mat };
  }, [tier]);

  const ringGeos = useMemo(
    () => [2.05, 2.45].map(k => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * k, 0, Math.sin(a) * k)); }
      return new THREE.BufferGeometry().setFromPoints(pts);
    }),
    [],
  );

  const { pgeo, pmat } = useMemo(() => {
    const N = tier ? 3200 : 1000, pp = new Float32Array(N * 3), pr = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), rad = 2.6 + Math.random() * 5.5;
      pp[i * 3] = s * Math.cos(th) * rad; pp[i * 3 + 1] = u * rad; pp[i * 3 + 2] = s * Math.sin(th) * rad; pr[i] = Math.random();
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    pgeo.setAttribute('aRand', new THREE.BufferAttribute(pr, 1));
    const pmat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSpread: { value: 0 }, uPx: { value: gl.getPixelRatio() * 2.2 }, uOp: { value: 0 }, uAccent: { value: new THREE.Color(ACCENT) } },
      vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false,
    });
    return { pgeo, pmat };
  }, [tier, gl]);

  useFrame(state => {
    const g = group.current, pts = points.current;
    if (!g || !pts) return;
    const vh = innerHeight, m = rt.m, C = rt.C, mob = rt.mob, dt = rt.dt;

    // Adaptive DPR: step down when frames run long, never below 1.
    const pf = perf.current;
    pf.acc += dt; pf.n++;
    if (pf.n >= 60) {
      const avg = pf.acc / pf.n, dpr = state.viewport.dpr;
      if (pf.cooldown-- <= 0 && avg > 1 / 45 && dpr > 1) { state.setDpr(Math.max(1, dpr - 0.25)); pf.cooldown = 2; }
      pf.acc = 0; pf.n = 0;
    }
    pmat.uniforms.uPx.value = gl.getPixelRatio() * 2.2;

    const man = enterProgress(byId('discovery'), vh);
    const trE = enterProgress(byId('transformation'), vh);
    const hzE = enterProgress(byId('worlds'), vh);
    const finE = enterProgress(byId('contact'), vh);
    const tp = rt.tp;

    const T: Choreo = { x: mob ? 0 : 1.35, y: mob ? 0.62 : 0, s: mob ? 0.72 : 1, noise: 0.22, ex: 0, op: rt.entered ? 1 : 0, tw: 0, cz: 6, heat: 0, spread: 0 };
    const a = smoothstep(0, 1, man);
    T.x = mix(T.x, mob ? 0 : -1.7, a); T.s = mix(T.s, 0.7, a); T.y = mix(T.y, 0, a);
    const b = smoothstep(0, 1, trE);
    T.x = mix(T.x, 0, b); T.s = mix(T.s, mob ? 0.8 : 1.05, b);
    const s1 = smoothstep(0, 0.3, tp), s2 = smoothstep(0.3, 0.62, tp), s3 = smoothstep(0.62, 0.95, tp);
    T.noise += s1 * 0.22 - s3 * 0.2; T.cz = 6 - s1 * 1.3 + s3 * 1.8; T.ex = s2 * 0.55 + s3 * 1.3; T.tw = s3 * 1.4;
    T.heat = s2 * 0.85 * (1 - s3 * 0.6); T.spread = s3 * 0.5;
    const o = smoothstep(0, 0.8, hzE);
    T.ex = mix(T.ex, 2.6, o); T.op = mix(T.op, 0.28, o); T.heat *= 1 - o;
    const f = smoothstep(0, 1, finE);
    T.ex = mix(T.ex, 0, f); T.op = mix(T.op, 1, f); T.s = mix(T.s, mob ? 0.7 : 0.85, f); T.tw = mix(T.tw, 0, f);
    T.noise = mix(T.noise, 0.34, f); T.cz = mix(T.cz, 6, f); T.spread = mix(T.spread, 0, f); T.x = mix(T.x, 0, f);
    T.noise *= INTENSITY; T.heat += rt.charge * 0.9;
    const k = rt.reduced ? 1 : 0.07;
    for (const key in T) { const kk = key as keyof Choreo; C[kk] += (T[kk] - C[kk]) * k; }

    const u = mat.uniforms;
    u.uTime.value = rt.time; u.uNoise.value = C.noise; u.uExplode.value = C.ex; u.uCharge.value = rt.charge;
    u.uTwist.value = C.tw; u.uOpacity.value = C.op; u.uHeat.value = C.heat; u.uMouse.value.set(m.nx, -m.ny);

    rt.rot += dt * (0.12 + rt.charge * 2.4) * (rt.reduced ? 0.3 : 1) + rt.dragV;
    rt.dragV *= 0.93;
    g.position.set(C.x + m.nx * 0.08, C.y + m.ny * 0.05, 0);
    g.scale.setScalar(C.s);
    g.rotation.set(m.ny * 0.25 + tp * 0.9, rt.rot + m.nx * 0.35, 0);
    rings.current.forEach((l, i) => {
      l.rotation.y += dt * (i ? -0.25 : 0.18);
      (l.material as THREE.LineBasicMaterial).opacity = 0.22 * C.op * (1 - s3 * 0.4) * (1 + rt.charge);
      l.scale.setScalar(1 + C.ex * 0.35);
    });
    pmat.uniforms.uTime.value = rt.time; pmat.uniforms.uSpread.value = C.spread;
    pmat.uniforms.uOp.value = Math.min(1, C.op + 0.3) * (rt.entered ? 1 : 0);
    pts.rotation.y = -m.nx * 0.08; pts.rotation.x = m.ny * 0.05 + scrollY * 0.00008;
    camera.position.set(m.nx * 0.25, -m.ny * 0.15, C.cz);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={group}>
        <mesh geometry={geo} material={mat} />
        {ringGeos.map((rg, j) => (
          <lineLoop
            key={j}
            ref={el => { if (el) rings.current[j] = el; }}
            geometry={rg}
            rotation={[j ? 1.9 : 1.2, 0, j ? -0.5 : 0.35]}
          >
            <lineBasicMaterial color={0xede8df} transparent opacity={0.2} />
          </lineLoop>
        ))}
      </group>
      <points ref={points} geometry={pgeo} material={pmat} />
    </>
  );
}
