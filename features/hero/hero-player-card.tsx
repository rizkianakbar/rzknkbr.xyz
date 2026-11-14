'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { Tilt } from '@/components/tilt';
import { useGameActions } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { resumeData } from '@/lib/resume';

type HeroPlayerCardProps = {
  show: boolean;
};

const FACE = 'absolute inset-0 rounded-[28px] p-[3px] [backface-visibility:hidden]';
const FLIP_HINT = 'text-center font-pixel text-[8px] uppercase tracking-widest text-muted-foreground';

/** Holographic trading card: stats on the front, special moves on the back. */
export function HeroPlayerCard(props: HeroPlayerCardProps) {
  const { show } = props;
  const [flipped, setFlipped] = useState(false);
  const { award } = useGameActions();
  const reduce = useReducedMotion();

  const flip = (e: React.MouseEvent) => {
    play('flip');
    setFlipped((f) => !f);
    award('card-flip', { x: e.clientX, y: e.clientY });
  };

  return (
    <Tilt className="w-[min(100%,18rem)] sm:w-[min(100%,20rem)] rounded-[28px]" max={14} glow="var(--game-accent)">
      <motion.button
        type="button"
        data-sfx="none"
        onClick={flip}
        aria-label={flipped ? 'Flip card to front' : 'Flip card to see special moves'}
        aria-pressed={flipped}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 18 }}
        className="relative block w-full aspect-[3/4.2] text-left [transform-style:preserve-3d] cursor-pointer rounded-[28px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-game-accent/60">
        <div
          className={`${FACE} bg-linear-to-br from-game-accent via-game-cyan to-game-pink shadow-2xl shadow-game-accent/20`}>
          <div className="relative h-full w-full rounded-[25px] bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 font-pixel text-[10px] uppercase">
              <span>{resumeData.name}</span>
              <span className="text-game-accent-text">LV 6</span>
            </div>
            <div className="relative mx-3 rounded-2xl overflow-hidden bg-linear-to-br from-game-violet/40 via-game-cyan/20 to-game-accent/30 aspect-square">
              <Image
                src={resumeData.avatarUrl}
                alt={resumeData.name}
                fill
                preload
                sizes="320px"
                className="object-cover"
                draggable={false}
              />
              <div className="holo" aria-hidden />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 text-white font-pixel text-[9px] px-1.5 py-0.5">
                ★ Product Engineer
              </span>
            </div>
            <ul className="flex flex-col gap-1.5 px-4 py-3 flex-1 justify-center">
              {resumeData.stats.map((stat, i) => (
                <li
                  key={stat.label}
                  className="grid grid-cols-[4.5rem_1fr_1.75rem] items-center gap-2 font-pixel text-[9px] uppercase">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.span
                      className="block h-full rounded-full bg-linear-to-r from-game-accent to-game-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: show ? `${stat.value}%` : 0 }}
                      transition={{ type: 'spring', stiffness: 60, damping: 14, delay: show ? 1 + i * 0.12 : 0 }}
                    />
                  </span>
                  <span className="text-right tabular-nums">{stat.value}</span>
                </li>
              ))}
            </ul>
            <p className={`${FLIP_HINT} pb-2.5`}>Tap to flip ↻</p>
          </div>
        </div>

        <div
          className={`${FACE} bg-linear-to-br from-game-pink via-game-violet to-game-amber [transform:rotateY(180deg)]`}>
          <div className="h-full w-full rounded-[25px] bg-card p-5 flex flex-col gap-4">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-game-pink">Special moves</p>
            <ul className="flex flex-col gap-3 flex-1">
              {resumeData.specialMoves.map((move) => (
                <li key={move.name} className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="font-pixel text-[10px] uppercase text-game-amber">⚡ {move.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{move.text}</p>
                </li>
              ))}
            </ul>
            <p className={FLIP_HINT}>Tap to flip back ↻</p>
          </div>
        </div>
      </motion.button>
    </Tilt>
  );
}
