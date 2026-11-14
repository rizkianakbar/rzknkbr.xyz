'use client';

import { Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type JSX, useEffect, useRef, useState } from 'react';
import { useGame } from '@/components/game/game-provider';
import { ACHIEVEMENTS, levelFor } from '@/lib/achievements';
import { play } from '@/lib/sound';
import { cn } from '@/lib/utils';

export function Hud(): JSX.Element {
  const { xp, unlocked, muted, toggleMute, started } = useGame();
  const [open, setOpen] = useState(false);
  const info = levelFor(xp);
  const progress = info.next === null ? 1 : (xp - info.current) / (info.next - info.current);
  const [pulse, setPulse] = useState(0);
  const prevXp = useRef(xp);

  useEffect(() => {
    if (xp > prevXp.current) setPulse((p) => p + 1);
    prevXp.current = xp;
  }, [xp]);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: started ? 0 : -80 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: started ? 0.5 : 0 }}
        className="fixed top-3 inset-x-0 z-40 px-3 pointer-events-none">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
          <motion.div
            key={pulse}
            animate={pulse ? { scale: [1, 1.06, 1] } : undefined}
            transition={{ duration: 0.35 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-xl pl-1.5 pr-4 py-1.5 shadow-lg shadow-black/5">
            <div className="grid place-items-center size-9 rounded-xl bg-game-accent text-game-accent-foreground font-pixel text-[11px] leading-none">
              <span>LV</span>
              <span className="text-sm">{info.level}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-baseline justify-between gap-4 font-pixel text-[10px] uppercase tracking-wide">
                <span className="text-foreground">{info.title}</span>
                <span className="text-muted-foreground tabular-nums">
                  {xp}
                  {info.next !== null ? `/${info.next}` : ''} XP
                </span>
              </div>
              <div className="h-2 w-32 sm:w-44 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-game-accent xp-shine"
                  initial={false}
                  animate={{ width: `${Math.max(4, progress * 100)}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                />
              </div>
            </div>
          </motion.div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              data-sfx="open"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-12 rounded-2xl border border-border bg-card/80 backdrop-blur-xl px-3 font-pixel text-[11px] shadow-lg shadow-black/5 hover:border-game-accent transition-colors"
              aria-label={`Achievements: ${unlocked.length} of ${ACHIEVEMENTS.length} unlocked`}>
              <Trophy className="size-4 text-game-amber" aria-hidden />
              <span className="tabular-nums">
                {unlocked.length}/{ACHIEVEMENTS.length}
              </span>
            </button>
            <button
              type="button"
              data-sfx="none"
              onClick={toggleMute}
              className="grid place-items-center size-12 rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg shadow-black/5 hover:border-game-accent transition-colors"
              aria-label={muted ? 'Turn sound on' : 'Mute sound'}
              aria-pressed={!muted}>
              {muted ? <VolumeX className="size-4 text-muted-foreground" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>{open && <AchievementsPanel onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function AchievementsPanel({ onClose }: { onClose: () => void }): JSX.Element {
  const { unlocked, xp, reset } = useGame();
  const reduce = useReducedMotion();
  const info = levelFor(xp);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        play('close');
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-60 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      <button
        type="button"
        data-sfx="close"
        aria-label="Close achievements"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm cursor-default"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievements-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-3xl border-2 border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="font-pixel text-[10px] uppercase text-game-accent-text tracking-widest">
              LV {info.level} · {info.title}
            </p>
            <h2 id="achievements-title" className="text-2xl font-bold tracking-tight">
              Achievements
            </h2>
            <p className="text-sm text-muted-foreground">
              {unlocked.length} of {ACHIEVEMENTS.length} unlocked · {xp} XP
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            data-sfx="close"
            onClick={onClose}
            className="grid place-items-center size-9 rounded-xl border border-border hover:bg-muted transition-colors"
            aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <ul className="grid gap-2">
          {ACHIEVEMENTS.map((a, i) => {
            const got = unlocked.includes(a.id);
            const hidden = !got && 'secret' in a && a.secret;
            return (
              <motion.li
                key={a.id}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-3',
                  got ? 'border-game-accent/50 bg-game-accent/10' : 'border-border opacity-60',
                )}>
                <span
                  className={cn(
                    'grid place-items-center size-10 rounded-xl text-xl bg-muted shrink-0',
                    !got && 'grayscale',
                  )}
                  aria-hidden>
                  {hidden ? '❓' : a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{hidden ? 'Secret achievement' : a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {hidden ? 'Some say it involves arrows.' : a.description}
                  </p>
                </div>
                <span className="font-pixel text-[10px] text-muted-foreground shrink-0">
                  {got ? '✓' : ''} {a.xp}XP
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
