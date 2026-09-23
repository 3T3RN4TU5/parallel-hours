'use client';

import { useEffect, useRef, useState } from 'react';
import { SCENES } from '@/lib/content';
import { clamp01 } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';

const CIRC = 150.8;

/** Bottom-right ring: overall progress, current scene number and name. */
export default function ScrollProgress() {
  const [scene, setScene] = useState(0);
  const circle = useRef<SVGCircleElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cur = 0;
    return addTick(() => {
      const vh = innerHeight, sy = scrollY;
      const tot = document.documentElement.scrollHeight - vh, p = tot > 0 ? clamp01(sy / tot) : 0;
      circle.current?.setAttribute('stroke-dashoffset', (CIRC * (1 - p)).toFixed(2));
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(2, '0');
      let sc = 0;
      document.querySelectorAll<HTMLElement>('[data-scene]').forEach(el => {
        if (el.getBoundingClientRect().top < vh * 0.5) sc = +(el.dataset.scene ?? 0);
      });
      if (sc !== cur) { cur = sc; setScene(sc); }
    }, 80);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed', right: 28, bottom: 22, zIndex: 60, display: 'flex', alignItems: 'center', gap: 14,
        fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', mixBlendMode: 'difference', color: 'var(--bone)', pointerEvents: 'none',
      }}
    >
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span>0{scene + 1} / 06</span>
        <span style={{ color: 'var(--bone-62)' }}>{SCENES[scene]}</span>
      </span>
      <span style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="26" cy="26" r="24" fill="none" stroke="rgba(237,232,223,.2)" strokeWidth="1" />
          <circle ref={circle} cx="26" cy="26" r="24" fill="none" stroke="#EDE8DF" strokeWidth="1.5" strokeDasharray={CIRC} strokeDashoffset={CIRC} />
        </svg>
        <span ref={pct} style={{ fontVariantNumeric: 'tabular-nums' }}>00</span>
      </span>
    </div>
  );
}
