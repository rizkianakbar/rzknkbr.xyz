'use client';

import { AnimatePresence } from 'motion/react';
import { useEffect, useEffectEvent } from 'react';
import { fx } from '@/features/fx/fx.lib';
import { FxCanvas } from '@/features/fx/fx-canvas';
import { Hud } from '@/features/game/game-hud';
import { useGameActions, useGameState } from '@/features/game/game-provider';
import { StartScreen } from '@/features/game/game-start-screen';
import { FloatingXpLayer, Toasts } from '@/features/game/game-toasts';
import { play, type SoundName, unlockAudio } from '@/features/sound/sound.lib';

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

/** Elements that count as "interactive" for sounds. `data-sfx` picks the sound; `data-sfx="none"` plays its own. */
const INTERACTIVE = 'a, button, [role="button"], summary, [data-sfx]';

/** Everything game-wide: canvas effects, HUD, toasts, the start screen, and the global input listeners. */
export function Game() {
  const { started } = useGameState();
  const { track, award, notify } = useGameActions();

  // Every click makes a noise and a ripple.
  const onPointerDown = useEffectEvent((e: PointerEvent) => {
    unlockAudio();
    if (!started || e.button !== 0 || !(e.target instanceof Element)) return;
    const at = { x: e.clientX, y: e.clientY };
    const interactive = e.target.closest<HTMLElement>(INTERACTIVE);
    play((interactive?.dataset.sfx as SoundName | undefined) ?? (interactive ? 'click' : 'tap'));
    fx.ripple(at.x, at.y, interactive ? 1 : 0.7);
    fx.burst(at.x, at.y, { count: interactive ? 12 : 7, spread: interactive ? 5 : 3.5 });
    track({ kind: 'click' }, at);
    if (e.target.closest('[data-cv]')) award('cv', at);
  });

  const onHoverEnter = useEffectEvent((el: HTMLElement) => {
    if (started && el.dataset.sfx !== 'none') play('hover');
  });

  useEffect(() => {
    let lastHover: HTMLElement | null = null;
    const down = (e: PointerEvent) => onPointerDown(e);
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return;
      const el = e.target.closest<HTMLElement>(INTERACTIVE);
      if (el && el !== lastHover) onHoverEnter(el);
      lastHover = el;
    };
    document.addEventListener('pointerdown', down, { capture: true });
    document.addEventListener('pointerover', over, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', down, { capture: true });
      document.removeEventListener('pointerover', over);
    };
  }, []);

  // XP for exploring each section, once it's a quarter visible.
  const onSectionSeen = useEffectEvent((key: string) => track({ kind: 'section', key }));

  useEffect(() => {
    if (!started) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = entry.target instanceof HTMLElement ? entry.target.dataset.section : undefined;
          if (!entry.isIntersecting || !key) continue;
          onSectionSeen(key);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 },
    );
    for (const el of document.querySelectorAll('[data-section]')) observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // ↑ ↑ ↓ ↓ ← → ← → B A
  const onCheatCode = useEffectEvent(() => {
    unlockAudio();
    play('secret');
    fx.rainbow(12_000);
    fx.confetti(260);
    notify({ title: 'God mode: ON', description: 'Rainbow world for 12 seconds. Respect.', emoji: '🌈' });
    award('konami');
  });

  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        onCheatCode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
