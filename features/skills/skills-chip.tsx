'use client';

import { motion, useReducedMotion } from 'motion/react';
import { type ComponentType, useState } from 'react';
import { fx } from '@/features/fx/fx.lib';
import { useGame } from '@/features/game/game-provider';
import { playNote } from '@/features/sound/sound.lib';
import { cn } from '@/lib/utils';

type SkillsChipProps = {
  name: string;
  icon?: ComponentType<{ className?: string }>;
  note: number;
  wave: OscillatorType;
  /** Background class flashed on each hit. */
  flash: string;
  draggable: boolean;
};

/** A skill you can play like a xylophone key, and fling around with the mouse. */
export function SkillsChip(props: SkillsChipProps) {
  const { name, icon: Icon, note, wave, flash, draggable } = props;
  const { track } = useGame();
  const reduce = useReducedMotion();
  const [hits, setHits] = useState(0);

  const strike = (at?: { x: number; y: number }) => {
    playNote(note, wave);
    setHits((h) => h + 1);
    track({ kind: 'note' }, at);
    if (at) fx.burst(at.x, at.y, { count: 8, spread: 4 });
  };

  return (
    <motion.button
      type="button"
      data-sfx="none"
      onPointerDown={(e) => strike({ x: e.clientX, y: e.clientY })}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        strike();
      }}
      drag={draggable}
      dragSnapToOrigin
      dragElastic={0.5}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 12 }}
      whileHover={reduce ? undefined : { y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      whileDrag={{ scale: 1.15, rotate: -6, zIndex: 30 }}
      className={cn(
        'relative h-9 px-3.5 rounded-xl border border-border bg-background flex items-center gap-2 text-sm font-medium select-none overflow-hidden',
        draggable && 'touch-none cursor-grab active:cursor-grabbing',
      )}>
      {hits > 0 && (
        <motion.span
          key={hits}
          aria-hidden
          className={cn('absolute inset-0', flash)}
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {Icon && <Icon className="relative size-4 rounded overflow-hidden object-contain" />}
      <span className="relative">{name}</span>
    </motion.button>
  );
}
