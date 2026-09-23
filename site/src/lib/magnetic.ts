import { useEffect, useRef } from 'react';

export interface Magnet { el: HTMLElement; x: number; y: number }

/** Elements that lean toward the cursor; animated by the custom cursor. */
export const magnets = new Set<Magnet>();

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const g: Magnet = { el, x: 0, y: 0 };
    magnets.add(g);
    return () => { magnets.delete(g); el.style.transform = ''; };
  }, []);
  return ref;
}
