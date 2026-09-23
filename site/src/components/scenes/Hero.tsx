'use client';

import { useEffect, useRef } from 'react';
import { rt, clamp01, smoothstep } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import { ENTER_EVENT } from '../Preloader';
import s from './Hero.module.css';

const chars = (w: string) => w.split('');

function Line({ word, line }: { word: string; line: 1 | 2 }) {
  return (
    <span aria-hidden="true" className={s.line}>
      {chars(word).map((c, i) => (
        <span key={i} data-hchar={line} className={s.char}>
          <span className={s.mask}><span data-hin="" className={s.in}>{c}</span></span>
        </span>
      ))}
    </span>
  );
}

/** Scene 01 — the giant headline rises in, reacts to hover, and scatters on scroll. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const hold = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current!;
    const hc = [...el.querySelectorAll<HTMLElement>('[data-hchar]')].map(c => ({ el: c, r: Math.random(), line: +(c.dataset.hchar ?? 1) }));
    const hf = [...el.querySelectorAll<HTMLElement>('[data-hfade]')];

    const reveal = () => {
      const ins = [...el.querySelectorAll<HTMLElement>('[data-hin]')];
      setTimeout(() => ins.forEach((c, i) => {
        c.style.transition = `transform 1.4s var(--ease-out) ${rt.reduced ? 0 : i * 0.045}s`;
        c.style.transform = 'translateY(0)';
      }), 380);
    };
    if (rt.entered) reveal(); else addEventListener(ENTER_EVENT, reveal, { once: true });

    const off = addTick(() => {
      if (hold.current) hold.current.style.transform = `scaleX(${rt.charge})`;
      const vw = innerWidth, vh = innerHeight, hp = clamp01(scrollY / vh);
      if (rt.reduced || !rt.entered || !(hp < 1.02 || rt.charge > 0.01)) return;
      hc.forEach(c => {
        const dx = (c.line === 1 ? -1 : 1) * hp * vw * 0.35 * (0.4 + c.r), j = rt.charge * (Math.random() - 0.5) * 12;
        c.el.style.transform = `translate3d(${dx + j}px,${-hp * vh * (0.15 + c.r * 0.7) + j}px,0) rotate(${(c.r - 0.5) * hp * 44}deg)`;
        c.el.style.opacity = String(1 - smoothstep(0.35, 1, hp));
      });
      hf.forEach(f => { f.style.opacity = String(1 - smoothstep(0, 0.5, hp)); });
    });
    return () => { off(); removeEventListener(ENTER_EVENT, reveal); };
  }, []);

  return (
    <section ref={root} id="introduction" data-scene="0" data-cursor="Drag · Hold" aria-label="Introduction" className={s.hero}>
      <div className={s.meta}>
        <span>[ 38.7223° N — 9.1393° W ]</span>
        <span>Independent interactive studio</span>
        <span>Scene 01 / Introduction</span>
      </div>
      <h1 aria-label="Motion is a material" className={s.h1}>
        <Line word="Motion" line={1} />
        <span aria-hidden="true" data-hfade="" className={s.mid}>
          <span className={s.isa}>is a</span>
          <span className={s.note}>(n.) the thing we shape, bend and set loose in the browser.</span>
        </span>
        <Line word="Material" line={2} />
      </h1>
      <div data-hfade="" className={s.foot}>
        <span className={s.scroll}><span className={s.tick} />Scroll to begin</span>
        <span className={s.holdWrap}>
          <span className={s.dim}>Hold anywhere to charge</span>
          <span className={s.meter}><span ref={hold} className={s.fill} /></span>
        </span>
      </div>
    </section>
  );
}
