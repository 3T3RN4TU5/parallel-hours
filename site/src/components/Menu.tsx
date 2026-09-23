'use client';

import { useEffect, useRef } from 'react';
import { EMAIL, SCENES } from '@/lib/content';
import s from './Menu.module.css';

/** Full-screen scene menu that opens as an expanding circle from the menu button. */
export default function Menu({ open, onGo }: { open: boolean; onGo: (i: number) => void }) {
  const first = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => first.current?.focus({ preventScroll: true }), 300);
      wasOpen.current = true;
      return () => clearTimeout(t);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      const active = document.activeElement;
      if (!active || active === document.body || active.closest('#ph-menu')) {
        (document.querySelector('[aria-controls="ph-menu"]') as HTMLElement | null)?.focus({ preventScroll: true });
      }
    }
  }, [open]);

  return (
    <nav id="ph-menu" aria-label="Scenes" aria-hidden={!open} inert={!open} className={`${s.menu} ${open ? s.open : ''}`}>
      <ol className={s.list}>
        {SCENES.map((label, i) => (
          <li key={label} className={s.item}>
            <button
              ref={i === 0 ? first : undefined}
              type="button"
              tabIndex={open ? 0 : -1}
              data-cursor="Go"
              className={s.btn}
              style={{ transitionDelay: open ? `${0.28 + i * 0.05}s` : '0s' }}
              onClick={() => onGo(i)}
            >
              <span className={s.n}>0{i + 1}</span>
              <span className={s.label}>{label}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={s.foot}>
        <a href={`mailto:${EMAIL}`} tabIndex={open ? 0 : -1}>{EMAIL}</a>
        <span className={s.dim}>Esc to close</span>
      </div>
    </nav>
  );
}
