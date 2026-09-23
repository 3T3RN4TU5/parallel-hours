'use client';

import { useEffect, useRef, useState } from 'react';
import { rt, mix, ensureEnv } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';
import { blip } from '@/lib/sound';
import { magnets } from '@/lib/magnetic';

/**
 * Desktop-only cursor: exact accent dot + lagging ring. The ring grows over
 * links and becomes a labelled accent disc over [data-cursor] zones.
 * Also drives the magnetic pull of registered elements.
 */
export default function Cursor() {
  const [fine, setFine] = useState(false);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ensureEnv();
    if (!rt.fine) return;
    setFine(true);
    document.documentElement.classList.add('ph-cursor');
    let curLabel = '', curLink = false, rx = rt.m.tx, ry = rt.m.ty;

    const apply = () => {
      const r = ring.current, lab = label.current;
      if (!r || !lab) return;
      const isL = !!curLabel && !curLink, size = isL ? 92 : curLink ? 64 : 38;
      r.style.width = r.style.height = size + 'px';
      r.style.background = isL ? 'var(--acc)' : curLink ? 'rgba(237,232,223,.12)' : 'transparent';
      r.style.borderColor = isL ? 'var(--acc)' : '#EDE8DF';
      lab.textContent = isL ? curLabel : '';
      lab.style.opacity = isL ? '1' : '0';
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      const zone = t.closest<HTMLElement>('[data-cursor]'), link = t.closest('a,button');
      const lbl = link && !t.closest('[data-cursor="Go"]') ? '' : zone?.dataset.cursor ?? '';
      if (lbl === curLabel && !!link === curLink) return;
      curLabel = lbl; curLink = !!link;
      if (link) blip(1320, 0.06);
      apply();
    };
    document.addEventListener('mouseover', onOver);

    const off = addTick(() => {
      const m = rt.m;
      rx = mix(rx, m.tx, 0.2); ry = mix(ry, m.ty, 0.2);
      if (dot.current) dot.current.style.transform = `translate3d(${m.tx}px,${m.ty}px,0) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${1 + rt.charge * 0.5})`;
      magnets.forEach(g => {
        const r = g.el.getBoundingClientRect(), cx = r.left + r.width / 2 - g.x, cy = r.top + r.height / 2 - g.y;
        const dx = m.tx - cx, dy = m.ty - cy, rad = Math.max(r.width, r.height) * 0.75 + 36, inR = Math.hypot(dx, dy) < rad;
        g.x = mix(g.x, inR ? dx * 0.3 : 0, 0.15); g.y = mix(g.y, inR ? dy * 0.3 : 0, 0.15);
        g.el.style.transform = `translate3d(${g.x.toFixed(2)}px,${g.y.toFixed(2)}px,0)`;
      });
    }, 70);

    return () => {
      off();
      document.removeEventListener('mouseover', onOver);
      document.documentElement.classList.remove('ph-cursor');
    };
  }, []);

  if (!fine) return null;
  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        style={{
          position: 'fixed', left: 0, top: 0, zIndex: 100, pointerEvents: 'none', width: 38, height: 38, border: '1px solid #EDE8DF',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
          transition: 'width .45s var(--ease-out),height .45s var(--ease-out),background .3s,border-color .3s',
        }}
      >
        <span
          ref={label}
          style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink)', whiteSpace: 'nowrap', opacity: 0, transition: 'opacity .25s' }}
        />
      </div>
      <div
        ref={dot}
        aria-hidden="true"
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 101, pointerEvents: 'none', width: 5, height: 5, borderRadius: '50%', background: 'var(--acc)' }}
      />
    </>
  );
}
