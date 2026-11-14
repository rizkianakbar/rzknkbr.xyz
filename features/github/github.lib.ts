export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type GitHubContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type GitHubContributionsResponse = {
  total: { lastYear: number };
  contributions: GitHubContributionDay[];
};

export type ContributionWeekColumn = {
  days: GitHubContributionDay[];
};

const API_BASE = 'https://github-contributions-api.jogruber.de/v4';

/** ISR: contributions change slowly; balances freshness vs. third-party load. */
const REVALIDATE_SECONDS = 3600;

const FETCH_TIMEOUT_MS = 12_000;

/** Use with `revalidateTag()` if you add a webhook or cron to refresh sooner than ISR. */
export const GITHUB_CONTRIBUTIONS_CACHE_TAG = 'github-contributions' as const;

function isContributionDay(value: unknown): value is GitHubContributionDay {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  const { date, count, level } = row;
  return (
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    typeof count === 'number' &&
    Number.isFinite(count) &&
    count >= 0 &&
    typeof level === 'number' &&
    level === Math.floor(level) &&
    level >= 0 &&
    level <= 4
  );
}

export function parseContributionsResponse(data: unknown): GitHubContributionsResponse | null {
  if (typeof data !== 'object' || data === null) return null;
  const body = data as Record<string, unknown>;
  const total = body.total;
  if (typeof total !== 'object' || total === null) return null;
  const t = total as Record<string, unknown>;
  if (typeof t.lastYear !== 'number' || !Number.isFinite(t.lastYear) || t.lastYear < 0) return null;
  if (!Array.isArray(body.contributions)) return null;
  if (!body.contributions.every(isContributionDay)) return null;

  return {
    total: { lastYear: Math.floor(t.lastYear) },
    contributions: body.contributions as GitHubContributionDay[],
  };
}

function logFetchFailure(message: string, detail?: unknown): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (detail !== undefined) {
    console.warn(`[github-contributions] ${message}`, detail);
    return;
  }
  console.warn(`[github-contributions] ${message}`);
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeekSunday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function endOfWeekSaturday(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + (6 - x.getDay()));
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

export function buildContributionGrid(contributions: GitHubContributionDay[]): ContributionWeekColumn[] {
  if (contributions.length === 0) return [];

  const map = new Map<string, GitHubContributionDay>();
  for (const c of contributions) {
    map.set(c.date, c);
  }

  const first = parseDate(contributions[0].date);
  const last = parseDate(contributions[contributions.length - 1].date);
  const gridStart = startOfWeekSunday(first);
  const gridEnd = endOfWeekSaturday(last);

  const days: GitHubContributionDay[] = [];
  for (let cur = new Date(gridStart); cur <= gridEnd; cur = addDays(cur, 1)) {
    const key = toDateKey(cur);
    const row = map.get(key);
    days.push({
      date: key,
      count: row?.count ?? 0,
      level: (row?.level ?? 0) as ContributionLevel,
    });
  }

  const weeks: ContributionWeekColumn[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push({ days: days.slice(i, i + 7) });
  }
  return weeks;
}

export type MonthLabel = {
  label: string;
  leftPercent: number;
};

export function monthLabelsForWeeks(weeks: ContributionWeekColumn[]): MonthLabel[] {
  if (weeks.length === 0) return [];

  const labels: MonthLabel[] = [];
  let prevMonth = -1;
  const denom = Math.max(weeks.length - 1, 1);

  for (let w = 0; w < weeks.length; w++) {
    const weekStart = parseDate(weeks[w].days[0].date);
    const wed = addDays(weekStart, 3);
    const m = wed.getMonth();
    if (m !== prevMonth) {
      labels.push({
        label: wed.toLocaleDateString('en-US', { month: 'short' }),
        leftPercent: (w / denom) * 100,
      });
      prevMonth = m;
    }
  }

  return labels;
}

export async function fetchGitHubContributions(username: string): Promise<GitHubContributionsResponse | null> {
  const trimmed = username.trim();
  if (!trimmed) {
    logFetchFailure('empty username');
    return null;
  }

  const url = `${API_BASE}/${encodeURIComponent(trimmed)}?y=last`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [GITHUB_CONTRIBUTIONS_CACHE_TAG, `${GITHUB_CONTRIBUTIONS_CACHE_TAG}:${trimmed.toLowerCase()}`],
      },
      headers: {
        Accept: 'application/json',
        'User-Agent': 'rzknkbr.xyz/1.0 (personal site; contributions display)',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      logFetchFailure(`HTTP ${res.status}`, url);
      return null;
    }

    const raw: unknown = await res.json();
    const parsed = parseContributionsResponse(raw);
    if (!parsed) {
      logFetchFailure('invalid response shape', raw);
      return null;
    }

    return parsed;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'TimeoutError';
    logFetchFailure(isAbort ? `timeout after ${FETCH_TIMEOUT_MS}ms` : 'request failed', err);
    return null;
  }
}

export function formatContributionTooltip(count: number, isoDate: string): string {
  const formatted = parseDate(isoDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  if (count === 0) return `No contributions on ${formatted}.`;
  return `${count} contribution${count === 1 ? '' : 's'} on ${formatted}.`;
}
