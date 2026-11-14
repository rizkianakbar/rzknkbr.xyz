'use client';

import { GameProvider } from '@/components/game/game-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <GameProvider>
      <TooltipProvider delayDuration={0} skipDelayDuration={0} disableHoverableContent>
        {children}
      </TooltipProvider>
    </GameProvider>
  );
}
