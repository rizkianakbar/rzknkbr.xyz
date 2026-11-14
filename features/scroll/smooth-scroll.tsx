'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect } from 'react';
import { useGameState } from '@/features/game/game-provider';

import 'lenis/dist/lenis.css';

/** Clears the fixed HUD when jumping to an in-page anchor (#quests, #contact…). */
const ANCHOR_OFFSET = -96;

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Inertial page scrolling (Lenis). It drives the native window scroll, so scroll events, sticky/fixed
 * elements and Motion's in-view triggers keep working. Off for reduced-motion users; touch keeps native
 * scrolling. Scrollable panels opt out with `data-lenis-prevent`.
 */
export function SmoothScroll(props: SmoothScrollProps) {
  const reduce = useReducedMotion();
  if (reduce) return props.children;

  return (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: ANCHOR_OFFSET } }}>
      <PauseUntilStarted />
      {props.children}
    </ReactLenis>
  );
}

/** The start screen locks the page; Lenis scrolls programmatically, so it must be paused explicitly. */
function PauseUntilStarted() {
  const lenis = useLenis();
  const { started } = useGameState();

  useEffect(() => {
    if (!lenis) return;
    if (started) lenis.start();
    else lenis.stop();
  }, [lenis, started]);

  return null;
}
