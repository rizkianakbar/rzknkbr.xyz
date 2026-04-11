'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle(props: ModeToggleProps): JSX.Element {
  const { className } = props;

  const { theme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="link"
      size="icon"
      className={cn(className)}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <SunIcon className="h-full w-full" />

      <MoonIcon className="hidden h-full w-full" />
    </Button>
  );
}
