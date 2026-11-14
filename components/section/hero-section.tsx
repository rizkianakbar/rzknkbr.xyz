'use client';

import { ArrowDown, FileText, MapPin, Sparkles } from 'lucide-react';
import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { type JSX, useEffect, useState } from 'react';
import { useGame } from '@/components/game/game-provider';
import { Tilt } from '@/components/game/primitives';
import { fx } from '@/lib/fx';
import { resumeData } from '@/lib/resume';
import { play, playNote } from '@/lib/sound';
import { cn } from '@/lib/utils';

const [FIRST, LAST] = resumeData.name.toUpperCase().split(' ');

export function HeroSection(): JSX.Element {
  const { started } = useGame();
  const reduce = useReducedMotion();
  const show = started || reduce;

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { type: 'spring' as const, stiffness: 200, damping: 24, delay: show ? delay : 0 },
  });

  return (
    <section id="hero" data-section="hero" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <div className="grid gap-12 md:grid-cols-[1.35fr_1fr] md:items-center">
        <div className="flex flex-col gap-6">
          <motion.div {...fade(0.2)} data-reveal className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs">
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
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <MapPin className="size-3" aria-hidden />
              {resumeData.location}
            </a>
          </motion.div>

          <div>
            <motion.p
              {...fade(0.1)}
              data-reveal
              className="font-pixel text-xs uppercase tracking-[0.3em] text-game-accent-text mb-3">
              Player 1 · Hi, I&apos;m
            </motion.p>
            <h1
              aria-label={resumeData.name}
              className="font-extrabold tracking-tighter leading-[0.85] text-[clamp(3.4rem,13vw,7.5rem)] select-none">
              <span className="block" aria-hidden>
                {FIRST.split('').map((ch, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static name
                  <Letter key={`f${i}`} ch={ch} index={i} show={!!show} />
                ))}
              </span>
              <span className="block text-transparent [-webkit-text-stroke:2px_var(--foreground)]" aria-hidden>
                {LAST.split('').map((ch, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: letters of a static name
                  <Letter key={`l${i}`} ch={ch} index={FIRST.length + i} show={!!show} outline />
                ))}
              </span>
            </h1>
          </div>

          <motion.div
            {...fade(0.9)}
            data-reveal
            className="text-xl sm:text-2xl font-semibold tracking-tight min-h-[2em]">
            <Typewriter words={resumeData.roles} active={!!show} />
          </motion.div>

          <motion.p {...fade(1)} data-reveal className="text-muted-foreground text-pretty max-w-lg md:text-lg">
            {resumeData.description}
          </motion.p>

          <motion.div {...fade(1.1)} data-reveal className="flex flex-wrap items-center gap-3">
            <motion.a
              href="#quests"
              data-sfx="whoosh"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-game-accent text-game-accent-foreground font-semibold px-5 py-3 shadow-[0_6px_0_0_color-mix(in_oklab,var(--game-accent)_55%,black)] active:shadow-none active:translate-y-1.5 transition-shadow">
              <ArrowDown className="size-4" aria-hidden />
              Start the quest
            </motion.a>
            <motion.a
              href="#contact"
              data-sfx="whoosh"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card/70 backdrop-blur font-semibold px-5 py-2.5 hover:border-game-pink transition-colors">
              Send a party invite
            </motion.a>
            <motion.a
              href={resumeData.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="coin"
              data-cv
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card/70 backdrop-blur font-semibold px-5 py-2.5 hover:border-game-amber transition-colors">
              <FileText className="size-4 text-game-amber" aria-hidden />
              Resume
            </motion.a>
          </motion.div>

          <motion.p
            {...fade(1.4)}
            data-reveal
            className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Sparkles className="size-3 text-game-amber" aria-hidden />
            Psst: poke the letters. Everything here does something.
          </motion.p>
        </div>

        <motion.div
          className="flex justify-center"
          data-reveal
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={show ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.6, rotate: -8 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: show ? 0.45 : 0 }}>
          <PlayerCard show={!!show} />
        </motion.div>
      </div>
    </section>
  );
}

function Letter({
  ch,
  index,
  show,
  outline,
}: {
  ch: string;
  index: number;
  show: boolean;
  outline?: boolean;
}): JSX.Element {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const { track } = useGame();
  const reduce = useReducedMotion();
  const [tilt] = useState(() => (index % 2 ? 1 : -1) * (12 + ((index * 7) % 18)));

  const hit = (e: React.PointerEvent) => {
    playNote(index + 2, 'square');
    track({ kind: 'poke' }, { x: e.clientX, y: e.clientY });
    fx.burst(e.clientX, e.clientY, { count: 10, spread: 6 });
    if (!reduce) {
      void animate(
        scope.current,
        { scaleY: [1, 0.55, 1.25, 1], scaleX: [1, 1.3, 0.9, 1], y: [0, 10, -30, 0] },
        { duration: 0.55, ease: 'easeOut' },
      );
    }
  };

  return (
    <motion.span
      data-reveal
      data-sfx="none"
      className="inline-block cursor-pointer"
      initial={{ opacity: 0, y: -160, rotate: tilt }}
      animate={show ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: -160, rotate: tilt }}
      transition={{ type: 'spring', stiffness: 420, damping: 13, delay: show ? 0.25 + index * 0.05 : 0 }}
      whileHover={
        reduce ? undefined : { y: -16, rotate: tilt / 2, transition: { type: 'spring', stiffness: 600, damping: 10 } }
      }
      onPointerEnter={(e) => e.pointerType === 'mouse' && playNote(index + 2, 'sine')}
      onPointerDown={hit}>
      <span
        ref={scope}
        className={cn(
          'inline-block origin-bottom transition-colors duration-200',
          outline ? 'hover:text-game-pink hover:[-webkit-text-stroke:0]' : 'hover:text-game-accent-text',
        )}>
        {ch}
      </span>
    </motion.span>
  );
}

