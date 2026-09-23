'use client';

import { useEffect, useRef } from 'react';
import { CAPS } from '@/lib/content';
import { rt, pinProgress } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import { blip } from '@/lib/sound';
import s from './Transformation.module.css';

const STAGES = ['Solid', 'Fracture', 'System'];

/** Scene 03 — long pinned stage while the object fractures into a constellation. */
export default function Transformation() {
  const root = useRef<HTMLElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const numCol = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const caps = [...el.querySelectorAll<HTMLElement>('[data-cap]')];
    const stages = [...el.querySelectorAll<HTMLElement>('[data-stage]')];
    let capIdx = -1;
    return addTick(() => {
      const vh = innerHeight, tp = (rt.tp = pinProgress(el, vh));
      const idx = tp < 0.34 ? 0 : tp < 0.67 ? 1 : 2;
      if (idx !== capIdx) {
        if (capIdx >= 0) blip([440, 587, 784][idx], 0.1);
        capIdx = idx;
        caps.forEach((c, i) => {
          c.style.opacity = i === idx ? '1' : '0';
          c.style.transform = `translateY(${i === idx ? 0 : i < idx ? -28 : 28}px)`;
        });
        stages.forEach((st, i) => { st.style.color = i <= idx ? '#EDE8DF' : 'rgba(237,232,223,.4)'; });
        if (numCol.current) numCol.current.style.transform = `translateY(${-idx}em)`;
      }
      if (fill.current) fill.current.style.transform = `scaleX(${tp})`;
      if (rt.glReady && readout.current && el.getBoundingClientRect().top < vh) {
        readout.current.textContent = `Fragments ${rt.fragments.toLocaleString('en-US')} · Separation ${rt.C.ex.toFixed(2)} · Twist ${rt.C.tw.toFixed(2)}`;
      }
    }, 5);
  }, []);

  return (
    <section ref={root} id="transformation" data-scene="2" data-cursor="Scroll" aria-label="Transformation" className={s.tr}>
      <div className={s.stage}>
        <div aria-hidden="true" className={s.vline} />
        <div aria-hidden="true" className={s.hline} />
        <div className={s.top}>
          <span>03 — Transformation</span>
          <span ref={readout} aria-hidden="true">Separation 0.00 · Twist 0.00</span>
        </div>
        <div aria-hidden="true" className={s.num}>
          <div ref={numCol} className={s.numCol}>
            <div>01</div><div>02</div><div>03</div>
          </div>
        </div>
        <div className={s.caps}>
          {CAPS.map((c, i) => (
            <div key={c.t} data-cap="" className={s.cap} style={{ opacity: i === 0 ? 1 : 0 }}>
              <div className={s.kicker}>{c.k}</div>
              <h2 className={s.title}>{c.t}</h2>
              <p className={s.body}>{c.b}</p>
            </div>
          ))}
        </div>
        <div className={s.progress}>
          <div className={s.track}><div ref={fill} className={s.fill} /></div>
          <div className={s.labels}>
            {STAGES.map((t, i) => (
              <span key={t} data-stage="" style={i ? { color: 'rgba(237,232,223,.4)' } : undefined}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
