'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/icons/icons';
import { SectionHeader } from '@/components/section-header';
import { fx } from '@/features/fx/fx.lib';
import { useGameActions } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { PartyBot } from '@/features/testimonials/party-bot';
import { paginate } from '@/features/testimonials/testimonials.lib';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

/** Literal class names per tone, so Tailwind can see them. */
const TONES = [
  {
    bg: 'bg-game-pink',
    text: 'text-game-pink',
    border: 'border-game-pink',
    shadow: 'shadow-[6px_6px_0_0_var(--game-pink)]',
    burst: ['#ff5fae', '#ffc2e0', '#ff8fc7'],
  },
  {
    bg: 'bg-game-cyan',
    text: 'text-game-cyan',
    border: 'border-game-cyan',
    shadow: 'shadow-[6px_6px_0_0_var(--game-cyan)]',
    burst: ['#4fe3ff', '#c4f6ff', '#8aedff'],
  },
  {
    bg: 'bg-game-amber',
    text: 'text-game-amber',
    border: 'border-game-amber',
    shadow: 'shadow-[6px_6px_0_0_var(--game-amber)]',
    burst: ['#ffc83d', '#ffe9a8', '#ffd970'],
  },
  {
    bg: 'bg-game-violet',
    text: 'text-game-violet',
    border: 'border-game-violet',
    shadow: 'shadow-[6px_6px_0_0_var(--game-violet)]',
    burst: ['#a98bff', '#ddd1ff', '#c3b0ff'],
  },
] as const;

const PARTY = resumeData.testimonials.map((t, i) => ({
  ...t,
  tone: TONES[i % TONES.length],
  pages: paginate(t.quote),
}));

// Every page and role line, laid out invisibly in one grid cell, sizes the box to the tallest one.
const ALL_PAGES = PARTY.flatMap((m) => m.pages);
const ALL_ROLES = PARTY.map((m) => `${m.role} · ${m.date}`);
const STACK = 'col-start-1 row-start-1';

const TYPE_MS = 18;

// Always ask the optimizer for the 16px copy (even on retina), so upscaling it gives chunky pixels.
const tiny = ({ src }: { src: string }) => `/_next/image?url=${encodeURIComponent(src)}&w=16&q=75`;

type PortraitProps = { src: string; sharp: boolean };

/** Photo drawn as pixel art until `sharp`, then crossfades to the real thing. */
function Portrait(props: PortraitProps) {
  const { src, sharp } = props;
  return (
    <span className="relative block size-full overflow-hidden rounded-xl">
      <Image
        src={src}
        alt=""
        width={16}
        height={16}
        loader={tiny}
        className="absolute inset-0 size-full [image-rendering:pixelated]"
      />
      <Image
        src={src}
        alt=""
        width={96}
        height={96}
        className={cn(
          'absolute inset-0 size-full transition-opacity duration-500',
          sharp ? 'opacity-100' : 'opacity-0',
        )}
      />
    </span>
  );
}