function Typewriter({ words, active }: { words: readonly string[]; active: boolean }): JSX.Element {
  const [i, setI] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[i % words.length];

  useEffect(() => {
    if (!active) return;
    let t: number;
    if (!deleting && len < word.length) t = window.setTimeout(() => setLen(len + 1), 55);
    else if (!deleting) t = window.setTimeout(() => setDeleting(true), 1900);
    else if (len > 0) t = window.setTimeout(() => setLen(len - 1), 28);
    else {
      setDeleting(false);
      setI(i + 1);
      return;
    }
    return () => window.clearTimeout(t);
  }, [active, deleting, len, word, i]);

  return (
    <span>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden>
        <span className="text-muted-foreground">class: </span>
        <span className="bg-linear-to-r from-game-accent-text via-game-cyan to-game-pink bg-clip-text text-transparent">
          {word.slice(0, len)}
        </span>
        <span className="inline-block w-[3px] h-[1em] -mb-[0.15em] ml-1 bg-game-accent animate-pulse" />
      </span>
    </span>
  );
}

function PlayerCard({ show }: { show: boolean }): JSX.Element {
  const [flipped, setFlipped] = useState(false);
  const { award } = useGame();
  const reduce = useReducedMotion();

  const flip = (e: React.MouseEvent) => {
    play('flip');
    setFlipped((f) => !f);
    award('card-flip', { x: e.clientX, y: e.clientY });
  };

  return (
    <Tilt className="w-[min(100%,18rem)] sm:w-[min(100%,20rem)] rounded-[28px]" max={14}>
      <motion.button
        type="button"
        data-sfx="none"
        onClick={flip}
        aria-label={flipped ? 'Flip card to front' : 'Flip card to see special moves'}
        aria-pressed={flipped}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 18 }}
        className="relative block w-full aspect-[3/4.2] text-left [transform-style:preserve-3d] cursor-pointer rounded-[28px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-game-accent/60">
        {/* Front */}
        <div className="absolute inset-0 rounded-[28px] p-[3px] bg-linear-to-br from-game-accent via-game-cyan to-game-pink [backface-visibility:hidden] shadow-2xl shadow-game-accent/20">
          <div className="relative h-full w-full rounded-[25px] bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 font-pixel text-[10px] uppercase">
              <span>{resumeData.name}</span>
              <span className="text-game-accent-text">LV 6</span>
            </div>
            <div className="relative mx-3 rounded-2xl overflow-hidden bg-linear-to-br from-game-violet/40 via-game-cyan/20 to-game-accent/30 aspect-square">
              {/* biome-ignore lint/performance/noImgElement: tiny local avatar */}
              <img
                src={resumeData.avatarUrl}
                alt={resumeData.name}
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
              <div className="holo absolute inset-0 animate-[holo_6s_ease-in-out_infinite]" aria-hidden />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 text-white font-pixel text-[9px] px-1.5 py-0.5">
                ★ Product Engineer
              </span>
            </div>
            <ul className="flex flex-col gap-1.5 px-4 py-3 flex-1 justify-center">
              {resumeData.stats.map((s, i) => (
                <li
                  key={s.label}
                  className="grid grid-cols-[4.5rem_1fr_1.75rem] items-center gap-2 font-pixel text-[9px] uppercase">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.span
                      className="block h-full rounded-full bg-linear-to-r from-game-accent to-game-cyan"
                      initial={{ width: 0 }}
                      animate={{ width: show ? `${s.value}%` : 0 }}
                      transition={{ type: 'spring', stiffness: 60, damping: 14, delay: show ? 1 + i * 0.12 : 0 }}
                    />
                  </span>
                  <span className="text-right tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
            <p className="text-center font-pixel text-[8px] uppercase tracking-widest text-muted-foreground pb-2.5">
              Tap to flip ↻
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-[28px] p-[3px] bg-linear-to-br from-game-pink via-game-violet to-game-amber [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="h-full w-full rounded-[25px] bg-card p-5 flex flex-col gap-4">
            <p className="font-pixel text-[10px] uppercase tracking-widest text-game-pink">Special moves</p>
            <ul className="flex flex-col gap-3 flex-1">
              {resumeData.specialMoves.map((m) => (
                <li key={m.name} className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="font-pixel text-[10px] uppercase text-game-amber">⚡ {m.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.text}</p>
                </li>
              ))}
            </ul>
            <p className="text-center font-pixel text-[8px] uppercase tracking-widest text-muted-foreground">
              Tap to flip back ↻
            </p>
          </div>
        </div>
      </motion.button>
    </Tilt>
  );
}
