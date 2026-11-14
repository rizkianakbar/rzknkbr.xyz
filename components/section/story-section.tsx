import type { JSX } from 'react';
import { Reveal, SectionHeader } from '@/components/game/primitives';
import { resumeData } from '@/lib/resume';

const TICKER = [
  'Banking',
  'Test automation',
  'Esports',
  'Web3',
  'National news',
  'Award-winning podcasts',
  'Smart contracts',
  'AI voice agents',
  'Clinic software',
  'Accessibility',
];

export function StorySection(): JSX.Element {
  return (
    <section id="story" data-section="story" className="scroll-mt-28">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-6">
        <SectionHeader index="02" kicker="Origin story" title="Every hero has a first level" />
        <div className="mt-8 flex flex-col gap-5 text-lg sm:text-xl leading-relaxed text-muted-foreground text-pretty">
          {resumeData.summary.map((p, i) => (
            <Reveal key={p} delay={i * 0.08}>
              <p className={i === resumeData.summary.length - 1 ? 'text-foreground font-semibold' : undefined}>{p}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-14 overflow-hidden border-y border-border bg-card/60 backdrop-blur py-4 -rotate-1">
        <div className="marquee flex w-max gap-8 font-pixel text-sm uppercase whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: duplicated static list for seamless loop
            <span key={i} className="flex items-center gap-8" aria-hidden={i >= TICKER.length}>
              {t}
              <span className="text-game-accent-text">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
