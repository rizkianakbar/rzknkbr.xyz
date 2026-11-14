'use client';

import { Tilt } from '@/components/tilt';
import { Icons } from '@/components/ui/svgs/icons';
import { useGame } from '@/features/game/game-provider';
import { LootTechTags } from '@/features/loot/loot-tech-tags';
import type { resumeData } from '@/lib/resume';

type LootSideQuestCardProps = {
  quest: (typeof resumeData.sideQuests)[number];
};

const LINK =
  'inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3 py-2 hover:-translate-y-0.5 transition-all';

export function LootSideQuestCard(props: LootSideQuestCardProps) {
  const { quest } = props;
  const { award } = useGame();
  const onOpen = (e: React.MouseEvent) => award('loot', { x: e.clientX, y: e.clientY });

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
                {'caption' in quest && (
                  <span className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground text-center px-4">
                    {quest.caption}
                  </span>
                )}
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
          <LootTechTags tags={quest.technologies} />
          <div className="flex gap-2 pt-3">
            <a
              href={quest.href}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="coin"
              onClick={onOpen}
              className={`${LINK} bg-foreground text-background`}>
              <Icons.globe className="size-3.5" />
              {quest.href.includes('npmjs') ? 'npm' : 'Live'}
            </a>
            <a
              href={quest.repo}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="coin"
              onClick={onOpen}
              className={`${LINK} border border-border hover:border-foreground/40`}>
              <Icons.github className="size-3.5" />
              Source
            </a>
          </div>
        </div>
      </article>
    </Tilt>
  );
}
