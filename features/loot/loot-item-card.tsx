'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { RARITY, TONE } from '@/features/loot/loot.constants';
import { LootTechTags } from '@/features/loot/loot-tech-tags';
import { playNote } from '@/features/sound/sound.lib';
import type { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

type Project = (typeof resumeData.projects)[number];

/** When the stat lines start ticking in after the flip, and the gap between them. */
const STATS_DELAY_MS = 380;
const STAT_GAP_MS = 120;

type LootItemCardProps = {
  project: Project;
  index: number;
  revealed: boolean;
};

/**
 * An RPG item tooltip: brand-coloured name, item type, green stat lines, flavour text.
 * On reveal it flips in, a shine sweeps across, and the stats tick in as a rising arpeggio.
 */
export function LootItemCard(props: LootItemCardProps) {
  const { project, index, revealed } = props;
  const reduce = useReducedMotion();
  const rarity = RARITY[project.rarity];
  const tone = TONE[project.tone];

  // One rising note per stat line, higher for rarer loot.
  useEffect(() => {
    if (!revealed) return;
    const timers = project.stats.map((_, i) =>
      window.setTimeout(
        () => playNote(rarity.noteBase + i * 2, 'square'),
        (reduce ? 0 : STATS_DELAY_MS) + i * STAT_GAP_MS,
      ),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [revealed, project.stats, rarity.noteBase, reduce]);

  return (
    <motion.article
      data-reveal
      style={{ transformPerspective: 1000, '--loot-tone': tone.ring } as React.CSSProperties}
      initial={false}
      animate={
        revealed
          ? { opacity: 1, rotateY: 0, scale: 1, y: 0 }
          : reduce
            ? { opacity: 0 }
            : { opacity: 0, rotateY: 70, scale: 0.85, y: 30 }
      }
      transition={{ type: 'spring', stiffness: 220, damping: 15 }}
      className={cn(
        'loot-ring group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card',
        tone.cardGlow,
      )}>
      <Corners className={tone.border} />

      {/* Art */}
      <div
        className={cn('relative m-3 mb-0 aspect-video overflow-hidden rounded-2xl border-2 bg-background', tone.frame)}>
        {/* Nothing loads until the chest is opened: the card is hidden under it until then. */}
        {revealed && <OnScreenVideo src={project.video} poster={project.poster} />}
        {revealed && project.rarity === 'legendary' && <div aria-hidden className="holo opacity-50" />}
        <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <span
          className={cn(
            'absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 font-pixel text-[9px] uppercase backdrop-blur',
            tone.text,
          )}>
          {rarity.label}
        </span>
        {revealed && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 12, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 12, delay: reduce ? 0 : 0.7 }}
            className="absolute top-2 right-2 rounded-md bg-game-pink px-2 py-1 font-pixel text-[10px] text-white shadow-lg transition-opacity group-hover:opacity-0">
            NEW!
          </motion.span>
        )}
      </div>

      {/* Tooltip body */}
      <div className="flex flex-1 flex-col p-5 pt-4">
        <h3
          className={cn(
            'text-2xl font-extrabold leading-tight tracking-tight [text-shadow:0_0_18px_currentColor]',
            tone.text,
          )}>
          {project.title}
        </h3>
        <p className="text-sm text-foreground/80">{project.type}</p>
        <p className="mt-1 font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
          Item level {project.dates}
        </p>

        <div aria-hidden className="my-3 border-t-2 border-dashed border-border" />

        <ul className="flex flex-col gap-1">
          {project.stats.map((stat, i) => (
            <motion.li
              key={stat}
              initial={false}
              animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: reduce ? 0 : -12 }}
              transition={{ delay: revealed && !reduce ? STATS_DELAY_MS / 1000 + i * (STAT_GAP_MS / 1000) : 0 }}
              className="text-sm font-semibold text-game-accent-text">
              {stat}
            </motion.li>
          ))}
        </ul>

        <p className="mt-3 flex-1 text-sm italic text-game-amber/90">&ldquo;{project.flavor}&rdquo;</p>

        <p className="mt-4 font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">Enchantments</p>
        <LootTechTags tags={project.technologies} />

        <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-border pt-3 font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
          <span>
            Bound to: <span className="text-foreground">{project.boundTo}</span>
          </span>
          <span>Loot #{String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>

      {/* One shine sweep across the card as it lands */}
      {revealed && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent"
          initial={{ x: '0%' }}
          animate={{ x: '520%' }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        />
      )}
    </motion.article>
  );
}

type CornersProps = {
  className: string;
};

/** Pixel L-brackets in the rarity colour, like an item frame in a game UI. */
function Corners(props: CornersProps) {
  const corner = cn('pointer-events-none absolute z-10 size-4', props.className);
  return (
    <>
      <span aria-hidden className={cn(corner, 'top-1.5 left-1.5 border-t-2 border-l-2 rounded-tl-lg')} />
      <span aria-hidden className={cn(corner, 'top-1.5 right-1.5 border-t-2 border-r-2 rounded-tr-lg')} />
      <span aria-hidden className={cn(corner, 'bottom-1.5 left-1.5 border-b-2 border-l-2 rounded-bl-lg')} />
      <span aria-hidden className={cn(corner, 'bottom-1.5 right-1.5 border-b-2 border-r-2 rounded-br-lg')} />
    </>
  );
}

type OnScreenVideoProps = {
  src: string;
  poster: string;
};

/** Plays only while visible; shows the poster frame until the video is ready. */
function OnScreenVideo(props: OnScreenVideoProps) {
  const { src, poster } = props;
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      loop
      muted
      playsInline
      preload="none"
      className="size-full object-cover object-top"
    />
  );
}
