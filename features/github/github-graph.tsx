'use client';

import { motion, type Variants } from 'motion/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildContributionGrid,
  type ContributionLevel,
  type ContributionWeekColumn,
  formatContributionTooltip,
  type GitHubContributionsResponse,
  monthLabelsForWeeks,
} from '@/features/github/github.lib';
import { playNote } from '@/features/sound/sound.lib';
import { cn } from '@/lib/utils';

/** GitHub's dark-mode greens, darkest (no contributions) to brightest. */
const LEVEL_CLASS: Record<ContributionLevel, string> = {
  0: 'bg-[#161616]',
  1: 'bg-green-900',
  2: 'bg-green-700',
  3: 'bg-green-500',
  4: 'bg-green-300',
};

const LEGEND_LEVELS: ContributionLevel[] = [0, 1, 2, 3, 4];

/** One observer on the grid staggers all 53 columns in, instead of one observer per column. */
const GRID_VARIANTS: Variants = { show: { transition: { staggerChildren: 0.012 } } };
const COLUMN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.6 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 18 } },
};

type Hover = { text: string; left: number; top: number };

type GithubGraphProps = {
  data: GitHubContributionsResponse;
  profileUrl: string;
};

/**
 * Contribution graph with a single shared tooltip. Hover and click are delegated from the grid,
 * so 371 cells need no handlers or tooltip components of their own, and moving between cells
 * re-renders only the label (the grid is memoized).
 */
export function GithubGraph(props: GithubGraphProps) {
  const { data, profileUrl } = props;
  const weeks = useMemo(() => buildContributionGrid(data.contributions), [data.contributions]);
  const monthLabels = useMemo(() => monthLabelsForWeeks(weeks), [weeks]);
  const [hover, setHover] = useState<Hover | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // On phones the year scrolls sideways; start at the most recent weeks, like GitHub does.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const cellFrom = (target: EventTarget) =>
    target instanceof HTMLElement ? target.closest<HTMLElement>('[data-date]') : null;

  const onPointerOver = (e: React.PointerEvent) => {
    const cell = cellFrom(e.target);
    const frame = frameRef.current;
    if (!cell || !frame) return;
    const box = cell.getBoundingClientRect();
    const origin = frame.getBoundingClientRect();
    setHover({
      text: formatContributionTooltip(Number(cell.dataset.count), cell.dataset.date ?? ''),
      left: box.left - origin.left + box.width / 2,
      top: box.top - origin.top,
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const cell = cellFrom(e.target);
    if (cell) playNote(Number(cell.dataset.level) * 2 + (Number(cell.dataset.week) % 3), 'sine');
  };

  return (
    <div
      ref={frameRef}
      className="relative w-full rounded-3xl border border-border bg-card/80 backdrop-blur p-4 sm:p-6">
      {/* Phones get a scrollable year at a readable cell size instead of 53 squeezed columns. */}
      <div
        ref={scrollRef}
        onScroll={() => setHover(null)}
        className="-mx-4 overflow-x-auto overscroll-x-contain px-4 py-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:py-0">
        <div className="min-w-176 sm:min-w-0">
          <div className="relative text-xs text-muted-foreground mb-2 h-4 w-full">
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.leftPercent}`}
                className="absolute whitespace-nowrap"
                style={{ left: `${m.leftPercent}%` }}>
                {m.label}
              </span>
            ))}
          </div>

          <div
            data-sfx="none"
            onPointerOver={onPointerOver}
            onPointerLeave={() => setHover(null)}
            onPointerDown={onPointerDown}>
            <GraphGrid weeks={weeks} />
          </div>
        </div>
      </div>

      {hover && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap rounded-lg border-2 border-game-accent bg-card px-2 py-1 text-xs shadow-xl"
          style={{ left: hover.left, top: hover.top }}>
          {hover.text}
        </span>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-3 text-xs text-muted-foreground">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors">
          {data.total.lastYear.toLocaleString()} contributions in the last year
        </a>

        <div className="flex items-center gap-2 shrink-0">
          <span>Less</span>
          <div className="flex gap-1">
            {LEGEND_LEVELS.map((lv) => (
              <div key={lv} className={cn('w-3 h-3 rounded-[1px]', LEVEL_CLASS[lv])} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

type GraphGridProps = {
  weeks: ContributionWeekColumn[];
};

const GraphGrid = memo(function GraphGrid(props: GraphGridProps) {
  return (
    <motion.div
      className="flex gap-1 w-full"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={GRID_VARIANTS}>
      {props.weeks.map((week, wi) => (
        <motion.div
          key={week.days[0]?.date ?? wi}
          data-reveal
          className="flex flex-col gap-1 flex-1"
          variants={COLUMN_VARIANTS}>
          {week.days.map((day) => (
            <div
              key={day.date}
              data-date={day.date}
              data-count={day.count}
              data-level={day.level}
              data-week={wi}
              className={cn(
                'relative aspect-square w-full rounded-[2px] cursor-pointer transition-transform hover:z-10 hover:scale-150',
                LEVEL_CLASS[day.level],
              )}
            />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
});
