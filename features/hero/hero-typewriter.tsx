'use client';

import { useEffect, useState } from 'react';

type HeroTypewriterProps = {
  words: readonly string[];
  active: boolean;
};

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1900;

/** Types each word, holds it, deletes it, then moves to the next. Screen readers get the first word only. */
export function HeroTypewriter(props: HeroTypewriterProps) {
  const { words, active } = props;
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[index % words.length];

  useEffect(() => {
    if (!active) return;
    if (deleting && length === 0) {
      setDeleting(false);
      setIndex((i) => i + 1);
      return;
    }
    const timer = deleting
      ? window.setTimeout(() => setLength((l) => l - 1), DELETE_MS)
      : length < word.length
        ? window.setTimeout(() => setLength((l) => l + 1), TYPE_MS)
        : window.setTimeout(() => setDeleting(true), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [active, deleting, length, word]);

  return (
    <span>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden>
        <span className="text-muted-foreground">class: </span>
        <span className="bg-linear-to-r from-game-accent-text via-game-cyan to-game-pink bg-clip-text text-transparent">
          {word.slice(0, length)}
        </span>
        <span className="inline-block w-0.75 h-[1em] -mb-[0.15em] ml-1 bg-game-accent animate-pulse" />
      </span>
    </span>
  );
}
