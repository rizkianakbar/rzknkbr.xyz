type Achievement = {
  id: string;
  title: string;
  description: string;
  /** Shown while locked: a nudge, never the answer. */
  hint: string;
  emoji: string;
  xp: number;
  secret?: boolean;
};

export const ACHIEVEMENTS = [
  {
    id: 'press-start',
    title: 'Player 2 has joined',
    description: 'Pressed start.',
    hint: 'Every game begins somewhere.',
    emoji: '🎮',
    xp: 25,
  },
  {
    id: 'poke',
    title: 'Stop poking me',
    description: 'Clicked the letters of my name 10 times.',
    hint: 'Names are for poking. Repeatedly.',
    emoji: '👉',
    xp: 30,
  },
  {
    id: 'card-flip',
    title: 'Read the fine print',
    description: 'Flipped the player card.',
    hint: 'Every card has two sides.',
    emoji: '🃏',
    xp: 25,
  },
  {
    id: 'quest-reader',
    title: 'Lore hunter',
    description: 'Opened 3 quests in the quest log.',
    hint: 'Lore hides in the quest log.',
    emoji: '📜',
    xp: 40,
  },
  {
    id: 'all-quests',
    title: 'Lore master',
    description: 'Opened every quest.',
    hint: 'Leave no lore unread.',
    emoji: '📚',
    xp: 60,
  },
  {
    id: 'loot',
    title: 'Loot inspector',
    description: 'Opened a loot chest.',
    hint: 'Loot is meant to be opened.',
    emoji: '💎',
    xp: 30,
  },
  {
    id: 'all-loot',
    title: 'Treasure hunter',
    description: 'Opened every loot chest.',
    hint: 'Six chests. No key required.',
    emoji: '🗝️',
    xp: 40,
  },
  {
    id: 'composer',
    title: 'Composer',
    description: 'Played 12 notes on the skill xylophone.',
    hint: 'Some skills are more musical than others.',
    emoji: '🎹',
    xp: 50,
  },
  {
    id: 'party-chat',
    title: 'Heard them out',
    description: 'Talked to every party member.',
    hint: 'The party has things to say about me.',
    emoji: '💬',
    xp: 40,
  },
  {
    id: 'trophy-room',
    title: 'Trophy polisher',
    description: 'Clicked every trophy.',
    hint: 'Trophies love attention.',
    emoji: '🏆',
    xp: 40,
  },
  {
    id: 'explorer',
    title: 'Cartographer',
    description: 'Visited every section.',
    hint: 'Leave no section unseen.',
    emoji: '🗺️',
    xp: 60,
  },
  {
    id: 'speedrun',
    title: 'Speedrunner',
    description: 'Reached the final boss in under 25 seconds.',
    hint: 'The final boss rewards quick feet.',
    emoji: '⚡',
    xp: 50,
  },
  {
    id: 'clicker',
    title: 'Click addict',
    description: 'Clicked 75 times.',
    hint: 'Click. Click. Click…',
    emoji: '🖱️',
    xp: 40,
  },
  {
    id: 'cv',
    title: 'Took the scroll',
    description: 'Opened my resume.',
    hint: 'Every hero carries a scroll.',
    emoji: '🧾',
    xp: 50,
  },
  {
    id: 'party-invite',
    title: 'Party invite sent',
    description: 'Copied my email.',
    hint: 'The final boss wants to hear from you.',
    emoji: '💌',
    xp: 75,
  },
  {
    id: 'konami',
    title: 'Cheat code',
    description: '↑ ↑ ↓ ↓ ← → ← → B A',
    hint: 'Some say it involves arrows.',
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
  { xp: 950, title: 'Legend' },
] as const;

export const MAX_LEVEL = LEVELS.length;

/** Every element with `data-section` must use one of these keys. */
export const SECTIONS = [
  'hero',
  'trophies',
  'story',
  'github',
  'quests',
  'loot',
  'skills',
  'testimonials',
  'contact',
] as const;

/** Small, one-time XP for looking around. */
export const XP_REWARD = { section: 10, quest: 15, trophy: 5, testimonial: 10 } as const;

/** Thresholds behind the counting achievements; keep in sync with their descriptions. */
export const GOALS = { clicks: 75, pokes: 10, notes: 12, questsRead: 3, speedrunMs: 25_000 } as const;

/** Fired on window by anything that wants the quest board open (the HUD listens). */
export const OPEN_BOARD_EVENT = 'rzk:open-board';

export const STORAGE_KEYS = {
  progress: 'rzk-game-v1',
  started: 'rzk-started',
  coachSeen: 'rzk-coach-seen',
  boardSeen: 'rzk-board-seen',
} as const;
