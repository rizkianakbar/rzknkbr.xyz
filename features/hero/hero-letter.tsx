'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { fx } from '@/features/fx/fx.lib';
import { useGame } from '@/features/game/game-provider';
import { playNote } from '@/features/sound/sound.lib';
import { cn } from '@/lib/utils';

type HeroLetterProps = {
  char: string;
  index: number;
  show: boolean;
  outline?: boolean;
};

/** One letter of the name: drops in, jumps on hover, plays a note and squashes when poked. */
export function HeroLetter(props: HeroLetterProps) {
  const { char, index, show, outline } = props;
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const { track } = useGame();
  const reduce = useReducedMotion();
  // Deterministic per letter, so server and client render the same starting tilt.
  const tilt = (index % 2 ? 1 : -1) * (12 + ((index * 7) % 18));

  const poke = (e: React.PointerEvent) => {
    playNote(index + 2, 'square');
    track({ kind: 'poke' }, { x: e.clientX, y: e.clientY });
    fx.burst(e.clientX, e.clientY, { count: 10, spread: 6 });
    if (reduce) return;
    void animate(
      scope.current,
      { scaleY: [1, 0.55, 1.25, 1], scaleX: [1, 1.3, 0.9, 1], y: [0, 10, -30, 0] },
      { duration: 0.55, ease: 'easeOut' },
    );
  };

  return (
    <motion.span
      data-reveal
      data-sfx="none"
      className="inline-block cursor-pointer"
      initial={{ opacity: 0, y: -160, rotate: tilt }}
      animate={show ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: -160, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 420, damping: 13, delay: show ? 0.25 + index * 0.05 : 0 }}
      whileHover={
        reduce ? undefined : { y: -16, rotate: tilt / 2, transition: { type: 'spring', stiffness: 600, damping: 10 } }
      }
      onPointerEnter={(e) => e.pointerType === 'mouse' && playNote(index + 2, 'sine')}
      onPointerDown={poke}>
      <span
        ref={scope}
        className={cn(
          'inline-block origin-bottom transition-colors duration-200',
          outline ? 'hover:text-game-pink hover:[-webkit-text-stroke:0]' : 'hover:text-game-accent-text',
        )}>
        {char}
      </span>
    </motion.span>
  );
}
