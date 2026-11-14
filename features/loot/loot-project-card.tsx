'use client';

import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Tilt } from '@/components/tilt';
import { useGame } from '@/features/game/game-provider';
import { LootTechTags } from '@/features/loot/loot-tech-tags';
import type { Rarity, resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

const RARITY_LABEL: Record<Rarity, string> = {
  legendary: '★ Legendary',
  epic: '◆ Epic',
  rare: '● Rare',
};

type LootProjectCardProps = {
  project: (typeof resumeData.projects)[number];
};

export function LootProjectCard(props: LootProjectCardProps) {
  const { project } = props;
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
          <OnScreenVideo
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
          <LootTechTags tags={project.technologies} />
        </div>
      </a>
    </Tilt>
  );
}

type OnScreenVideoProps = {
  src: string;
  className?: string;
};

/** Only plays while on screen, so six looping videos don't all decode at once. */
function OnScreenVideo(props: OnScreenVideoProps) {
  const { src, className } = props;
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

  return <video ref={ref} src={src} loop muted playsInline preload="metadata" className={className} />;
}
