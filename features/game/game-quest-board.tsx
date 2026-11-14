'use client';

import { Lock, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useEffectEvent, useRef } from 'react';
import { ACHIEVEMENTS, LEVELS, MAX_LEVEL } from '@/features/game/game.constants';
import { levelFor } from '@/features/game/game.lib';
import { useGameActions, useGameState } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { cn } from '@/lib/utils';

type QuestBoardProps = {
  onClose: () => void;
};

/** Rank ladder plus every achievement: clues while locked, the real description once unlocked. */
export function QuestBoard(props: QuestBoardProps) {
  const { onClose } = props;
  const { unlocked, xp } = useGameState();
  const { reset } = useGameActions();
  const reduce = useReducedMotion();
  const info = levelFor(xp);
  const closeRef = useRef<HTMLButtonElement>(null);

  const onEscape = useEffectEvent(() => {
    play('close');
    onClose();
  });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onEscape();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-60 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <button
        type="button"
        data-sfx="close"
        aria-label="Close quest board"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        data-lenis-prevent
        className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto overscroll-contain rounded-3xl border-2 border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-pixel text-[10px] uppercase text-game-accent-text tracking-widest">
              LV {info.level}/{MAX_LEVEL} · {info.title} · {xp} XP
            </p>
            <h2 id="board-title" className="text-2xl font-bold tracking-tight">
              Quest board
            </h2>
            <p className="text-sm text-muted-foreground">This whole site is a game. Clues below, answers out there.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            data-sfx="close"
            onClick={onClose}
            className="grid place-items-center size-9 pointer-coarse:size-11 shrink-0 rounded-xl border border-border hover:bg-muted transition-colors"
            aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <RankLadder xp={xp} />

        <div className="mt-5 mb-2 flex items-baseline justify-between">
          <h3 className="font-pixel text-[11px] uppercase tracking-widest">Achievements</h3>
          <span className="font-pixel text-[10px] text-muted-foreground tabular-nums">
            {unlocked.length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <ul className="grid gap-2">
          {ACHIEVEMENTS.map((a, i) => {
            const got = unlocked.includes(a.id);
            const secret = !got && 'secret' in a && a.secret;
            return (
              <motion.li
                key={a.id}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3',
                  got ? 'border-game-accent/50 bg-game-accent/10' : 'border-border border-dashed',
                )}>
                <span
                  className={cn(
                    'grid place-items-center size-10 rounded-xl text-xl bg-muted shrink-0',
                    !got && 'grayscale opacity-50',
                  )}
                  aria-hidden>
                  {secret ? '❓' : a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('font-semibold text-sm', !got && 'text-muted-foreground')}>
                    {secret ? 'Secret achievement' : a.title}
                  </p>
                  <p className={cn('text-xs', got ? 'text-muted-foreground' : 'italic text-muted-foreground/80')}>
                    {got ? a.description : `Clue: ${a.hint}`}
                  </p>
                </div>
                <span
                  className={cn(
                    'font-pixel text-[10px] shrink-0',
                    got ? 'text-game-accent-text' : 'text-muted-foreground',
                  )}>
                  {got ? '✓ ' : '+'}
                  {a.xp}XP
                </span>
              </motion.li>
            );
          })}
        </ul>

        <button
          type="button"
          data-sfx="none"
          onClick={reset}
          className="mt-5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Reset progress
        </button>
      </motion.div>
    </motion.div>
  );
}

type RankLadderProps = {
  xp: number;
};

/** Shows reached ranks and the next one; later ranks stay locked so there's something to discover. */
function RankLadder(props: RankLadderProps) {
  const { xp } = props;
  const info = levelFor(xp);
  const next = info.next === null ? null : LEVELS[info.level];

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <ol className="flex items-center" aria-label={`Rank ${info.level} of ${MAX_LEVEL}`}>
        {LEVELS.map((lvl, i) => {
          const n = i + 1;
          const reached = n <= info.level;
          const isNext = n === info.level + 1;
          return (
            <li key={lvl.title} className="flex items-center flex-1 last:flex-none">
              <span
                title={reached || isNext ? lvl.title : 'Unknown rank'}
                className={cn(
                  'grid place-items-center size-8 shrink-0 rounded-lg font-pixel text-[10px] border-2',
                  reached && 'bg-game-accent border-game-accent text-game-accent-foreground',
                  isNext && 'border-game-accent/70 border-dashed text-game-accent-text',
                  !reached && !isNext && 'border-border text-muted-foreground',
                  n === info.level && 'ring-4 ring-game-accent/25',
                )}>
                {reached || isNext ? n : <Lock className="size-3" aria-hidden />}
              </span>
              {i < LEVELS.length - 1 && (
                <span className={cn('h-0.5 flex-1 mx-1', n < info.level ? 'bg-game-accent' : 'bg-border')} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm">
        {next ? (
          <>
            Next rank: <span className="font-semibold text-game-accent-text">{next.title}</span>{' '}
            <span className="text-muted-foreground">· {next.xp - xp} XP to go</span>
          </>
        ) : (
          <span className="font-semibold text-game-amber">Max rank reached. You are a legend. 👑</span>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Big XP comes from achievements. A little comes from simply looking around. The final rank asks for everything,
        including what&apos;s hidden.
      </p>
    </div>
  );
}