export function Testimonials() {
  const reduce = useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, { once: true, margin: '-80px' });
  const { track } = useGameActions();
  const [who, setWho] = useState(0);
  const [page, setPage] = useState(0);
  const [typed, setTyped] = useState(0);
  const [talked, setTalked] = useState<ReadonlySet<number>>(new Set());

  const member = PARTY[who];
  const text = member.pages[page];
  const shown = reduce ? text.length : typed;
  const done = shown >= text.length;
  const lastPage = page === member.pages.length - 1;

  useEffect(() => {
    if (!inView || reduce || done) return;
    const id = window.setInterval(() => setTyped((n) => n + 1), TYPE_MS);
    return () => window.clearInterval(id);
  }, [inView, reduce, done]);

  // Reading someone's last page clears their "!" and earns XP; the whole party unlocks an achievement.
  useEffect(() => {
    if (!inView || !done || !lastPage || talked.has(who)) return;
    setTalked(new Set(talked).add(who));
    const rect = boxRef.current?.getBoundingClientRect();
    track(
      { kind: 'testimonial', key: PARTY[who].name, total: PARTY.length },
      rect && { x: rect.left + rect.width / 2, y: rect.top },
    );
  }, [inView, done, lastPage, who, talked, track]);

  const select = (i: number) => {
    setWho(i);
    setPage(0);
    setTyped(0);
  };

  const pick = (i: number, e: React.MouseEvent) => {
    play('open');
    fx.burst(e.clientX, e.clientY, { count: 14, spread: 5, colors: [...PARTY[i].tone.burst] });
    select(i);
  };

  // First press finishes the typing, the next turns the page, the last page hands over to the next member.
  const advance = () => {
    play('tap');
    if (!done) setTyped(text.length);
    else if (!lastPage) {
      setPage((p) => p + 1);
      setTyped(0);
    } else select((who + 1) % PARTY.length);
  };

  return (
    <section
      id="testimonials"
      data-section="testimonials"
      className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="07"
        kicker="Party chat"
        title="Talk to the party"
        subtitle="Party members with a ! have something to say about me. Click the text box to skip or read on."
      />

      <div className="mt-10 grid gap-8 md:grid-cols-[15rem_1fr]">
        <div>
          <p className="mb-3 flex items-center justify-between font-pixel text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Party</span>
            <span className={cn('tabular-nums', talked.size === PARTY.length && 'text-game-accent-text')}>
              Talked {talked.size}/{PARTY.length}
            </span>
          </p>

          {/* Roster: a row of avatars on phones, a party menu beside the dialogue from md up */}
          <div className="grid grid-cols-4 gap-2.5 md:grid-cols-1 md:gap-3">
            {PARTY.map((m, i) => {
              const active = i === who;
              const fresh = !talked.has(i);
              return (
                <motion.button
                  key={m.name}
                  type="button"
                  data-sfx="none"
                  aria-pressed={active}
                  aria-label={`${m.name}, ${m.role}${fresh ? ', not talked to yet' : ''}`}
                  onClick={(e) => pick(i, e)}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    'relative flex items-center gap-3 rounded-2xl border-2 bg-card/80 backdrop-blur p-1.5 md:p-2.5 md:pr-3 text-left transition-[border-color,box-shadow,translate]',
                    active
                      ? cn(m.tone.border, m.tone.shadow, '-translate-x-0.5 -translate-y-0.5')
                      : 'border-border hover:border-foreground/30',
                  )}>
                  {active && (
                    <motion.span
                      layoutId="party-cursor"
                      aria-hidden
                      className={cn(
                        'absolute -top-3.5 left-1/2 -translate-x-1/2 font-pixel text-xs md:top-1/2 md:-left-5 md:translate-x-0 md:-translate-y-1/2 md:-rotate-90',
                        m.tone.text,
                      )}>
                      ▼
                    </motion.span>
                  )}
                  <span
                    className={cn(
                      'relative aspect-square w-full md:w-12 shrink-0 rounded-xl border border-border p-0.5 transition-[filter,opacity]',
                      active ? 'bg-foreground/10' : 'bg-background/60 grayscale-70 opacity-70',
                    )}>
                    <motion.span
                      className="block size-full"
                      animate={active && !reduce ? { y: [0, -2, 0] } : { y: 0 }}
                      transition={{ duration: 0.5, repeat: active ? Number.POSITIVE_INFINITY : 0, ease: 'easeInOut' }}>
                      <Portrait src={m.photo} sharp={active} />
                    </motion.span>
                  </span>
                  {/* NPC marker: "!" until you've heard them out, then a check */}
                  <motion.span
                    key={fresh ? 'fresh' : 'talked'}
                    aria-hidden
                    initial={reduce ? false : { scale: 0 }}
                    animate={fresh && !reduce ? { scale: 1, y: [0, -3, 0] } : { scale: 1 }}
                    transition={
                      fresh
                        ? { y: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' } }
                        : { type: 'spring', stiffness: 500, damping: 18 }
                    }
                    className={cn(
                      'absolute -top-2 -right-2 grid size-5 place-items-center rounded-md border-2 border-foreground/80 font-pixel text-[9px] text-black md:top-1.5 md:left-11 md:right-auto',
                      fresh ? 'bg-game-amber' : 'bg-game-accent',
                    )}>
                    {fresh ? '!' : '✓'}
                  </motion.span>
                  <span className="hidden md:block min-w-0">
                    <span className="block font-bold text-sm leading-tight">{m.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground leading-snug">{m.role}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Dialogue box */}
        {/* Stretched to the party column's height; md:pt-7 lines it up with the cards under the "Party" label. */}
        <div className="flex flex-col md:pt-7">
          <div ref={boxRef} className="relative flex flex-1 flex-col">
            <div
              className={cn(
                'absolute -top-4 left-5 sm:left-8 z-10 rounded-xl border-2 border-foreground/80 px-3 py-1.5 font-pixel text-[10px] uppercase tracking-[0.2em] text-black',
                member.tone.bg,
              )}>
              {member.name}
            </div>

            {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: mouse shortcut; the Next button is the keyboard path */}
            <div
              onClick={advance}
              className={cn(
                'flex flex-1 flex-col cursor-pointer select-none rounded-3xl border-2 border-foreground/80 bg-card/95 backdrop-blur p-1.5 transition-shadow',
                member.tone.shadow,
              )}>
              <div className="flex flex-1 gap-6 rounded-[1.1rem] border border-border p-5 pt-8 sm:px-6 sm:pb-5">
                <div className="hidden lg:block size-20 shrink-0 rounded-2xl border border-border bg-background/60 p-1">
                  <Portrait src={member.photo} sharp />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <blockquote className="sr-only">
                    <p>{member.quote}</p>
                    <footer>
                      {member.name}, {member.role}, <time>{member.date}</time>
                    </footer>
                  </blockquote>

                  <p
                    className="mb-3 grid font-pixel text-[9px] uppercase tracking-wider text-muted-foreground leading-relaxed"
                    aria-hidden>
                    {ALL_ROLES.map((r) => (
                      <span key={r} className={cn(STACK, 'invisible')}>
                        {r}
                      </span>
                    ))}
                    <span className={STACK}>
                      {member.role} · {member.date}
                    </span>
                  </p>

                  {/* Every page laid out invisibly (phones only) keeps the box one height; on md+ the party column sets it. */}

                  <div className="grid flex-1 text-base lg:text-lg font-medium leading-relaxed text-pretty">
                    {ALL_PAGES.map((p) => (
                      <span key={p} aria-hidden className={cn(STACK, 'invisible md:hidden')}>
                        {p}
                      </span>
                    ))}

                    <div className={cn(STACK, 'flex flex-col')}>
                      <p aria-hidden>
                        {text.slice(0, shown)}

                        {!done && (
                          <span className={cn('ml-0.5 inline-block h-[1em] w-2 -mb-[0.15em]', member.tone.bg)} />
                        )}
                      </p>

                      <PartyBot />
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-3 pt-5">
                    <div className="flex gap-1.5" aria-hidden>
                      {member.pages.map((p, i) => (
                        <span
                          key={p}
                          className={cn(
                            'size-2 rounded-[2px] transition-colors',
                            i === page ? member.tone.bg : 'bg-foreground/15',
                          )}
                        />
                      ))}
                    </div>
                    {'href' in member && (
                      <a
                        href={member.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${member.name} on LinkedIn`}
                        className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30">
                        <Icons.linkedin className="size-3.5" />
                      </a>
                    )}
                    {'letterUrl' in member && (
                      <a
                        href={member.letterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-lg border border-border px-2 py-1.5 font-pixel text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30">
                        ✉ Read letter
                      </a>
                    )}
                    <button
                      type="button"
                      data-sfx="none"
                      onClick={(e) => {
                        e.stopPropagation();
                        advance();
                      }}
                      className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-foreground/5">
                      {!done ? 'Skip' : lastPage ? 'Next member' : 'Next'}
                      <span
                        aria-hidden
                        className={cn(
                          'inline-block',
                          member.tone.text,
                          done && 'motion-safe:animate-bounce',
                          done && lastPage && '-rotate-90',
                        )}>
                        ▼
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
