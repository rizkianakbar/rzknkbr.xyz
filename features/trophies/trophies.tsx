'use client';

import { motion, useAnimate, useReducedMotion } from 'motion/react';
import { CountUp } from '@/components/count-up';
import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { Tilt } from '@/components/tilt';
import { fx } from '@/features/fx/fx.lib';
import { useGame } from '@/features/game/game-provider';
import { play } from '@/features/sound/sound.lib';
import { resumeData } from '@/lib/resume';

type Trophy = (typeof resumeData.trophies)[number];

const GOLD = ['#ffc83d', '#fff1b8', '#ffb800'];

export function Trophies() {
  return (
    <section id="trophies" data-section="trophies" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="01"
        kicker="Trophy room"
        title="Numbers from the field"
        subtitle="Real results from real products. Click a trophy to give it a polish."
      />
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {resumeData.trophies.map((trophy, i) => (
          <Reveal key={trophy.id} delay={i * 0.06}>
            <TrophyCard trophy={trophy} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

type TrophyCardProps = {
  trophy: Trophy;
};

function TrophyCard(props: TrophyCardProps) {
  const { trophy } = props;
  const { track } = useGame();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const reduce = useReducedMotion();

  const polish = (e: React.MouseEvent) => {
    play('coin');
    fx.burst(e.clientX, e.clientY, { count: 18, spread: 6, colors: GOLD });
    track({ kind: 'trophy', key: trophy.id, total: resumeData.trophies.length }, { x: e.clientX, y: e.clientY });
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
          {'prefix' in trophy && trophy.prefix}
          <CountUp value={trophy.value} plain={'plain' in trophy && trophy.plain} />
          {trophy.suffix}
        </p>
        <p className="font-semibold mt-1 text-sm sm:text-base">{trophy.label}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">{trophy.detail}</p>
      </motion.button>
    </Tilt>
  );
}
