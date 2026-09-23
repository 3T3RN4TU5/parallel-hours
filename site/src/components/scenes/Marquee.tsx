'use client';

import { useEffect, useRef } from 'react';
import { rt } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import s from './Marquee.module.css';

const A = 'Design ✶ Motion ✶ Interaction ✶ WebGL ✶ Sound ✶ Design ✶ Motion ✶ Interaction ✶ WebGL ✶ Sound ✶';
const B = 'Worlds ✶ Objects ✶ Signals ✶ Stories ✶ Worlds ✶ Objects ✶ Signals ✶ Stories ✶';

/** Two tilted kinetic bands; speed, direction and skew follow scroll velocity. */
export default function Marquee() {
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rows = [rowA.current!, rowB.current!].map((el, i) => ({ el, x: 0, base: i % 2 ? -1 : 1 }));
    return addTick(() => {
      const sk = Math.max(-12, Math.min(12, -rt.vel * 0.5));
      rows.forEach(r => {
        const w = r.el.scrollWidth / 2 || 1;
        const sp = rt.reduced ? 30 * r.base : (70 + Math.min(900, Math.abs(rt.vel) * 40)) * r.base * rt.dir;
        r.x = (((r.x + sp * rt.dt) % w) + w) % w;
        r.el.style.transform = `translate3d(${-r.x}px,0,0) skewX(${rt.reduced ? 0 : sk * r.base}deg)`;
      });
    });
  }, []);

  return (
    <section id="disciplines" data-scene="3" aria-label="Disciplines" className={s.mq}>
      <p className="sr-only">Design, motion, interaction, WebGL, sound — worlds, objects, signals, stories.</p>
      <div aria-hidden="true" className={s.bandA}>
        <div ref={rowA} className={s.row}><span>{A}</span><span>{A}</span></div>
      </div>
      <div aria-hidden="true" className={s.bandB}>
        <div ref={rowB} className={`${s.row} ${s.outline}`}><span>{B}</span><span>{B}</span></div>
      </div>
    </section>
  );
}
