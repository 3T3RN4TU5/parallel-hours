'use client';

import { useImperativeHandle, useRef, type Ref } from 'react';

export interface WipeHandle {
  /** Cover the screen with the scene name, run `atCover`, then wipe off upward. */
  play: (label: string, atCover: () => void) => void;
}

const EASE = 'cubic-bezier(.76,0,.24,1)';

export default function SceneWipe({ ref }: { ref: Ref<WipeHandle> }) {
  const el = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  useImperativeHandle(ref, () => ({
    play(text, atCover) {
      const w = el.current;
      if (!w || busy.current) return;
      busy.current = true;
      if (label.current) label.current.textContent = text;
      w.style.transition = `transform .6s ${EASE}`;
      w.style.transform = 'translateY(0)';
      setTimeout(() => {
        atCover();
        w.style.transform = 'translateY(-101%)';
        setTimeout(() => {
          w.style.transition = 'none';
          w.style.transform = 'translateY(101%)';
          busy.current = false;
        }, 650);
      }, 640);
    },
  }), []);

  return (
    <div
      ref={el}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 85, background: 'var(--acc)', color: 'var(--ink)',
        transform: 'translateY(101%)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
      }}
    >
      <span
        ref={label}
        style={{ fontFamily: 'var(--f-display)', fontWeight: 800, textTransform: 'uppercase', fontSize: 'clamp(60px,12vw,220px)', lineHeight: 0.8 }}
      />
    </div>
  );
}
