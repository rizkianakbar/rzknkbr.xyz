'use client';

import { motion, useReducedMotion } from 'motion/react';
import { type ComponentType, memo, useState } from 'react';
import { fx } from '@/features/fx/fx.lib';
import { useGameActions } from '@/features/game/game-provider';
import type { Branch } from '@/features/skills/skills.constants';
import { playNote } from '@/features/sound/sound.lib';
import { cn } from '@/lib/utils';

type SkillsNodeProps = {
  name: string;
  icon?: ComponentType<{ className?: string }>;
  note: number;
  branch: Branch;
  lit: boolean;
  /** Seconds to wait before popping in, so nodes follow the charging spine. */
  enterDelay: number;
  onLight: (name: string) => void;
};

/** One skill on the tree: a xylophone key that stays lit once played. */
export const SkillsNode = memo(function SkillsNode(props: SkillsNodeProps) {
  const { name, icon: Icon, note, branch, lit, enterDelay, onLight } = props;
  const { track } = useGameActions();
  const reduce = useReducedMotion();
  const [hits, setHits] = useState(0);

  const strike = (at?: { x: number; y: number }) => {
    playNote(note, branch.wave);
    setHits((h) => h + 1);
    onLight(name);
    track({ kind: 'note' }, at);
    if (at) fx.burst(at.x, at.y, { count: 8, spread: 4 });
  };

  return (
    <motion.button
      type="button"
      data-sfx="none"
      aria-pressed={lit}
      // Click, not pointerdown: on phones a scroll starting here would light the node. detail 0 is the keyboard.
      onClick={(e) => strike(e.detail > 0 ? { x: e.clientX, y: e.clientY } : undefined)}
      initial={reduce ? false : { opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 400, damping: 26, delay: enterDelay }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'group/node relative flex w-full items-center gap-2 overflow-hidden rounded-xl border bg-background px-2 h-10 pointer-coarse:h-11 text-left text-xs sm:text-sm font-medium select-none transition-[border-color,background-color,box-shadow]',
        lit ? cn(branch.border, branch.soft, branch.glow) : 'border-border hover:border-foreground/30',
      )}>
      {hits > 0 && (
        <motion.span
          key={hits}
          aria-hidden
          className={cn('absolute inset-0', branch.fill)}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        />
      )}
      <span className="relative grid place-items-center size-6 shrink-0 rounded-md bg-muted transition-transform duration-200 motion-safe:group-hover/node:scale-115">
        {Icon ? (
          <Icon className="size-4 rounded overflow-hidden object-contain" />
        ) : (
          <span className={cn('font-pixel text-[9px]', lit ? branch.text : 'text-muted-foreground')}>
            {name.charAt(0)}
          </span>
        )}
      </span>
      <span className="relative truncate">{name}</span>
      <span
        aria-hidden
        className={cn('relative ml-auto size-1.5 shrink-0 transition-colors', lit ? branch.fill : 'bg-border')}
      />
    </motion.button>
  );
});
