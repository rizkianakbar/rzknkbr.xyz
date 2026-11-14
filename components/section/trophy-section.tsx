'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import type { JSX } from 'react';
import { useGame } from '@/components/game/game-provider';
import { CountUp, Reveal, SectionHeader, Tilt } from '@/components/game/primitives';
import { fx } from '@/lib/fx';
import { resumeData } from '@/lib/resume';
import { play } from '@/lib/sound';

const TOTAL = resumeData.trophies.length;

export function TrophySection(): JSX.Element {
  return (
    <section id="trophies" data-section="trophies" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="01"
        kicker="Trophy room"
        title="Numbers from the field"
        subtitle="Real results from real products. Click a trophy to give it a polish."
      />
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {resumeData.trophies.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.06}>
            <Trophy trophy={t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Trophy({ trophy }: { trophy: (typeof resumeData.trophies)[number] }): JSX.Element {
  const { track } = useGame();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useReducedMotion();

  const polish = (e: React.MouseEvent) => {
    play('coin');
    fx.burst(e.clientX, e.clientY, { count: 18, spread: 6, colors: ['#ffc83d', '#fff1b8', '#ffb800'] });
    track({ kind: 'trophy', key: trophy.id, total: TOTAL }, { x: e.clientX, y: e.clientY });
    if (!reduce) void animate(scope.current, { rotate: [0, -18, 14, -8, 0], scale: [1, 1.35, 1] }, { duration: 0.6 });
  };

  return (
    <Tilt className="h-full rounded-3xl" max={8}>
      <motion.button
        type="button"
        data-sfx="none"
        onClick={polish}
        whileTap={{ scale: 0.96 }}
        className="group relative h-full w-full text-left rounded-3xl border border-border bg-card/80 backdrop-blur p-4 sm:p-6 overflow-hidden hover:border-game-amber/60 transition-colors">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 size-32 rounded-full bg-game-amber/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <span ref={scope} className="inline-block text-3xl sm:text-4xl mb-3" aria-hidden>
          {trophy.emoji}
        </span>
        <p className="text-3xl sm:text-5xl font-extrabold tracking-tighter">
          <CountUp
            value={trophy.value}
            prefix={'prefix' in trophy ? trophy.prefix : ''}
            suffix={trophy.suffix}
            plain={'plain' in trophy && trophy.plain}
          />
        </p>
        <p className="font-semibold mt-1 text-sm sm:text-base">{trophy.label}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">{trophy.detail}</p>
      </motion.button>
    </Tilt>
  );
}
