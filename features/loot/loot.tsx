import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { LootChests } from '@/features/loot/loot-chests';
import { LootQuestPoster } from '@/features/loot/loot-quest-poster';
import { resumeData } from '@/lib/resume';

export function Loot() {
  return (
    <section id="loot" data-section="loot" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="05"
        kicker="Loot"
        title="Things I shipped"
        subtitle="Production products used by real people, sealed in chests by rarity. Legendary means award-winning or revenue-making. Crack them open."
      />
      <Reveal className="mt-10">
        <LootChests />
      </Reveal>

      <div className="mt-24">
        <SectionHeader
          index="5B"
          kicker="Side quests"
          title="Built for fun (and for real)"
          subtitle="Open-source and personal projects, pinned to the quest board. Each one is live, with the source on GitHub."
        />
        <div className="mt-10 rounded-[2rem] border-2 border-dashed border-border bg-[radial-gradient(circle,var(--border)_1px,transparent_1.5px)] bg-[length:18px_18px] p-5 sm:p-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {resumeData.sideQuests.map((quest, i) => (
              <Reveal key={quest.title} delay={(i % 2) * 0.08} className="h-full">
                <LootQuestPoster quest={quest} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
