'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '@/lib/content';
import { rt, mix } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import { blip } from '@/lib/sound';
import GenCanvas from '../GenCanvas';
import s from './IndexList.module.css';

/** Scene 05 — project index; hovering a row opens a preview that trails the cursor. */
export default function IndexList() {
  const [hover, setHover] = useState(-1);
  const [fine, setFine] = useState(false);
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let px: number | null = null, py = 0;
    const off = addTick(() => {
      const el = preview.current, m = rt.m;
      if (!el) return;
      if (px === null) { px = m.tx; py = m.ty; }
      px = mix(px, m.tx, 0.12); py = mix(py, m.ty, 0.12);
      el.style.transform = `translate3d(${px}px,${py}px,0) translate(-50%,-50%) rotate(${(m.tx - px) * 0.04}deg)`;
    });
    setFine(rt.fine);
    return off;
  }, []);

  const enter = (i: number) => {
    if (hover === i) return;
    blip(520 + i * 90, 0.08);
    setHover(i);
  };
  const leave = () => setHover(-1);

  return (
    <section id="index" data-scene="4" aria-label="Index" className={s.idx}>
      <div className={s.head}>
        <h2 className={s.h2}>Index</h2>
        <span className={s.dim}>05 — Archive 2019 → 2026</span>
      </div>
      <div role="list" onMouseLeave={leave}>
        {PROJECTS.map((p, i) => {
          const active = hover === i;
          return (
            <div
              key={p.n}
              role="listitem"
              tabIndex={0}
              data-cursor="Open"
              className={`${s.row} ${active ? s.active : ''}`}
              style={{ opacity: hover < 0 || active ? 1 : 0.25 }}
              onMouseEnter={() => enter(i)}
              onFocus={() => enter(i)}
              onBlur={leave}
            >
              <span className={s.dim}>{p.n}</span>
              <span className={s.main}>
                <span className={s.title}>{p.t}</span>
                <span className={s.disc}>{p.d}</span>
              </span>
              <span className={s.dim}>{p.y}</span>
            </div>
          );
        })}
        <div className={s.rule} />
      </div>

      <div
        ref={preview}
        aria-hidden="true"
        className={s.preview}
        style={{ clipPath: hover >= 0 && fine ? 'inset(0% 0% 0% 0%)' : 'inset(50% 50% 50% 50%)' }}
      >
        {PROJECTS.map((p, i) => (
          <GenCanvas key={p.n} kind={p.kind} seed={p.seed} inv={p.inv} className={s.pv} style={{ opacity: hover === i ? 1 : 0 }} />
        ))}
      </div>
    </section>
  );
}
