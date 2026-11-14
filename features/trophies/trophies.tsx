'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { CountUp } from '@/components/count-up';
import { PixelArt } from '@/components/pixel-art';
import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { Tilt } from '@/components/tilt';
import { fx } from '@/features/fx/fx.lib';
import { useGameActions } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { type Tone, TRAFFIC, TROPHY_ART } from '@/features/trophies/trophies.constants';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

type Trophy = (typeof resumeData.trophies)[number];

/** Literal class names per tone, so Tailwind can see them. */
const TONE: Record<Tone, { light: string; text: string; slot: string; hover: string; burst: string[] }> = {
  accent: {
    light: 'var(--game-accent)',
    text: 'text-game-accent-text',
    slot: 'border-game-accent/40 bg-game-accent/10',
    hover: 'hover:border-game-accent/60',
    burst: ['#c6ff3d', '#eaffb8', '#9be22a'],
  },
  pink: {
    light: 'var(--game-pink)',
    text: 'text-game-pink',
    slot: 'border-game-pink/40 bg-game-pink/10',
    hover: 'hover:border-game-pink/60',
    burst: ['#ff5fae', '#ffc2e0', '#ff8fc7'],
  },
  amber: {
    light: 'var(--game-amber)',
    text: 'text-game-amber',
    slot: 'border-game-amber/40 bg-game-amber/10',
    hover: 'hover:border-game-amber/60',
    burst: ['#ffc83d', '#fff1b8', '#ffb800'],
  },
  violet: {
    light: 'var(--game-violet)',
    text: 'text-game-violet',
    slot: 'border-game-violet/40 bg-game-violet/10',
    hover: 'hover:border-game-violet/60',
    burst: ['#a98bff', '#e0d6ff', '#c3b0ff'],
  },
  cyan: {
    light: 'var(--game-cyan)',
    text: 'text-game-cyan',
    slot: 'border-game-cyan/40 bg-game-cyan/10',
    hover: 'hover:border-game-cyan/60',
    burst: ['#4fe3ff', '#c4f6ff', '#8eeeff'],
  },
};

/** Content arrangement per tile size: wide tiles go side by side once there's room. */
const LAYOUT = {
  hero: 'items-center gap-5',
  wide: 'flex-col sm:flex-row sm:items-center gap-3 sm:gap-5',
  small: 'flex-col gap-3',
} as const;

/** Grid placement per tile size: 2 columns on phones, a 6-column bento from `lg`. */
const SPAN = {
  hero: 'col-span-2 lg:col-span-3 lg:row-span-2',
  wide: 'col-span-1 lg:col-span-3',
  small: 'col-span-1 lg:col-span-2',
} as const;

export function Trophies() {
  return (
    <section id="trophies" data-section="trophies" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="01"
        kicker="Trophy room"
        title="Numbers from the field"
        subtitle="Real results from real products. Click a trophy to give it a polish."
      />
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {resumeData.trophies.map((trophy, i) => (
          <Reveal
            key={trophy.id}
            delay={i * 0.06}
            className={cn(
              SPAN[TROPHY_ART[trophy.id].size],
              i === resumeData.trophies.length - 1 && 'max-lg:col-span-2',
            )}>
            <TrophyTile trophy={trophy} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

type TrophyTileProps = {
  trophy: Trophy;
  index: number;
};

function TrophyTile(props: TrophyTileProps) {
  const { trophy, index } = props;
  const art = TROPHY_ART[trophy.id];
  const tone = TONE[art.tone];
  const { track } = useGameActions();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReducedMotion();

  const polish = (e: React.MouseEvent) => {
    play('coin');
    fx.burst(e.clientX, e.clientY, { count: 18, spread: 6, colors: tone.burst });
    track({ kind: 'trophy', key: trophy.id, total: resumeData.trophies.length }, { x: e.clientX, y: e.clientY });
    if (!reduce) void animate(scope.current, { rotate: [0, -14, 12, -6, 0], scale: [1, 1.25, 1] }, { duration: 0.6 });
  };

  const isHero = art.size === 'hero';

  return (
    <Tilt className="h-full rounded-3xl" max={isHero ? 5 : 8} glow={tone.light}>
      <motion.button
        type="button"
        data-sfx="none"
        onClick={polish}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'group relative h-full w-full text-left rounded-3xl border border-border bg-card/80 backdrop-blur overflow-hidden transition-colors',
          tone.hover,
          isHero ? 'p-5 sm:p-7 flex flex-col gap-6' : 'p-4 sm:p-5',
        )}>
        <div className={cn('relative flex', LAYOUT[art.size])}>
          <ItemSlot className={cn(tone.slot, tone.text)} size={isHero ? 'lg' : 'md'} index={index}>
            <div ref={scope} className="size-full">
              <PixelArt sprite={art.sprite} className="size-full" />
            </div>
          </ItemSlot>

          <div className="min-w-0">
            <p
              className={cn(
                'font-extrabold tracking-tighter leading-none',
                isHero ? 'text-5xl sm:text-7xl' : 'text-3xl sm:text-4xl',
              )}>
              {'prefix' in trophy && trophy.prefix}
              <CountUp value={trophy.value} plain={'plain' in trophy && trophy.plain} />
              <span className={tone.text}>{trophy.suffix}</span>
            </p>
            <p className="font-semibold mt-2 text-sm sm:text-base">{trophy.label}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">{trophy.detail}</p>
          </div>
        </div>

        {isHero && <TrafficChart />}
      </motion.button>
    </Tilt>
  );
}

type ItemSlotProps = {
  className: string;
  size: 'md' | 'lg';
  index: number;
  children: React.ReactNode;
};

/** An inventory slot: the sprite floats gently inside a bordered, pixel-cornered frame. */
function ItemSlot(props: ItemSlotProps) {
  const { className, size, index, children } = props;

  return (
    <div
      className={cn(
        'relative shrink-0 grid place-items-center rounded-2xl border-2',
        className,
        size === 'lg' ? 'size-24 sm:size-28 p-3' : 'size-16 sm:size-20 p-2.5',
      )}>
      {/* Pixel corner ticks in the tile's colour, like a game inventory frame. */}
      <span aria-hidden className="absolute top-1 left-1 size-1 bg-current opacity-30" />
      <span aria-hidden className="absolute top-1 right-1 size-1 bg-current opacity-30" />
      <span aria-hidden className="absolute bottom-1 left-1 size-1 bg-current opacity-30" />
      <span aria-hidden className="absolute bottom-1 right-1 size-1 bg-current opacity-30" />
      {/* Idle bob as a CSS loop: runs on the compositor, costs React nothing. */}
      <div className="bob size-full" style={{ animationDelay: `${index * 0.3}s` }}>
        {children}
      </div>
    </div>
  );
}

/** Decorative stepped bars growing to the 800K peak. Illustrative shape, not real analytics. */
function TrafficChart() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mt-auto" aria-hidden>
      <div className="flex items-end gap-1.5 h-24 sm:h-32">
        {TRAFFIC.map((value, i) => {
          const isPeak = i === TRAFFIC.length - 1;
          return (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed chart data
              key={i}
              className={cn(
                'flex-1 rounded-t-[3px] origin-bottom',
                isPeak ? 'bg-game-accent shadow-[0_0_18px_var(--game-accent)]' : 'bg-game-accent/35',
              )}
              style={{ height: `${value * 100}%` }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.2 + i * 0.05 }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-pixel text-[9px] uppercase tracking-widest text-muted-foreground">
        <span>Launch</span>
        <span className="text-game-accent-text">Peak · 800K/mo</span>
      </div>
    </div>
  );
}
