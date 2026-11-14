import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { LootProjectCard } from '@/features/loot/loot-project-card';
import { LootSideQuestCard } from '@/features/loot/loot-side-quest-card';
import { resumeData } from '@/lib/resume';

export function Loot() {
  return (
    <section id="loot" data-section="loot" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="05"
        kicker="Loot"
        title="Things I shipped"
        subtitle="Production products used by real people, sorted by rarity. Legendary means award-winning or revenue-making."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {resumeData.projects.map((project, i) => (
          <Reveal key={project.title} delay={(i % 2) * 0.08} className="h-full">
            <LootProjectCard project={project} />
          </Reveal>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeader
          index="5B"
          kicker="Side quests"
          title="Built for fun (and for real)"
          subtitle="Open-source and personal projects. Live, with the source on GitHub."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {resumeData.sideQuests.map((quest, i) => (
            <Reveal key={quest.title} delay={(i % 2) * 0.08} className="h-full">
              <LootSideQuestCard quest={quest} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
