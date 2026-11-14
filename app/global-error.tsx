'use client';

import { useEffect } from 'react';

import './globals.css';

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
};

/** Last-resort screen when the root layout itself crashes. It replaces the layout, so it brings its own html/body. */
export default function GlobalErrorPage(props: GlobalErrorPageProps) {
  const { error } = props;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">The game crashed. A reload usually fixes it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-game-accent px-5 py-3 font-semibold text-game-accent-foreground">
          Reload
        </button>
      </body>
    </html>
  );
}
