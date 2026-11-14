'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { fx } from '@/features/fx/fx.lib';
import { useGameActions } from '@/features/game/game-provider';
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
  const { track } = useGameActions();
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
    // Outer: entrance animation + a hover area that never moves. Middle: the CSS hover lift (so the letter
    // can't jump out from under the cursor and flicker). Inner: the squash when poked.
    <motion.span
      data-reveal
      data-sfx="none"
      className="group/letter inline-block cursor-pointer"
      initial={{ opacity: 0, y: -160, rotate: tilt }}
      animate={show ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: -160, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 420, damping: 13, delay: show ? 0.25 + index * 0.05 : 0 }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && playNote(index + 2, 'sine')}
      onPointerDown={poke}>
      <span
        className="inline-block transition-[translate,rotate] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-safe:group-hover/letter:-translate-y-4 motion-safe:group-hover/letter:rotate-(--hover-tilt)"
        style={{ '--hover-tilt': `${tilt / 2}deg` } as React.CSSProperties}>
        <span
          ref={scope}
          className={cn(
            'inline-block origin-bottom transition-colors duration-200',
            outline
              ? 'group-hover/letter:text-game-pink group-hover/letter:[-webkit-text-stroke:0]'
              : 'group-hover/letter:text-game-accent-text',
          )}>
          {char}
        </span>
      </span>
    </motion.span>
  );
}
