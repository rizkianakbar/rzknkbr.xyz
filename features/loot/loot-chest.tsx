'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { memo, useEffect, useRef, useState } from 'react';
import { PixelArt } from '@/components/pixel-art';
import { fx } from '@/features/fx/fx.lib';
import { RARITY, TONE } from '@/features/loot/loot.constants';
import { chestSprites } from '@/features/loot/loot.lib';
import { LootItemCard } from '@/features/loot/loot-item-card';
import { play } from '@/features/sound/sound.lib';
import type { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

type Project = (typeof resumeData.projects)[number];
type Point = { x: number; y: number };

/** The chest shakes for this long, then the lid pops and the light beam fires… */
const SHAKE_MS = 450;
/** …and the card takes over at this point. */
const REVEAL_MS = 900;
const SHAKE_S = SHAKE_MS / 1000;

/** Sprites are built once per brand colour, not per render. */
const CHESTS = {
  red: chestSprites(TONE.red.trim),
  yellow: chestSprites(TONE.yellow.trim),
  purple: chestSprites(TONE.purple.trim),
};

type LootChestProps = {
  project: Project;
  index: number;
  /** Set once the chest has been asked to open (by a click or "Open all"). */
  requested: boolean;
  onOpen: (index: number, at?: Point) => void;
};

/**
 * A loot chest sitting on top of its item card. The card is always rendered underneath, so its text
 * stays in the page and, from `sm` up, it reserves its height (no layout shift on reveal).
 * Memoized: opening one chest re-renders the grid, but the other five don't need to.
 */
export const LootChest = memo(function LootChest(props: LootChestProps) {
  const { project, index, requested, onOpen } = props;
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const chestRef = useRef<HTMLDivElement>(null);
  const rarity = RARITY[project.rarity];
  const tone = TONE[project.tone];
  const chest = CHESTS[project.tone];

  // Opening is a timed sequence: creak and shake, then the pop, then the card.
  useEffect(() => {
    if (!requested) return;
    play('flip');
    const pop = window.setTimeout(
      () => {
        play(rarity.sound);
        const rect = chestRef.current?.getBoundingClientRect();
        if (rect) {
          fx.burst(rect.left + rect.width / 2, rect.top + rect.height / 3, {
            count: rarity.burst,
            spread: rarity.confetti ? 10 : 7,
            colors: [...tone.burst],
          });
        }
        if (rarity.confetti) fx.confetti(80);
      },
      reduce ? 0 : SHAKE_MS,
    );
    const reveal = window.setTimeout(() => setRevealed(true), reduce ? 0 : REVEAL_MS);
    return () => {
      window.clearTimeout(pop);
      window.clearTimeout(reveal);
    };
  }, [requested, reduce, rarity, tone]);

  const popping = requested && !reduce;

  return (
    // Phones show one chest per row, so a closed chest stays compact instead of reserving the whole
    // card's height (a mostly empty box taller than the screen); it grows into the card as it opens.
    <div className={cn('relative h-full', !revealed && 'max-sm:h-72 max-sm:overflow-hidden')}>
      <LootItemCard project={project} index={index} revealed={revealed} />

      <AnimatePresence>
        {!revealed && (
          <motion.button
            key="chest"
            type="button"
            data-chest
            data-sfx="none"
            disabled={requested}
            onClick={(e) => onOpen(index, { x: e.clientX, y: e.clientY })}
            aria-label={`Open ${project.rarity} chest: ${project.title}`}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06, transition: { duration: 0.25 } }}
            className={cn(
              'group absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-dashed bg-card/90 backdrop-blur',
              tone.border,
              requested ? 'cursor-default' : 'cursor-pointer',
            )}>
            {/* Pedestal glow (CSS loop, compositor-only) */}
            <span
              aria-hidden
              className={cn(
                'glow-pulse absolute top-1/2 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full opacity-50 blur-2xl',
                tone.glow,
              )}
            />

            {/* Light beam shooting out of the open chest */}
            <motion.span
              aria-hidden
              className={cn(
                'absolute bottom-1/2 left-1/2 h-[70%] w-28 -translate-x-1/2 origin-bottom bg-linear-to-t to-transparent blur-sm',
                tone.beam,
              )}
              initial={false}
              animate={popping ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
              transition={{ delay: SHAKE_S, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            />

            {/* Idle bob lives on the wrapper (CSS); the shake lives on the chest (Motion), so they never fight. */}
            <span className={cn('relative', !requested && 'bob')} style={{ animationDelay: `${index * 0.25}s` }}>
              <motion.div
                ref={chestRef}
                className="relative size-28 sm:size-32"
                animate={popping ? { rotate: [0, -8, 8, -6, 6, -3, 0] } : { rotate: 0 }}
                transition={{ duration: SHAKE_S, ease: 'easeInOut' }}>
                <PixelArt sprite={chest.base} className="absolute inset-0 size-full" />
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={popping ? { y: -44, x: 14, rotate: -24, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
                  transition={{ delay: SHAKE_S, type: 'spring', stiffness: 260, damping: 16 }}>
                  <PixelArt sprite={chest.lid} className="size-full" />
                </motion.div>
              </motion.div>
            </span>

            <span className="relative flex flex-col items-center gap-1 text-center">
              <span className={cn('font-pixel text-[10px] uppercase tracking-widest', tone.text)}>
                {rarity.label} chest
              </span>
              <span className="font-bold">{project.title}</span>
              <span className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground">
                {requested ? (
                  'Opening…'
                ) : (
                  <>
                    ▶ <span className="pointer-coarse:hidden">Click</span>
                    <span className="hidden pointer-coarse:inline">Tap</span> to open
                  </>
                )}
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
