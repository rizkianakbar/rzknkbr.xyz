'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useState } from 'react';
import { SectionHeader } from '@/components/section-header';
import { BRANCHES, type Branch, CONNECTOR_DROPS } from '@/features/skills/skills.constants';
import { SkillsNode } from '@/features/skills/skills-node';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

const TOTAL = resumeData.skillGroups.reduce((sum, g) => sum + g.skills.length, 0);

/** A real skill tree: a core node feeding four branches whose nodes light up as you play them. */
export function Skills() {
  const [lit, setLit] = useState<ReadonlySet<string>>(new Set());
  const reduce = useReducedMotion();

  // Stable, so memoized nodes only re-render when their own `lit` flag changes.
  const light = useCallback((name: string) => setLit((prev) => (prev.has(name) ? prev : new Set(prev).add(name))), []);

  return (
    <section id="skills" data-section="skills" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="06"
        kicker="Skill tree"
        title="Every node is a note"
        subtitle="Hit a skill to play it and light it up. Each branch is its own instrument. Can you light the whole tree?"
      />

      <div className="mt-12">
        <div className="flex justify-center">
          <div className="relative rounded-2xl border-2 border-game-accent bg-card px-5 py-3 text-center shadow-[0_0_30px_-8px_var(--game-accent)]">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-game-accent-text">Core</p>
            <p className="font-bold">Product Engineer</p>
            <p className="font-pixel text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5 tabular-nums">
              {lit.size}/{TOTAL} nodes lit
            </p>
          </div>
        </div>

        {/* Root connector: down from the core, across, and into each branch (4-column layout only). */}
        <div aria-hidden className="relative hidden lg:block h-10">
          <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 bg-border" />
          <motion.span
            className="absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-border"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          />
          {CONNECTOR_DROPS.map((left) => (
            <span key={left} className="absolute top-5 h-5 w-0.5 -translate-x-1/2 bg-border" style={{ left }} />
          ))}
        </div>

        <div className="mt-8 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-10">
          {resumeData.skillGroups.map((group, g) => (
            <SkillsBranch
              key={group.name}
              name={group.name}
              skills={group.skills}
              branch={BRANCHES[g % BRANCHES.length]}
              index={g}
              lit={lit}
              onLight={light}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type SkillsBranchProps = {
  name: string;
  skills: (typeof resumeData.skillGroups)[number]['skills'];
  branch: Branch;
  index: number;
  lit: ReadonlySet<string>;
  onLight: (name: string) => void;
};

function SkillsBranch(props: SkillsBranchProps) {
  const { name, skills, branch, index, lit, onLight } = props;
  const reduce = useReducedMotion();
  const litCount = skills.filter((s) => lit.has(s.name)).length;
  const mastered = litCount === skills.length;
  // The spine charges first, then nodes pop in along it.
  const charge = 0.15 + index * 0.12;

  return (
    <div>
      <div
        className={cn(
          'rounded-2xl border-2 bg-card px-3 py-2.5 text-center transition-shadow',
          branch.border,
          mastered && branch.glow,
        )}>
        <p className={cn('font-pixel text-[10px] uppercase tracking-widest', branch.text)}>{name}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <motion.span
              className={cn('block h-full rounded-full', branch.fill)}
              initial={false}
              animate={{ width: `${(litCount / skills.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            />
          </span>
          <span className="font-pixel text-[9px] text-muted-foreground tabular-nums">
            {mastered ? 'Mastered' : `${litCount}/${skills.length}`}
          </span>
        </div>
      </div>

      <ol className="relative mt-3 pl-5">
        <span aria-hidden className="absolute left-2.25 top-0 bottom-5 w-0.5 bg-border" />
        <motion.span
          aria-hidden
          className={cn('absolute left-2.25 top-0 bottom-5 w-0.5 origin-top opacity-60', branch.fill)}
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: charge, ease: [0.23, 1, 0.32, 1] }}
        />
        {skills.map((skill, i) => (
          <li key={skill.name} className="relative mt-2 first:mt-0">
            <span
              aria-hidden
              className={cn(
                'absolute -left-2.75 top-1/2 h-0.5 w-2.75 transition-colors',
                lit.has(skill.name) ? branch.fill : 'bg-border',
              )}
            />
            <SkillsNode
              name={skill.name}
              icon={'icon' in skill ? skill.icon : undefined}
              note={i + index}
              branch={branch}
              lit={lit.has(skill.name)}
              enterDelay={charge + 0.2 + i * 0.05}
              onLight={onLight}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
