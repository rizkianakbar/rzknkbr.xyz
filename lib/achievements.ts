export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  secret?: boolean;
}

export const ACHIEVEMENTS = [
  { id: 'press-start', title: 'Player 2 has joined', description: 'Pressed start.', emoji: '🎮', xp: 25 },
  { id: 'poke', title: 'Stop poking me', description: 'Clicked the letters of my name 10 times.', emoji: '👉', xp: 30 },
  { id: 'card-flip', title: 'Read the fine print', description: 'Flipped the player card.', emoji: '🃏', xp: 25 },
  { id: 'quest-reader', title: 'Lore hunter', description: 'Opened 3 quests in the quest log.', emoji: '📜', xp: 40 },
  { id: 'all-quests', title: 'Lore master', description: 'Opened every quest.', emoji: '📚', xp: 60 },
  { id: 'loot', title: 'Loot inspector', description: 'Opened a project.', emoji: '💎', xp: 30 },
  { id: 'composer', title: 'Composer', description: 'Played 12 notes on the skill xylophone.', emoji: '🎹', xp: 50 },
  { id: 'trophy-room', title: 'Trophy polisher', description: 'Clicked every trophy.', emoji: '🏆', xp: 40 },
  { id: 'explorer', title: 'Cartographer', description: 'Visited every section.', emoji: '🗺️', xp: 60 },
  {
    id: 'speedrun',
    title: 'Speedrunner',
    description: 'Reached the final boss in under 25 seconds.',
    emoji: '⚡',
    xp: 50,
  },
  { id: 'clicker', title: 'Click addict', description: 'Clicked 75 times.', emoji: '🖱️', xp: 40 },
  { id: 'cv', title: 'Took the scroll', description: 'Opened my resume.', emoji: '🧾', xp: 50 },
  { id: 'party-invite', title: 'Party invite sent', description: 'Copied my email.', emoji: '💌', xp: 75 },
  {
    id: 'konami',
    title: 'Cheat code',
    description: '↑ ↑ ↓ ↓ ← → ← → B A',
    emoji: '🕹️',
    xp: 100,
    secret: true,
  },
] as const satisfies readonly Achievement[];

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];

export const LEVELS = [
  { xp: 0, title: 'Visitor' },
  { xp: 40, title: 'Wanderer' },
  { xp: 120, title: 'Explorer' },
  { xp: 240, title: 'Adventurer' },
  { xp: 400, title: 'Veteran' },
  { xp: 600, title: 'Champion' },
  { xp: 850, title: 'Legend' },
] as const;

export function levelFor(xp: number): { level: number; title: string; current: number; next: number | null } {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  return {
    level: i + 1,
    title: LEVELS[i].title,
    current: LEVELS[i].xp,
    next: i + 1 < LEVELS.length ? LEVELS[i + 1].xp : null,
  };
}

export const SECTIONS = ['hero', 'trophies', 'story', 'github', 'quests', 'loot', 'skills', 'contact'] as const;
