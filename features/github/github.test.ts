import { describe, expect, it } from 'vitest';
import {
  buildContributionGrid,
  formatContributionTooltip,
  type GitHubContributionDay,
  monthLabelsForWeeks,
  parseContributionsResponse,
} from '@/features/github/github.lib';

function day(date: string, count = 0): GitHubContributionDay {
  return { date, count, level: count === 0 ? 0 : 1 };
}

describe('parseContributionsResponse', () => {
  it('accepts a well-formed response and floors the total', () => {
    const body = { total: { lastYear: 12.7 }, contributions: [day('2026-01-05', 3)] };
    expect(parseContributionsResponse(body)).toEqual({
      total: { lastYear: 12 },
      contributions: [day('2026-01-05', 3)],
    });
  });

  it.each([
    ['not an object', 'nope'],
    ['missing total', { contributions: [] }],
    ['negative total', { total: { lastYear: -1 }, contributions: [] }],
    ['contributions not an array', { total: { lastYear: 0 }, contributions: {} }],
    ['bad date format', { total: { lastYear: 0 }, contributions: [{ date: '5/1/2026', count: 0, level: 0 }] }],
    ['level out of range', { total: { lastYear: 0 }, contributions: [{ date: '2026-01-05', count: 0, level: 5 }] }],
    ['negative count', { total: { lastYear: 0 }, contributions: [{ date: '2026-01-05', count: -1, level: 0 }] }],
  ])('rejects %s', (_, body) => {
    expect(parseContributionsResponse(body)).toBeNull();
  });
});

describe('buildContributionGrid', () => {
  it('returns no weeks for no data', () => {
    expect(buildContributionGrid([])).toEqual([]);
  });

  it('pads to whole Sunday–Saturday weeks and fills gaps with zero days', () => {
    // 2026-01-07 is a Wednesday, 2026-01-13 a Tuesday.
    const weeks = buildContributionGrid([day('2026-01-07', 2), day('2026-01-13', 5)]);

    expect(weeks).toHaveLength(2);
    expect(weeks.every((w) => w.days.length === 7)).toBe(true);
    expect(weeks[0].days[0].date).toBe('2026-01-04'); // Sunday before the first day
    expect(weeks[1].days[6].date).toBe('2026-01-17'); // Saturday after the last day
    expect(weeks[0].days[3]).toEqual(day('2026-01-07', 2));
    expect(weeks[0].days[4]).toEqual(day('2026-01-08')); // missing from the API → zero
    expect(weeks[1].days[2].count).toBe(5);
  });
});

describe('monthLabelsForWeeks', () => {
  it('labels each month once, positioned across the graph', () => {
    const weeks = buildContributionGrid([day('2026-01-04'), day('2026-03-28')]);
    const labels = monthLabelsForWeeks(weeks);

    expect(labels.map((l) => l.label)).toEqual(['Jan', 'Feb', 'Mar']);
    expect(labels[0].leftPercent).toBe(0);
    expect(labels[1].leftPercent).toBeGreaterThan(labels[0].leftPercent);
    expect(labels[2].leftPercent).toBeLessThanOrEqual(100);
  });
});

describe('formatContributionTooltip', () => {
  it('handles zero, one and many', () => {
    expect(formatContributionTooltip(0, '2026-01-07')).toBe('No contributions on Wednesday, January 7, 2026.');
    expect(formatContributionTooltip(1, '2026-01-07')).toBe('1 contribution on Wednesday, January 7, 2026.');
    expect(formatContributionTooltip(4, '2026-01-07')).toBe('4 contributions on Wednesday, January 7, 2026.');
  });
});
