'use client';

import { ArrowUpRight } from 'lucide-react';
import { type JSX, useEffect, useRef } from 'react';
import { useGame } from '@/components/game/game-provider';
import { Tilt } from '@/components/game/primitives';
import { Icons } from '@/components/ui/svgs/icons';
import type { Rarity, resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

const RARITY_LABEL: Record<Rarity, string> = {
  legendary: '★ Legendary',
  epic: '◆ Epic',
  rare: '● Rare',
};

/** Only plays while on screen, so six autoplaying videos don't all decode at once. */
function LazyVideo({ src, className }: { src: string; className?: string }): JSX.Element {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={src} loop muted playsInline preload="metadata" className={className} />;
}

export function ProjectCard({ project }: { project: (typeof resumeData.projects)[number] }): JSX.Element {
  const { award } = useGame();

  return (
    <Tilt className="h-full rounded-3xl" max={7}>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        data-sfx="coin"
        onClick={(e) => award('loot', { x: e.clientX, y: e.clientY })}
        className={cn(
          'rarity-border group flex flex-col h-full rounded-3xl bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-game-accent/50',
          `rarity-${project.rarity}`,
        )}>
        <div className="relative overflow-hidden rounded-t-3xl">
          <LazyVideo
            src={project.video}
            className="w-full aspect-video object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 font-pixel text-[9px] uppercase rounded-md px-2 py-1 bg-black/70 text-[var(--rarity)] backdrop-blur">
            {RARITY_LABEL[project.rarity]}
          </span>
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg leading-tight">{project.title}</h3>
              <p className="text-xs text-muted-foreground">{project.dates}</p>
            </div>
            <ArrowUpRight
              className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
              aria-hidden
            />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">{project.description}</p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.technologies.map((t) => (
              <span key={t} className="text-[11px] rounded-lg border border-border bg-muted/50 px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
        </div>
      </a>
    </Tilt>
  );
}

export function SideQuestCard({ quest }: { quest: (typeof resumeData.sideQuests)[number] }): JSX.Element {
  const { award } = useGame();

  return (
    <Tilt className="h-full rounded-3xl" max={7}>
      <article className="group relative flex flex-col h-full rounded-3xl border border-border bg-card overflow-hidden hover:border-game-cyan/60 transition-colors">
        <div className="relative aspect-[16/9] overflow-hidden bg-linear-to-br from-game-cyan/25 via-game-violet/20 to-game-pink/25">
          {quest.image ? (
            // biome-ignore lint/performance/noImgElement: static screenshots
            <img
              src={quest.image}
              alt={`${quest.title} screenshot`}
              loading="lazy"
              className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="size-full grid place-items-center">
              <div className="flex flex-col items-center gap-3">
                <span className="text-6xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  {quest.emoji}
                </span>
                <span className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground text-center px-4">
                  Front desk → Exam → Pharmacy → Cashier
                </span>
              </div>
            </div>
          )}
          <span className="absolute top-3 left-3 font-pixel text-[9px] uppercase rounded-md px-2 py-1 bg-black/70 text-game-cyan backdrop-blur">
            {quest.emoji} Side quest
          </span>
        </div>
        <div className="p-5 flex flex-col gap-2 flex-1">
          <div>
            <h3 className="font-bold text-lg leading-tight">{quest.title}</h3>
            <p className="text-xs text-muted-foreground">{quest.tagline}</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">{quest.description}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {quest.technologies.map((t) => (
              <span key={t} className="text-[11px] rounded-lg border border-border bg-muted/50 px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-3">
            <a
              href={quest.href}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="coin"
              onClick={(e) => award('loot', { x: e.clientX, y: e.clientY })}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background text-xs font-semibold px-3 py-2 hover:-translate-y-0.5 transition-transform">
              <Icons.globe className="size-3.5" />
              {quest.href.includes('npmjs') ? 'npm' : 'Live'}
            </a>
            <a
              href={quest.repo}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="coin"
              onClick={(e) => award('loot', { x: e.clientX, y: e.clientY })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border text-xs font-semibold px-3 py-2 hover:-translate-y-0.5 hover:border-foreground/40 transition-all">
              <Icons.github className="size-3.5" />
              Source
            </a>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
