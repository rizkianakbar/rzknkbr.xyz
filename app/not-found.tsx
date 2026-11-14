import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-game-pink">Error 404</p>
      <h1 className="font-pixel text-5xl sm:text-6xl">Game over?</h1>
      <p className="text-muted-foreground text-balance">
        This level doesn&apos;t exist, or it was moved. Your progress is safe.
      </p>
      <Link
        href="/"
        className="lift mt-2 rounded-2xl bg-game-accent px-5 py-3 font-semibold text-game-accent-foreground shadow-[0_6px_0_0_color-mix(in_oklab,var(--game-accent)_55%,black)] active:shadow-none">
        ▶ Continue from start
      </Link>
    </main>
  );
}
