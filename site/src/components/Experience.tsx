'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { rt, ensureEnv } from '@/lib/runtime';
import { initSmoothScroll, jumpTo } from '@/lib/scroll';
import { blip, disposeSound, setSound } from '@/lib/sound';
import { SCENES } from '@/lib/content';
import Grain from './Grain';
import Preloader from './Preloader';
import Header from './Header';
import Menu from './Menu';
import SceneWipe, { type WipeHandle } from './SceneWipe';
import ScrollProgress from './ScrollProgress';
import Cursor from './Cursor';
import Hero from './scenes/Hero';
import Manifesto from './scenes/Manifesto';
import Transformation from './scenes/Transformation';
import Marquee from './scenes/Marquee';
import Worlds from './scenes/Worlds';
import IndexList from './scenes/IndexList';
import Finale from './scenes/Finale';

const ThreeScene = dynamic(() => import('./three/ThreeScene'), { ssr: false });

export default function Experience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sound, setSoundState] = useState(false);
  const wipe = useRef<WipeHandle>(null);

  useEffect(() => {
    ensureEnv();
    const offScroll = initSmoothScroll();
    const onMove = (e: PointerEvent) => {
      if (rt.down) rt.dragV += (e.clientX - rt.m.tx) * 0.0012;
      rt.m.tx = e.clientX; rt.m.ty = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.('button,a,[role=listitem]')) return;
      rt.down = true;
    };
    const onUp = () => { rt.down = false; };
    const onResize = () => { rt.mob = innerWidth < 768; };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
    addEventListener('resize', onResize);
    return () => {
      offScroll();
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      removeEventListener('pointercancel', onUp);
      removeEventListener('resize', onResize);
      disposeSound();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const toggleMenu = useCallback(() => {
    blip(menuOpen ? 520 : 780);
    setMenuOpen(o => !o);
  }, [menuOpen]);

  const toggleSound = useCallback(() => {
    if (setSound(!rt.sound)) setSoundState(rt.sound);
  }, []);

  /** Jump to scene i behind an accent wipe carrying the scene name. */
  const go = useCallback((i: number) => {
    const el = document.querySelector(`[data-scene="${i}"]`);
    if (!el) return;
    const y = i === 0 ? 0 : el.getBoundingClientRect().top + scrollY;
    blip(990, 0.1);
    const jump = () => { setMenuOpen(false); jumpTo(y); rt.hx = 0; rt.C.ex = 0; };
    if (rt.reduced || !wipe.current) { jump(); return; }
    wipe.current.play(SCENES[i], jump);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ThreeScene />
      </div>
      <Grain />

      <main style={{ position: 'relative' }}>
        <Hero />
        <Manifesto />
        <Transformation />
        <Marquee />
        <Worlds />
        <IndexList />
        <Finale onTop={() => go(0)} />
      </main>

      <Header menuOpen={menuOpen} sound={sound} onMenu={toggleMenu} onSound={toggleSound} onTop={() => go(0)} />
      <Menu open={menuOpen} onGo={go} />
      <SceneWipe ref={wipe} />
      <Preloader />
      <ScrollProgress />
      <Cursor />
    </div>
  );
}
