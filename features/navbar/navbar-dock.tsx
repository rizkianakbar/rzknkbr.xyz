'use client';

import { type MotionValue, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const MAGNIFICATION = 60;
const DISTANCE = 100;
const BASE_SIZE = 40;
const BASE_ICON_SIZE = 20;
const SPRING = { mass: 0.1, stiffness: 150, damping: 14 };
const AWAY = Number.POSITIVE_INFINITY;

/** Mouse x in viewport coordinates, or Infinity when the mouse is outside the dock. */
const DockMouseContext = createContext<MotionValue<number> | null>(null);

type NavbarDockProps = {
  className?: string;
  children: ReactNode;
};

/** macOS-style dock: icons grow as the mouse gets closer. */
export function NavbarDock(props: NavbarDockProps) {
  const { className, children } = props;
  const mouseX = useMotionValue(AWAY);

  return (
    <DockMouseContext.Provider value={mouseX}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(AWAY)}
        className={cn('mx-auto w-max h-full flex items-end justify-center overflow-visible', className)}>
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

  /*
   * Measure each icon's centre once, at rest, and on resize. Measuring live on every mouse move made
   * a feedback loop: growing an icon moves it (and its neighbours), which changes the measured
   * distance, which changes the size again… and the dock shook when the mouse moved slowly.
   */
  const restCenter = useRef(AWAY);
  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el || mouseX.get() !== AWAY) return; // only trust measurements taken at rest
      const rect = el.getBoundingClientRect();
      restCenter.current = rect.left + rect.width / 2;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mouseX]);

  // Guard Infinity - Infinity (mouse away, icon not measured yet), which would be NaN.
  const distance = useTransform(mouseX, (x) => (x === AWAY ? AWAY : x - restCenter.current));
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
      className={cn('relative flex aspect-square items-center justify-center shrink-0', className)}>
      <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
        {children}
      </motion.div>
    </motion.div>
  );
}
