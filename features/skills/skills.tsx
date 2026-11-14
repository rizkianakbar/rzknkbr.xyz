'use client';

import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { useFinePointer } from '@/features/skills/skills.hooks';
import { SkillsChip } from '@/features/skills/skills-chip';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

/** Each group is its own instrument: label colour, flash colour and oscillator wave. */
const INSTRUMENTS: { label: string; flash: string; wave: OscillatorType }[] = [
  { label: 'text-game-accent-text', flash: 'bg-game-accent', wave: 'triangle' },
  { label: 'text-game-cyan', flash: 'bg-game-cyan', wave: 'sine' },
  { label: 'text-game-violet', flash: 'bg-game-violet', wave: 'square' },
  { label: 'text-game-pink', flash: 'bg-game-pink', wave: 'triangle' },
];

export function Skills() {
  // Free 2D dragging would hijack page scrolling on touch screens, so only mouse users get it.
  const draggable = useFinePointer();

  return (
    <section id="skills" data-section="skills" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="06"
        kicker="Skill tree"
        title="It's also a xylophone"
        subtitle="Click the skills to play notes (each row is its own instrument), or drag them around and let go."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {resumeData.skillGroups.map((group, g) => {
          const instrument = INSTRUMENTS[g % INSTRUMENTS.length];
          return (
            <Reveal key={group.name} delay={g * 0.06}>
              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 h-full">
                <p className={cn('font-pixel text-[11px] uppercase tracking-widest mb-4', instrument.label)}>
                  {group.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill, i) => (
                    <SkillsChip
                      key={skill.name}
                      name={skill.name}
                      icon={'icon' in skill ? skill.icon : undefined}
                      note={i + g}
                      wave={instrument.wave}
                      flash={instrument.flash}
                      draggable={draggable}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
