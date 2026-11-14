'use client';

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';

type CountUpProps = {
  value: number;
  /** Render without thousands separators, e.g. for years. */
  plain?: boolean;
};

/**
 * Server-renders the final number (crawlers, no-JS), then counts up from 0 when scrolled into view.
 * The number is a motion value, so counting doesn't re-render React on every frame.
 */
export function CountUp(props: CountUpProps) {
  const { value, plain = false } = props;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const count = useMotionValue(value);
  const text = useTransform(count, (v) => (plain ? String(Math.round(v)) : Math.round(v).toLocaleString('en-US')));

  useEffect(() => {
    if (reduce) return;
    if (!inView) {
      count.set(0);
      return;
    }
    const controls = animate(count, value, { from: 0, duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduce, value, count]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {text}
    </motion.span>
  );
}
