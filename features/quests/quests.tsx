'use client';

import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { useGameActions } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

type Work = (typeof resumeData.work)[number];

const TOTAL = resumeData.work.length;

export function Quests() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="quests" data-section="quests" className="mx-auto w-full max-w-3xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="04"
        kicker="Quest log"
        title="Six quests, six years"
        subtitle="Every job is a quest. Open one to read the lore. Opening quests earns XP."
      />

      <div className="relative mt-10">
        <div
          aria-hidden
          className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-linear-to-b from-game-accent via-game-violet to-transparent"
        />
        <ol className="flex flex-col gap-4">
          {resumeData.work.map((work, i) => (
            <Reveal key={work.company} delay={i * 0.05} as="li" className="relative pl-14">
              <QuestEntry
                work={work}
                level={TOTAL - i}
                open={open === work.company}
                onToggle={() => setOpen((o) => (o === work.company ? null : work.company))}
              />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

type QuestEntryProps = {
  work: Work;
  /** Oldest job is LV 1. */
  level: number;
  open: boolean;
  onToggle: () => void;
};

function QuestEntry(props: QuestEntryProps) {
  const { work, level, open, onToggle } = props;
  const { track } = useGameActions();
  const reduce = useReducedMotion();
  const active = work.end === 'Present';
  const id = `quest-${work.company.replace(/\s+/g, '-').toLowerCase()}`;

  const toggle = (e: React.MouseEvent) => {
    play(open ? 'close' : 'open');
    if (!open) track({ kind: 'quest', key: work.company, total: TOTAL }, { x: e.clientX, y: e.clientY });
    onToggle();
  };

  return (
    <>
      <motion.span
        aria-hidden
        animate={open ? { scale: 1.15, rotate: 45 } : { scale: 1, rotate: 45 }}
        className={cn(
          'absolute left-2 top-5 grid place-items-center size-6 rounded-md border-2 font-pixel text-[9px]',
          open || active
            ? 'bg-game-accent border-game-accent text-game-accent-foreground'
            : 'bg-card border-border text-muted-foreground',
        )}>
        <span className="-rotate-45">{level}</span>
      </motion.span>

      <div
        className={cn(
          'rounded-3xl border bg-card/80 backdrop-blur transition-colors',
          open ? 'border-game-accent/50 shadow-xl shadow-game-accent/5' : 'border-border hover:border-foreground/20',
        )}>
        <button
          type="button"
          data-sfx="none"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          className="w-full flex items-center gap-3 p-4 sm:p-5 text-left">
          <CompanyLogo src={work.logoUrl} alt={work.company} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{work.company}</span>
              {active && (
                <span className="font-pixel text-[9px] uppercase rounded-md bg-game-accent text-game-accent-foreground px-1.5 py-0.5 animate-pulse">
                  Active quest
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{work.title}</p>
          </div>
          <div className="hidden sm:block text-right text-xs text-muted-foreground tabular-nums shrink-0">
            <p>
              {work.start} – {work.end}
            </p>
            <p>{work.location}</p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-muted-foreground">
            <ChevronDown className="size-4" aria-hidden />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={id}
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 32 }}
              className="overflow-hidden">
              <div className="px-4 sm:px-5 pb-5 flex flex-col gap-3">
                <p className="sm:hidden text-xs text-muted-foreground">
                  {work.start} – {work.end} · {work.location}
                </p>
                <p className="text-sm italic text-muted-foreground">{work.blurb}</p>
                <ul className="flex flex-col gap-2">
                  {work.bullets.map((b, i) => (
                    <motion.li
                      key={b}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                      className="flex gap-2.5 text-sm leading-relaxed">
                      <span className="text-game-accent-text font-pixel text-xs mt-0.5" aria-hidden>
                        ✓
                      </span>
                      <span>{b}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {work.tech.map((t) => (
                    <span key={t} className="text-[11px] rounded-lg border border-border bg-muted/50 px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

type CompanyLogoProps = {
  src: string;
  alt: string;
};

/** Falls back to initials when there's no logo or it fails to load. */
function CompanyLogo(props: CompanyLogoProps) {
  const { src, alt } = props;
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <span className="grid place-items-center size-10 rounded-2xl border border-border bg-muted font-pixel text-xs shrink-0">
        {alt.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={40}
      height={40}
      onError={() => setError(true)}
      className="size-10 rounded-2xl border border-border bg-white p-1 object-contain shrink-0"
      draggable={false}
    />
  );
}
