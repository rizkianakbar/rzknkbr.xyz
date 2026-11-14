'use client';

import { motion, useReducedMotion } from 'motion/react';
import { type JSX, useEffect, useState } from 'react';
import { useGame } from '@/components/game/game-provider';
import { Reveal, SectionHeader } from '@/components/game/primitives';
import { fx } from '@/lib/fx';
import { resumeData } from '@/lib/resume';
import { playNote } from '@/lib/sound';
import { cn } from '@/lib/utils';

const GROUP_COLORS = ['text-game-accent-text', 'text-game-cyan', 'text-game-violet', 'text-game-pink'];
const GROUP_BG = ['bg-game-accent', 'bg-game-cyan', 'bg-game-violet', 'bg-game-pink'];
const WAVES: OscillatorType[] = ['triangle', 'sine', 'square', 'triangle'];

export function SkillsSection(): JSX.Element {
  return (
    <section id="skills" data-section="skills" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="06"
        kicker="Skill tree"
        title="It's also a xylophone"
        subtitle="Click the skills to play notes (each row is its own instrument), or drag them around and let go."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {resumeData.skillGroups.map((group, g) => (
          <Reveal key={group.name} delay={g * 0.06}>
            <div className="rounded-3xl border border-border bg-card/80 backdrop-blur p-5 h-full">
              <p className={cn('font-pixel text-[11px] uppercase tracking-widest mb-4', GROUP_COLORS[g])}>
                {group.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, i) => (
                  <SkillChip key={skill.name} skill={skill} note={i + g} wave={WAVES[g]} accent={GROUP_BG[g]} />
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SkillChip({
  skill,
  note,
  wave,
  accent,
}: {
  skill: (typeof resumeData.skillGroups)[number]['skills'][number];
  note: number;
  wave: OscillatorType;
  accent: string;
}): JSX.Element {
  const { track } = useGame();
  const reduce = useReducedMotion();
  const [hits, setHits] = useState(0);
  const Icon = 'icon' in skill ? skill.icon : null;
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(window.matchMedia('(pointer: fine)').matches), []);
  const draggable = fine && !reduce;

  const strike = (e: React.PointerEvent) => {
    playNote(note, wave);
    setHits((h) => h + 1);
    track({ kind: 'note' }, { x: e.clientX, y: e.clientY });
    fx.burst(e.clientX, e.clientY, { count: 8, spread: 4 });
  };

  return (
    <motion.button
      type="button"
      data-sfx="none"
      onPointerDown={strike}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playNote(note, wave);
          setHits((h) => h + 1);
          track({ kind: 'note' });
        }
      }}
      drag={draggable}
      dragSnapToOrigin
      dragElastic={0.5}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 12 }}
      whileHover={reduce ? undefined : { y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      whileDrag={{ scale: 1.15, rotate: -6, zIndex: 30 }}
      className={cn(
        'relative h-9 px-3.5 rounded-xl border border-border bg-background flex items-center gap-2 text-sm font-medium select-none overflow-hidden',
        draggable && 'touch-none cursor-grab active:cursor-grabbing',
      )}>
      {hits > 0 && (
        <motion.span
          key={hits}
          aria-hidden
          className={cn('absolute inset-0', accent)}
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {Icon && <Icon className="relative size-4 rounded overflow-hidden object-contain" />}
      <span className="relative">{skill.name}</span>
    </motion.button>
  );
}
