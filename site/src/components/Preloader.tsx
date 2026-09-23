'use client';

import { useEffect, useRef } from 'react';
import { rt, ensureEnv } from '@/lib/runtime';
import s from './Preloader.module.css';

export const ENTER_EVENT = 'ph:enter';

/**
 * 000→100 counter. Holds at 92% until the 3D layer is ready (or has failed),
 * with a hard exit at 3.2s so it never becomes friction.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureEnv();
    let raf = 0, exitT = 0;
    const t0 = performance.now(), dur = rt.reduced ? 250 : 1300;
    const exit = () => {
      const el = root.current;
      if (!el || rt.entered) return;
      clearTimeout(hardT);
      el.style.transition = 'transform 1.1s var(--ease-inout)';
      el.style.transform = 'translateY(-100%)';
      el.style.pointerEvents = 'none';
      el.setAttribute('aria-hidden', 'true');
      rt.entered = true;
      dispatchEvent(new Event(ENTER_EVENT));
    };
    const step = (now: number) => {
      let t = Math.min(1, (now - t0) / dur);
      if (!(rt.glReady || rt.glFailed)) t = Math.min(t, 0.92);
      const e = 1 - Math.pow(1 - t, 3);
      if (num.current) num.current.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${e})`;
      if (t < 1) raf = requestAnimationFrame(step);
      else exitT = window.setTimeout(exit, 180);
    };
    raf = requestAnimationFrame(step);
    const hardT = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      if (num.current) num.current.textContent = '100';
      exit();
    }, 3200);
    return () => { cancelAnimationFrame(raf); clearTimeout(hardT); clearTimeout(exitT); };
  }, []);

  return (
    <div ref={root} className={s.pre} role="status" aria-label="Loading">
      <div className={s.top}>
        <span>Parallel Hours</span>
        <span className={s.dim}>Loading world</span>
      </div>
      <div className={s.bottom}>
        <span className={s.tag}>Motion is a material.</span>
        <span ref={num} className={s.num}>000</span>
      </div>
      <div className={s.track}><div ref={bar} className={s.bar} /></div>
    </div>
  );
}
