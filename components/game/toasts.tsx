'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { JSX } from 'react';
import { useGame } from '@/components/game/game-provider';
import { cn } from '@/lib/utils';

export function Toasts(): JSX.Element {
  const { toasts, dismissToast } = useGame();

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-3 left-3 sm:left-auto z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            type="button"
            data-sfx="close"
            key={t.id}
            layout
            onClick={() => dismissToast(t.id)}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={cn(
              'pointer-events-auto w-full sm:w-80 text-left flex items-center gap-3 rounded-2xl border-2 bg-card/95 backdrop-blur-xl p-3 shadow-2xl',
              t.kind === 'level' ? 'border-game-amber' : t.kind === 'info' ? 'border-game-pink' : 'border-game-accent',
            )}>
            <motion.span
              initial={{ rotate: -30, scale: 0.4 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.1 }}
              className="grid place-items-center size-11 rounded-xl bg-muted text-2xl shrink-0"
              aria-hidden>
              {t.emoji}
            </motion.span>
            <span className="min-w-0">
              <span
                className={cn(
                  'block font-pixel text-[9px] uppercase tracking-widest',
                  t.kind === 'level'
                    ? 'text-game-amber'
                    : t.kind === 'info'
                      ? 'text-game-pink'
                      : 'text-game-accent-text',
                )}>
                {t.kind === 'achievement' ? 'Achievement unlocked' : t.kind === 'level' ? 'Level up' : 'Heads up'}
              </span>
              <span className="block font-semibold text-sm truncate">{t.title}</span>
              <span className="block text-xs text-muted-foreground">{t.description}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function FloatingXpLayer(): JSX.Element {
  const { floating } = useGame();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-65">
      <AnimatePresence>
        {floating.map((f) => (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -60, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ left: f.x, top: f.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-pixel text-sm text-game-accent-text drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] whitespace-nowrap">
            +{f.amount} XP
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
