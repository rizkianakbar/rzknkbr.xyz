'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { type ReactNode, useRef } from 'react';
import { cn } from '@/lib/utils';

type TiltProps = {
  children: ReactNode;
  className?: string;
  max?: number;
};

/** 3D tilt that follows the mouse, with a soft glare highlight. */
export function Tilt(props: TiltProps) {
  const { children, className, max = 10 } = props;
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
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgb(255 255 255 / 0.22), transparent 55%)`;

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn('relative [transform-style:preserve-3d]', className)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (e.pointerType !== 'mouse' || !rect) return;
        px.set((e.clientX - rect.left) / rect.width);
        py.set((e.clientY - rect.top) / rect.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}>
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
        style={{ background: glare }}
      />
    </motion.div>
  );
}
