'use client';

import { motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  buildContributionGrid,
  type ContributionLevel,
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

type GithubGraphProps = {
  data: GitHubContributionsResponse;
  profileUrl: string;
};

export function GithubGraph(props: GithubGraphProps) {
  const { data, profileUrl } = props;

  const weeks = buildContributionGrid(data.contributions);
  const monthLabels = monthLabelsForWeeks(weeks);
  const total = data.total.lastYear;

  return (
    <div className="relative w-full rounded-3xl border border-border bg-card/80 backdrop-blur p-4 sm:p-6">
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

      <div className="w-full">
        <div className="flex gap-1 w-full">
          {weeks.map((week, wi) => (
            <motion.div
              key={week.days[0]?.date ?? wi}
              data-reveal
              className="flex flex-col gap-1 flex-1"
              initial={{ opacity: 0, y: 14, scale: 0.6 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 400, damping: 18, delay: wi * 0.012 }}>
              {week.days.map((day) => (
                <Tooltip key={day.date}>
                  <TooltipTrigger asChild>
                    <div
                      data-sfx="none"
                      onPointerDown={() => playNote(day.level * 2 + (wi % 3), 'sine')}
                      className={cn(
                        'aspect-square w-full rounded-[2px] cursor-pointer transition-transform hover:scale-150 hover:z-10 relative',
                        LEVEL_CLASS[day.level],
                      )}
                    />
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    sideOffset={-5}
                    className="pointer-events-none max-w-[min(100vw-2rem,20rem)] text-center">
                    {formatContributionTooltip(day.count, day.date)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-3 text-xs text-muted-foreground">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors">
          {total.toLocaleString()} contributions in the last year
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
