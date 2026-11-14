'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { type Toast, useGame } from '@/features/game/game-provider';
import { cn } from '@/lib/utils';

export function Toasts() {
  const { toasts, dismissToast } = useGame();

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-3 left-3 sm:left-auto z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Dismiss when dragged this far right… */
const SWIPE_DISTANCE = 80;
/** …or flicked this fast (px/s), even over a short distance. */
const SWIPE_VELOCITY = 500;

const KIND_STYLE: Record<Toast['kind'], { border: string; text: string; label: string }> = {
  achievement: { border: 'border-game-accent', text: 'text-game-accent-text', label: 'Achievement unlocked' },
  level: { border: 'border-game-amber', text: 'text-game-amber', label: 'Level up' },
  info: { border: 'border-game-pink', text: 'text-game-pink', label: 'Heads up' },
};

type ToastCardProps = {
  toast: Toast;
  onDismiss: () => void;
};

/**
 * Slides in from the right, so it also leaves to the right: tap it, or swipe it away.
 * While held it tracks the pointer 1:1 to the right and rubber-bands to the left.
 */
function ToastCard(props: ToastCardProps) {
  const { toast, onDismiss } = props;
  const reduce = useReducedMotion();
  // A swipe ends with a click on the same element; ignore that click so it doesn't count twice.
  const swiped = useRef(false);
  const style = KIND_STYLE[toast.kind];

  return (
    <motion.button
      type="button"
      data-sfx="close"
      layout
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 1 }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 32 }}
      onDragStart={() => {
        swiped.current = true;
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onDismiss();
      }}
      onClick={() => {
        if (swiped.current) swiped.current = false;
        else onDismiss();
      }}
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      // Exits from wherever the swipe left it, keeping its velocity (springs retarget mid-flight).
      exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, x: 360, transition: EXIT_SPRING }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={cn(
        'pointer-events-auto w-full sm:w-80 text-left flex items-center gap-3 rounded-2xl border-2 bg-card/95 backdrop-blur-xl p-3 shadow-2xl touch-pan-y cursor-grab active:cursor-grabbing',
        style.border,
      )}>
      <motion.span
        initial={{ rotate: -30, scale: 0.4 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.1 }}
        className="grid place-items-center size-11 rounded-xl bg-muted text-2xl shrink-0"
        aria-hidden>
        {toast.emoji}
      </motion.span>
      <span className="min-w-0">
        <span className={cn('block font-pixel text-[9px] uppercase tracking-widest', style.text)}>{style.label}</span>
        <span className="block font-semibold text-sm truncate">{toast.title}</span>
        <span className="block text-xs text-muted-foreground">{toast.description}</span>
      </span>
    </motion.button>
  );
}

const EXIT_SPRING = { type: 'spring', stiffness: 300, damping: 30 } as const;

export function FloatingXpLayer() {
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
