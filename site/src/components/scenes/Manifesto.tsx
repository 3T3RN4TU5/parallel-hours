'use client';

import { useEffect, useRef } from 'react';
import { MANIFESTO } from '@/lib/content';
import { clamp01 } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import s from './Manifesto.module.css';

const WORDS = MANIFESTO.split(' ').map(w => ({ w: w.replace('*', ''), acc: w.startsWith('*') }));

/** Scene 02 — the manifesto lights up word by word as it scrolls through. */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const words = [...el.querySelectorAll<HTMLElement>('[data-word]')], N = words.length;
    return addTick(() => {
      const vh = innerHeight, r = el.getBoundingClientRect();
      if (r.top >= vh || r.bottom <= 0) return;
      const wp = clamp01((vh * 0.85 - r.top) / (r.height * 0.62));
      words.forEach((w, i) => { w.style.opacity = String(0.14 + 0.86 * clamp01(wp * N * 1.05 - i)); });
    });
  }, []);

  return (
    <section ref={root} id="discovery" data-scene="1" aria-label="Discovery" className={s.man}>
      <div className={s.side}>
        <span className={s.label}>02 — Discovery</span>
      </div>
      <div className={s.body}>
        <p className={s.text}>
          {WORDS.map((w, i) => (
            <span key={i} data-word="" className={w.acc ? `${s.word} ${s.acc}` : s.word}>{w.w}</span>
          ))}
        </p>
        <div className={s.notes}>
          <p><span className={s.strong}>↳ Live object.</span> The form behind this text is rendered in your browser, right now — not a video.</p>
          <p><span className={s.strong}>↳ Touch it.</span> Drag to spin it. Hold to charge it. Scroll to take it apart.</p>
          <p><span className={s.strong}>↳ Listen.</span> Turn sound on in the corner — every surface answers.</p>
        </div>
      </div>
    </section>
  );
}
