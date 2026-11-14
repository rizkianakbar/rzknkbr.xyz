'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { GameProvider } from '@/features/game/game-provider';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers(props: ProvidersProps) {
  return (
    <GameProvider>
      <TooltipProvider delayDuration={0} skipDelayDuration={0} disableHoverableContent>
        {props.children}
      </TooltipProvider>
    </GameProvider>
  );
}
