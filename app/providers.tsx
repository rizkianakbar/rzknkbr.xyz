'use client';

import { GameProvider } from '@/features/game/game-provider';
import { SmoothScroll } from '@/features/scroll/smooth-scroll';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers(props: ProvidersProps) {
  return (
    <GameProvider>
      <SmoothScroll>{props.children}</SmoothScroll>
    </GameProvider>
  );
}
