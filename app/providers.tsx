'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <TooltipProvider delayDuration={0} skipDelayDuration={0} disableHoverableContent>
        {children}
      </TooltipProvider>
    </NextThemesProvider>
  );
}
