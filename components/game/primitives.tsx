'use client';

import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { type JSX, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const SPRING = { type: 'spring', stiffness: 260, damping: 26 } as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'li';
}

/** Fades and springs content up the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 28, as = 'div' }: RevealProps): JSX.Element {
  const reduce = useReducedMotion();
  const Component = as === 'li' ? motion.li : motion.div;
  return (
    <Component
      data-reveal
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...SPRING, delay }}>
      {children}
    </Component>
  );
}

interface SectionHeaderProps {
  index: string;
  kicker: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ index, kicker, title, subtitle, className }: SectionHeaderProps): JSX.Element {
  const reduce = useReducedMotion();
  const words = title.split(' ');
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Reveal>
        <p className="font-pixel text-[11px] uppercase tracking-[0.25em] text-game-accent-text flex items-center gap-3">
          <span className="inline-grid place-items-center rounded-md bg-game-accent text-game-accent-foreground px-1.5 py-0.5">
            {index}
          </span>
          {kicker}
        </p>
      </Reveal>
      <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-balance">
        {words.map((w, i) => (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: words of a static title
            key={i}
            data-reveal
            className="inline-block mr-[0.25em]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: 6 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.08 + i * 0.06 }}>
            {w}
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

interface TiltProps {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}

/** 3D tilt that follows the pointer, with a soft glare highlight. */
export function Tilt({ children, className, max = 10, glare = true }: TiltProps): JSX.Element {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 20 });
  const sy = useSpring(py, { stiffness: 220, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const gx = useTransform(sx, [0, 1], ['0%', '100%']);
  const gy = useTransform(sy, [0, 1], ['0%', '100%']);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgb(255 255 255 / 0.22), transparent 55%)`;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn('relative [transform-style:preserve-3d]', className)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}>
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  plain?: boolean;
  className?: string;
}

export function CountUp({ value, prefix = '', suffix = '', plain = false, className }: CountUpProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [armed, setArmed] = useState(false);

  // Server-render the final value (crawlers, no-JS), then count up from 0 on the client.
  useEffect(() => {
    if (reduce) return;
    setDisplay(0);
    setArmed(true);
  }, [reduce]);

  useEffect(() => {
    if (!inView || !armed) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, armed, value]);

  const text = plain ? String(display) : display.toLocaleString('en-US');
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
