'use client';

import { ArrowDown, FileText, MapPin, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useGameState } from '@/features/game/game-provider';
import { HeroLetter } from '@/features/hero/hero-letter';
import { HeroPlayerCard } from '@/features/hero/hero-player-card';
import { HeroTypewriter } from '@/features/hero/hero-typewriter';
import { resumeData } from '@/lib/resume';

// Real casing in the markup (search engines read "Rizkian Akbar"); CSS makes it uppercase.
const [FIRST, LAST] = resumeData.name.split(' ');

const PILL = 'inline-flex items-center rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs';
const SECONDARY_BUTTON =
  'lift inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card/70 backdrop-blur font-semibold px-5 py-2.5';

export function Hero() {
  const { started } = useGameState();
  const reduce = useReducedMotion();
  // Hold the entrance until the start screen is gone, so the drop-in is actually seen.
  const show = started || !!reduce;

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { type: 'spring' as const, stiffness: 200, damping: 24, delay: show ? delay : 0 },
  });

  return (
    <section id="hero" data-section="hero" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <div className="grid gap-12 md:grid-cols-[1.35fr_1fr] md:items-center">
        <div className="flex flex-col gap-6">
          <motion.div {...fadeIn(0.2)} data-reveal className="flex flex-wrap items-center gap-2">
            <span className={`${PILL} gap-2`}>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              {resumeData.availability}
            </span>
            <a
              href={resumeData.locationLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${PILL} gap-1.5 text-muted-foreground hover:text-foreground transition-colors`}>
              <MapPin className="size-3" aria-hidden />
              {resumeData.location}
            </a>
          </motion.div>

          <div>
            <motion.p
              {...fadeIn(0.1)}
              data-reveal
              className="font-pixel text-xs uppercase tracking-[0.3em] text-game-accent-text mb-3">
              Player 1 · Hi, I&apos;m
            </motion.p>
            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.85] text-[clamp(3.4rem,13vw,7.5rem)] select-none">
              <span className="block">
                {FIRST.split('').map((ch, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static name
                  <HeroLetter key={i} char={ch} index={i} show={show} />
                ))}
              </span>
              {/* A real space between the words, so the heading reads "Rizkian Akbar". */}{' '}
              <span className="block text-transparent [-webkit-text-stroke:2px_var(--foreground)]">
                {LAST.split('').map((ch, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static name
                  <HeroLetter key={i} char={ch} index={FIRST.length + i} show={show} outline />
                ))}
              </span>
            </h1>
          </div>

          <motion.div
            {...fadeIn(0.9)}
            data-reveal
            className="text-xl sm:text-2xl font-semibold tracking-tight min-h-[2em]">
            <HeroTypewriter words={resumeData.roles} active={show} />
          </motion.div>

          <motion.p {...fadeIn(1)} data-reveal className="text-muted-foreground text-pretty max-w-lg md:text-lg">
            {resumeData.description}
          </motion.p>

          <motion.div {...fadeIn(1.1)} data-reveal className="flex flex-wrap items-center gap-3">
            <a
              href="#quests"
              data-sfx="whoosh"
              className="lift inline-flex items-center gap-2 rounded-2xl bg-game-accent text-game-accent-foreground font-semibold px-5 py-3 shadow-[0_6px_0_0_color-mix(in_oklab,var(--game-accent)_55%,black)] active:shadow-none">
              <ArrowDown className="size-4" aria-hidden />
              Start the quest
            </a>
            <a href="#contact" data-sfx="whoosh" className={`${SECONDARY_BUTTON} hover:border-game-pink`}>
              Send a party invite
            </a>
            <a
              href={resumeData.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="coin"
              data-cv
              className={`${SECONDARY_BUTTON} hover:border-game-amber`}>
              <FileText className="size-4 text-game-amber" aria-hidden />
              Resume
            </a>
          </motion.div>

          <motion.p
            {...fadeIn(1.4)}
            data-reveal
            className="font-pixel text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground flex items-start gap-2">
            <Sparkles className="mt-0.5 size-3 shrink-0 text-game-amber" aria-hidden />
            Psst: poke the letters. Everything here does something.
          </motion.p>
        </div>

        <motion.div
          className="flex justify-center"
          data-reveal
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={show ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: show ? 0.45 : 0 }}>
          <HeroPlayerCard show={show} />
        </motion.div>
      </div>
    </section>
  );
}
