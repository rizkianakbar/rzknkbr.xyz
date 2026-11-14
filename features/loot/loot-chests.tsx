'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameActions } from '@/features/game/game-provider';
import { LootChest } from '@/features/loot/loot-chest';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

const TOTAL = resumeData.projects.length;
/** Gap between chests when opening them all, so they pop as a cascade. */
const CASCADE_MS = 280;

/** One chest per shipped project. Open them one by one, or all at once. */
export function LootChests() {
  const { award } = useGameActions();
  const [opened, setOpened] = useState<ReadonlySet<number>>(new Set());
  // Mirrors `opened` so cascaded timeouts never act on a stale set.
  const openedRef = useRef(opened);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t);
    },
    [],
  );

  const open = useCallback(
    (index: number, at?: { x: number; y: number }) => {
      if (openedRef.current.has(index)) return;
      const next = new Set(openedRef.current).add(index);
      openedRef.current = next;
      setOpened(next);
      award('loot', at);
      if (next.size === TOTAL) award('all-loot', at);
    },
    [award],
  );

  const openAll = () => {
    let delay = 0;
    resumeData.projects.forEach((_, i) => {
      if (openedRef.current.has(i)) return;
      timers.current.push(window.setTimeout(() => open(i), delay));
      delay += CASCADE_MS;
    });
  };

  const allOpen = opened.size === TOTAL;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">Chests opened</span>
          <span className="flex gap-1" aria-hidden>
            {resumeData.projects.map((p, i) => (
              <span
                key={p.title}
                className={cn('size-2.5 transition-colors', opened.has(i) ? 'bg-game-accent' : 'bg-muted')}
              />
            ))}
          </span>
          <span className="font-pixel text-[10px] tabular-nums">
            {opened.size}/{TOTAL}
          </span>
        </div>
        <button
          type="button"
          data-sfx="none"
          onClick={openAll}
          disabled={allOpen}
          className={cn(
            'rounded-xl px-4 py-2 pointer-coarse:py-3 font-pixel text-[10px] uppercase tracking-widest',
            allOpen
              ? 'border border-game-accent/40 text-game-accent-text'
              : 'lift bg-game-accent text-game-accent-foreground shadow-[0_4px_0_0_color-mix(in_oklab,var(--game-accent)_55%,black)] active:shadow-none',
          )}>
          {allOpen ? '✓ All loot claimed' : '▶ Open all'}
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resumeData.projects.map((project, i) => (
          <LootChest key={project.title} project={project} index={i} requested={opened.has(i)} onOpen={open} />
        ))}
      </div>
    </div>
  );
}
