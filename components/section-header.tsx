'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/reveal';

type SectionHeaderProps = {
  index: string;
  kicker: string;
  title: string;
  subtitle?: string;
};

export function SectionHeader(props: SectionHeaderProps) {
  const { index, kicker, title, subtitle } = props;
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col gap-3">
      <Reveal>
        <p className="font-pixel text-[11px] uppercase tracking-[0.25em] text-game-accent-text flex items-center gap-3">
          <span className="inline-grid place-items-center rounded-md bg-game-accent text-game-accent-foreground px-1.5 py-0.5">
            {index}
          </span>
          {kicker}
        </p>
      </Reveal>
      <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-balance">
        {title.split(' ').map((word, i) => (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: words of a static title
            key={i}
            data-reveal
            className="inline-block mr-[0.25em]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: 6 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.08 + i * 0.06 }}>
            {word}
          </motion.span>
        ))}
      </h2>
      {subtitle && (
        <Reveal delay={0.15}>
          <p className="text-muted-foreground text-pretty max-w-xl">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
