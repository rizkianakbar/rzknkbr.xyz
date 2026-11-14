'use client';

import { type MotionValue, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { createContext, type ReactNode, useContext, useRef } from 'react';
import { cn } from '@/lib/utils';

const MAGNIFICATION = 60;
const DISTANCE = 100;
const BASE_SIZE = 40;
const BASE_ICON_SIZE = 20;
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

/** Mouse x in viewport coordinates, or Infinity when the mouse is outside the dock. */
const DockMouseContext = createContext<MotionValue<number> | null>(null);

type NavbarDockProps = {
  className?: string;
  children: ReactNode;
};

/** macOS-style dock: icons grow as the mouse gets closer. */
export function NavbarDock(props: NavbarDockProps) {
  const { className, children } = props;
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <DockMouseContext.Provider value={mouseX}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className={cn(
          'mx-auto w-max h-full flex items-end justify-center overflow-visible rounded-full border',
          className,
        )}>
        {children}
      </motion.div>
    </DockMouseContext.Provider>
  );
}

type NavbarDockIconProps = {
  className?: string;
  children?: ReactNode;
};

export function NavbarDockIcon(props: NavbarDockIconProps) {
  const { className, children } = props;
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useContext(DockMouseContext);
  if (!mouseX) throw new Error('NavbarDockIcon must be used within NavbarDock');

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return x - bounds.x - bounds.width / 2;
  });
  const size = useSpring(
    useTransform(distance, [-DISTANCE, 0, DISTANCE], [BASE_SIZE, MAGNIFICATION, BASE_SIZE]),
    SPRING,
  );
  const iconSize = useSpring(
    useTransform(distance, [-DISTANCE, 0, DISTANCE], [BASE_ICON_SIZE, MAGNIFICATION / 2, BASE_ICON_SIZE]),
    SPRING,
  );

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      className={cn('relative flex aspect-square items-center justify-center rounded-full shrink-0', className)}>
      <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
        {children}
      </motion.div>
    </motion.div>
  );
}
