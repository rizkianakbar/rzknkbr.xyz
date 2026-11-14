'use client';

import { useEffect, useEffectEvent } from 'react';
import { useGameActions, useGameState } from '@/features/game/game-provider';
import { play, type SoundName } from '@/features/sound/sound.lib';

/** Number keys activate the matching hotbar slot, like an inventory bar in a game. */
export function NavbarHotkeys() {
  const { started } = useGameState();
  const { award } = useGameActions();

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!started || e.metaKey || e.ctrlKey || e.altKey || e.repeat || !/^[1-9]$/.test(e.key)) return;
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable="true"]')) return;
    const slot = document.querySelector<HTMLAnchorElement>(`[data-hotkey="${e.key}"]`);
    if (!slot) return;
    e.preventDefault();
    // Keyboard activation skips the global pointer handler, so play the slot's sound here.
    play((slot.dataset.sfx as SoundName | undefined) ?? 'click');
    if (slot.dataset.cv !== undefined) award('cv');
    slot.click();
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return null;
}
