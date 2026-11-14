'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Icons } from '@/components/icons/icons';
import { PixelArt } from '@/components/pixel-art';
import { useGameActions } from '@/features/game/game-provider';
import { CLINIC_SPRITE } from '@/features/loot/loot.constants';
import { LootTechTags } from '@/features/loot/loot-tech-tags';
import type { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

type LootQuestPosterProps = {
  quest: (typeof resumeData.sideQuests)[number];
  index: number;
};

const STATUS = {
  done: { label: '✓ Completed', className: 'bg-game-accent text-game-accent-foreground' },
  active: { label: '◔ In progress', className: 'bg-game-amber text-black' },
} as const;

const LINK = 'lift inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3 py-2 pointer-coarse:py-3';

/** A quest posting pinned to the board: slightly crooked until you look at it. */
export function LootQuestPoster(props: LootQuestPosterProps) {
  const { quest, index } = props;
  const { award } = useGameActions();
  const tilt = index % 2 ? 1.4 : -1.2;
  const status = STATUS[quest.status];
  const onOpen = (e: React.MouseEvent) => award('loot', { x: e.clientX, y: e.clientY });

  return (
    // The wrapper owns the hover and never moves, so the poster can straighten up and rise without
    // slipping out from under the cursor and flickering at its edge.
    <div className="group/poster h-full" style={{ '--poster-tilt': `${tilt}deg` } as React.CSSProperties}>
      <article className="relative h-full rounded-2xl border-2 border-border bg-card p-4 pt-6 shadow-xl shadow-black/30 transition-[rotate,translate,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/poster:border-game-cyan/50 motion-safe:rotate-(--poster-tilt) motion-safe:group-hover/poster:rotate-0 motion-safe:group-hover/poster:-translate-y-1.5">
        {/* Pin */}
        <span
          aria-hidden
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 size-5 rounded-full bg-game-pink shadow-md">
          <span className="absolute top-1 left-1 size-1.5 rounded-full bg-white/70" />
        </span>

        <div className="flex items-center justify-between gap-2 font-pixel text-[9px] uppercase tracking-widest">
          <span className="text-game-cyan">Side quest #{String(index + 1).padStart(2, '0')}</span>
          <span className={cn('rounded-md px-1.5 py-0.5', status.className)}>{status.label}</span>
        </div>

        <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border-2 border-border bg-linear-to-br from-game-cyan/20 via-game-violet/15 to-game-pink/20">
          {quest.image ? (
            <Image
              src={quest.image}
              alt={`${quest.title} screenshot`}
              fill
              sizes="(min-width: 1024px) 460px, (min-width: 640px) 45vw, 100vw"
              draggable={false}
              className="size-full object-cover object-top grayscale-35 transition-[filter,transform] duration-500 group-hover/poster:grayscale-0 group-hover/poster:scale-105"
            />
          ) : (
            <div className="size-full flex flex-col items-center justify-center gap-3">
              <PixelArt
                sprite={CLINIC_SPRITE}
                className="size-16 transition-transform duration-300 group-hover/poster:-rotate-6"
              />
              {'caption' in quest && (
                <span className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground text-center px-4">
                  {quest.caption}
                </span>
              )}
            </div>
          )}
          <span aria-hidden className="crt absolute inset-0 pointer-events-none" />
        </div>

        <h3 className="mt-4 font-bold text-xl leading-tight">{quest.title}</h3>
        <p className="text-xs text-muted-foreground">{quest.tagline}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{quest.description}</p>

        <p className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-game-amber/40 bg-game-amber/5 px-2.5 py-1.5 text-xs">
          <span className="font-pixel text-[9px] uppercase tracking-widest text-game-amber">Reward</span>
          <span className="font-semibold">{quest.reward}</span>
        </p>

        <LootTechTags tags={quest.technologies} />

        <div className="flex gap-2 pt-4">
          <a
            href={quest.href}
            target="_blank"
            rel="noopener noreferrer"
            data-sfx="coin"
            onClick={onOpen}
            className={cn(LINK, 'bg-foreground text-background hover:bg-game-cyan')}>
            {quest.href.includes('npmjs') ? 'Get it on npm' : 'Accept quest'}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
          <a
            href={quest.repo}
            target="_blank"
            rel="noopener noreferrer"
            data-sfx="coin"
            onClick={onOpen}
            className={cn(LINK, 'border border-border hover:border-foreground/40')}>
            <Icons.github className="size-3.5" />
            Source
          </a>
        </div>
      </article>
    </div>
  );
}
