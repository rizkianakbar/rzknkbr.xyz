'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { type ReactNode, useRef } from 'react';

type TiltProps = {
  children: ReactNode;
  className?: string;
  max?: number;
  /** Colour of the hover spotlight (any CSS colour, e.g. `var(--game-amber)`). */
  glow?: string;
};

/**
 * 3D tilt that follows the mouse, with a spotlight that traces the card's border under the cursor.
 * Nothing glows at rest: the light fades in on hover and out on leave.
 *
 * The outer element never moves: it receives the pointer and is what we measure. Measuring the
 * tilted element instead would feed its own rotation back into the next frame and make it jitter.
 */
export function Tilt(props: TiltProps) {
  const { children, className, max = 10, glow = 'rgb(255 255 255 / 0.6)' } = props;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 220, damping: 22 });
  const sy = useSpring(py, { stiffness: 220, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const lightX = useTransform(px, [0, 1], ['0%', '100%']);
  const lightY = useTransform(py, [0, 1], ['0%', '100%']);
  const light = useSpring(0, { stiffness: 260, damping: 30 });
  const spot = useMotionTemplate`radial-gradient(260px circle at ${lightX} ${lightY}, ${glow}, transparent 70%)`;
  const wash = useMotionTemplate`radial-gradient(420px circle at ${lightX} ${lightY}, color-mix(in oklab, ${glow} 12%, transparent), transparent 70%)`;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div
      ref={ref}
      className={className}
      onPointerEnter={(e) => e.pointerType === 'mouse' && light.set(1)}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (e.pointerType !== 'mouse' || !rect) return;
        px.set((e.clientX - rect.left) / rect.width);
        py.set((e.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
        light.set(0);
      }}>
      <motion.div
        className="relative h-full rounded-[inherit] [transform-style:preserve-3d]"
        style={{ rotateX, rotateY, transformPerspective: 900 }}>
        {children}
        {/* Faint inner wash, then a bright 2px ring lit only near the cursor (masked to the border). */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
          style={{ background: wash, opacity: light }}
        />
        <motion.div
          aria-hidden
          className="spotlight-ring pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
          style={{ background: spot, opacity: light }}
        />
      </motion.div>
    </div>
  );
}
