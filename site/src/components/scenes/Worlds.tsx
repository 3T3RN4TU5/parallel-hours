'use client';

import { useEffect, useRef } from 'react';
import { PROJECTS } from '@/lib/content';
import { rt, mix, clamp01, smoothstep } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import GenCanvas from '../GenCanvas';
import s from './Worlds.module.css';

const PLATES = PROJECTS.slice(0, 5);

/** Scene 04 — vertical scroll drives a horizontal track of project plates. */
export default function Worlds() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = root.current!, tr = track.current!;
    const plates = [...sec.querySelectorAll<HTMLElement>('[data-plate]')].map(el => ({
      el, box: el.querySelector<HTMLElement>('[data-box]')!, cv: el.querySelector<HTMLElement>('canvas')!,
    }));
    let trackW = 0, lvw = 0, lvh = 0;

    // Section height = trackWidth − vw + vh so the pin lasts exactly as long as the track.
    const layout = () => {
      const vw = innerWidth, vh = innerHeight;
      if (vh > 0 && vw > 0 && tr.scrollWidth > 0) {
        trackW = tr.scrollWidth; lvw = vw; lvh = vh;
        sec.style.height = Math.max(vh * 1.5, trackW - vw + vh) + 'px';
      }
    };
    layout();
    document.fonts?.ready.then(layout);
    addEventListener('resize', layout);

    const off = addTick(() => {
      const vw = innerWidth, vh = innerHeight;
      if (rt.frame % 30 === 0 && (tr.scrollWidth !== trackW || vw !== lvw || vh !== lvh)) layout();
      const hr = sec.getBoundingClientRect();
      if (!(hr.top < vh * 1.2 && hr.bottom > -vh)) return;
      const p = clamp01(-hr.top / Math.max(1, hr.height - vh)), maxX = Math.max(0, trackW - vw);
      rt.hx = mix(rt.hx, p * maxX, rt.reduced ? 1 : 0.14);
      tr.style.transform = `translate3d(${-rt.hx}px,0,0)`;
      plates.forEach(pl => {
        const r = pl.el.getBoundingClientRect(), rv = rt.reduced ? 1 : smoothstep(0, 1, (vw - r.left) / (vw * 0.5));
        pl.box.style.clipPath = `inset(${(1 - rv) * 18}% ${(1 - rv) * 100}% ${(1 - rv) * 18}% 0)`;
        pl.cv.style.transform = `translateX(${((r.left + r.width / 2) / vw - 0.5) * -7}%) scale(${1.15 - rv * 0.1})`;
      });
    });
    return () => { off(); removeEventListener('resize', layout); };
  }, []);

  return (
    <section ref={root} id="worlds" data-scene="3" aria-label="Selected worlds" className={s.hz}>
      <div className={s.stage}>
        <div ref={track} className={s.track}>
          <div className={s.intro}>
            <span className={s.kicker}>04 — Worlds</span>
            <h2 className={s.h2}>Selected<br />worlds<span className={s.count}>(05)</span></h2>
            <p className={s.lede}>Five recent pieces. Each one started as a solid, was broken open, and was rebuilt as a system people could walk around in.</p>
            <span className={s.hint}>Keep scrolling →</span>
          </div>
          {PLATES.map(p => (
            <article key={p.n} data-plate="" data-cursor="View" className={s.plate} style={{ alignSelf: p.self, width: p.w }}>
              <div data-box="" className={s.box} style={{ height: p.h }}>
                <GenCanvas kind={p.kind} seed={p.seed} inv={p.inv} label={p.alt} className={s.art} />
                <span className={s.num}>{p.n} / 05</span>
              </div>
              <div className={s.meta}>
                <h3 className={s.title}>{p.t}</h3>
                <span className={`${s.dim} ${s.year}`}>{p.y}</span>
              </div>
              <span className={s.dim}>{p.d}</span>
            </article>
          ))}
          <div aria-hidden="true" className={s.outro}>
            <span>Full</span><span>index</span><span className={s.arrow}>↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
