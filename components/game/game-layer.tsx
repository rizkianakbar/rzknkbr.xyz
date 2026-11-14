'use client';

import { AnimatePresence } from 'motion/react';
import { type JSX, useEffect, useRef } from 'react';
import { FxCanvas } from '@/components/game/fx-canvas';
import { useGame } from '@/components/game/game-provider';
import { Hud } from '@/components/game/hud';
import { StartScreen } from '@/components/game/start-screen';
import { FloatingXpLayer, Toasts } from '@/components/game/toasts';
import { fx } from '@/lib/fx';
import { play, type SoundName, unlockAudio } from '@/lib/sound';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];
const INTERACTIVE = 'a, button, [role="button"], summary, [data-sfx]';

export function GameLayer(): JSX.Element {
  const { started, track, award, notify } = useGame();
  const startedRef = useRef(started);
  startedRef.current = started;

  // Every click makes a noise and a ripple.
  useEffect(() => {
    let lastHover: Element | null = null;

    const onDown = (e: PointerEvent) => {
      unlockAudio();
      if (!startedRef.current || e.button !== 0) return;
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const interactive = target.closest<HTMLElement>(INTERACTIVE);
      const sfx = (interactive?.dataset.sfx as SoundName | undefined) ?? (interactive ? 'click' : 'tap');
      play(sfx);
      fx.ripple(e.clientX, e.clientY, interactive ? 1 : 0.7);
      fx.burst(e.clientX, e.clientY, { count: interactive ? 12 : 7, spread: interactive ? 5 : 3.5 });
      track({ kind: 'click' }, { x: e.clientX, y: e.clientY });
      if (target.closest('[data-cv]')) award('cv', { x: e.clientX, y: e.clientY });
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !startedRef.current) return;
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (el && el !== lastHover && (el as HTMLElement).dataset.sfx !== 'none') play('hover');
      lastHover = el;
    };

    document.addEventListener('pointerdown', onDown, { capture: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onDown, { capture: true });
      document.removeEventListener('pointerover', onOver);
    };
  }, [track, award]);

  // XP for exploring each section.
  useEffect(() => {
    if (!started) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = (entry.target as HTMLElement).dataset.section;
          if (key) track({ kind: 'section', key });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 },
    );
    for (const el of document.querySelectorAll('[data-section]')) observer.observe(el);
    return () => observer.disconnect();
  }, [started, track]);

  // ↑ ↑ ↓ ↓ ← → ← → B A
  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        unlockAudio();
        play('secret');
        fx.rainbow(12_000);
        fx.confetti(260);
        notify({ title: 'God mode: ON', description: 'Rainbow world for 12 seconds. Respect.', emoji: '🌈' });
        award('konami');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [award, notify]);

  return (
    <>
      <FxCanvas />
      <Hud />
      <Toasts />
      <FloatingXpLayer />
      <AnimatePresence>{!started && <StartScreen key="start" />}</AnimatePresence>
    </>
  );
}
