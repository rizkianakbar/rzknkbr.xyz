'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li';
};

/** Fades and springs content up the first time it scrolls into view. */
export function Reveal(props: RevealProps) {
  const { children, className, delay = 0, y = 28, as = 'div' } = props;
  const reduce = useReducedMotion();
  const Component = as === 'li' ? motion.li : motion.div;

  return (
    <Component
      data-reveal
      className={className}
      // Opacity + transform only: animating blur() repaints the whole element every frame.
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 260, damping: 26, delay }}>
      {children}
    </Component>
  );
}
