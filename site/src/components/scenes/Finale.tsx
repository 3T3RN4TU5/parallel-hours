'use client';

import { useEffect, useRef, useState } from 'react';
import { EMAIL } from '@/lib/content';
import { rt, clamp01, smoothstep, enterProgress } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import { useMagnetic } from '@/lib/magnetic';
import s from './Finale.module.css';

const time = (tz: string) => {
  try {
    return new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return '--:--:--'; }
};

function Clocks() {
  const [t, setT] = useState({ l: '--:--:--', m: '--:--:--' });
  useEffect(() => {
    const upd = () => setT({ l: time('Europe/Lisbon'), m: time('America/Toronto') });
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <div className={s.col}><span className={s.dim}>Lisbon</span><time suppressHydrationWarning>{t.l}</time></div>
      <div className={s.col}><span className={s.dim}>Montréal</span><time suppressHydrationWarning>{t.m}</time></div>
    </>
  );
}

/** Scene 06 — the object reassembles behind SAY HELLO; letters thicken near the cursor. */
export default function Finale({ onTop }: { onTop: () => void }) {
  const root = useRef<HTMLElement>(null);
  const pill = useMagnetic<HTMLAnchorElement>();
  const topBtn = useMagnetic<HTMLButtonElement>();

  useEffect(() => {
    const el = root.current!;
    const fc = [...el.querySelectorAll<HTMLElement>('[data-fchar]')];
    return addTick(() => {
      const vw = innerWidth, vh = innerHeight, fr = el.getBoundingClientRect();
      if (!(fr.top < vh && fr.bottom > 0)) return;
      const rise = 1 - smoothstep(0.2, 0.9, enterProgress(el, vh)), m = rt.m;
      fc.forEach((c, i) => {
        c.style.transform = `translateY(${rise * (40 + (i % 3) * 25)}%)`;
        if (rt.fine) {
          const r = c.getBoundingClientRect(), d = Math.hypot(m.tx - (r.left + r.width / 2), m.ty - (r.top + r.height / 2));
          c.style.fontWeight = String(Math.round(200 + 700 * (1 - clamp01(d / (vw * 0.22)))));
        }
      });
    });
  }, []);

  return (
    <section ref={root} id="contact" data-scene="5" aria-label="Contact" className={s.fin}>
      <span className={s.kicker}>06 — Finale</span>
      <div className={s.center}>
        <h2 aria-label="Say hello" className={s.h2}>
          {'Say hello'.split('').map((c, i) => (
            <span key={i} data-fchar="" aria-hidden="true" className={s.ch}>{c === ' ' ? ' ' : c}</span>
          ))}
        </h2>
        <p className={s.reply}>— we usually reply within one parallel hour.</p>
        <a ref={pill} href={`mailto:${EMAIL}`} data-cursor="Write" className={s.pill}>
          {EMAIL} <span aria-hidden="true">→</span>
        </a>
      </div>
      <footer className={s.footer}>
        <Clocks />
        <nav aria-label="Social" className={s.col}>
          <span className={s.dim}>Elsewhere</span>
          <span className={s.social}>
            <a href="#">Instagram</a><a href="#">Vimeo</a><a href="#">GitHub</a>
          </span>
        </nav>
        <div className={`${s.col} ${s.start}`}>
          <span className={s.dim}>© 2026 Parallel Hours</span>
          <button ref={topBtn} type="button" className={s.top} onClick={onTop}>Back to the surface ↑</button>
        </div>
      </footer>
    </section>
  );
}
