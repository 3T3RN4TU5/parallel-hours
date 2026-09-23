'use client';

import { useEffect, useRef } from 'react';
import { rt, mix } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import { updateDrone } from '@/lib/sound';
import { useMagnetic } from '@/lib/magnetic';
import s from './Header.module.css';

interface Props {
  menuOpen: boolean;
  sound: boolean;
  onMenu: () => void;
  onSound: () => void;
  onTop: () => void;
}

export default function Header({ menuOpen, sound, onMenu, onSound, onTop }: Props) {
  const logo = useMagnetic<HTMLAnchorElement>();
  const soundBtn = useMagnetic<HTMLButtonElement>();
  const menuBtn = useMagnetic<HTMLButtonElement>();
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  // Equaliser bars dance while sound is on (harder when charged); the drone follows charge.
  useEffect(() => {
    const h = [3, 3, 3, 3];
    return addTick(() => {
      bars.current.forEach((el, i) => {
        if (!el) return;
        const t = rt.sound ? 3 + (Math.sin(rt.time * (6 + i * 2.3)) * 0.5 + 0.5) * 9 * (1 + rt.charge) : 3;
        h[i] = mix(h[i], Math.min(12, t), 0.2);
        el.style.height = h[i].toFixed(1) + 'px';
      });
      updateDrone(rt.charge);
    });
  }, []);

  return (
    <header className={s.header}>
      <a
        ref={logo}
        href="#top"
        className={s.logo}
        aria-label="Parallel Hours — back to top"
        onClick={e => { e.preventDefault(); onTop(); }}
      >
        <span>Parallel</span>
        <span className={s.light}>Hours</span>
      </a>
      <div className={s.actions}>
        <button ref={soundBtn} type="button" className={s.btn} onClick={onSound} aria-pressed={sound} aria-label="Toggle sound">
          <span aria-hidden="true" className={s.bars}>
            {[0, 1, 2, 3].map(i => <span key={i} ref={el => { bars.current[i] = el; }} className={s.bar} />)}
          </span>
          <span>{sound ? 'Sound on' : 'Sound off'}</span>
        </button>
        <button ref={menuBtn} type="button" className={`${s.btn} ${s.menuBtn}`} onClick={onMenu} aria-expanded={menuOpen} aria-controls="ph-menu">
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          <span aria-hidden="true" className={`${s.icon} ${menuOpen ? s.open : ''}`}>
            <span className={s.l1} />
            <span className={s.l2} />
          </span>
        </button>
      </div>
    </header>
  );
}
