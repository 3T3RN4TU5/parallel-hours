'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { ACCENT, type GenKind } from '@/lib/content';
import { drawGen } from '@/lib/gen';

interface Props {
  kind: GenKind;
  seed: number;
  inv: boolean;
  label?: string;
  style?: CSSProperties;
  className?: string;
}

/** Procedural placeholder artwork; redraws (debounced) when its box resizes. */
export default function GenCanvas({ kind, seed, inv, label, style, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    let t = 0, lw = 0, lh = 0;
    const draw = () => {
      if (cv.clientWidth === lw && cv.clientHeight === lh) return;
      lw = cv.clientWidth; lh = cv.clientHeight;
      drawGen(cv, kind, seed, inv, ACCENT);
    };
    draw();
    const ro = new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(draw, 200); });
    ro.observe(cv);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [kind, seed, inv]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={style}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
