'use client';

import { useEffect, useRef } from 'react';
import { GRAIN } from '@/lib/content';
import { rt } from '@/lib/runtime';
import { addTick } from '@/lib/ticker';

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Film grain overlay, jittered every 4 frames. */
export default function Grain() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => addTick(() => {
    if (rt.frame % 4 === 0 && ref.current) {
      ref.current.style.transform = `translate(${(Math.random() * 10 - 5).toFixed(1)}%,${(Math.random() * 10 - 5).toFixed(1)}%)`;
    }
  }), []);
  if (!GRAIN) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: '-50%', zIndex: 55, pointerEvents: 'none', opacity: 0.09, mixBlendMode: 'overlay', backgroundImage: NOISE }}
    />
  );
}
