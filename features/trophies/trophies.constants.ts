import type { Sprite } from '@/lib/pixel-art';
import type { resumeData } from '@/lib/resume';

const NEWSPAPER: Sprite = [
  '................',
  '.kkkkkkkkkkkk...',
  '.kWWWWWWWWWWk...',
  '.kWppppWWggWkk..',
  '.kWppppWWggWkWk.',
  '.kWWWWWWWWWWkWk.',
  '.kWggggggggWkWk.',
  '.kWWWWWWWWWWkWk.',
  '.kWggggWggggkWk.',
  '.kWWWWWWWWWWkWk.',
  '.kWggggWggggkWk.',
  '.kWWWWWWWWWWkWk.',
  '.kWggggWggggkWk.',
  '.kWWWWWWWWWWkWk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

const TARGET: Sprite = [
  '.............aa.',
  '.............aaa',
  '....kkkkkk..y.a.',
  '..kkppppppkky...',
  '.kpppWWWWppyk...',
  '.kpWWWppWWypk...',
  'kppWpppppyWppk..',
  'kpWWpWWWypWWpk..',
  'kpWppWpyWppWpk..',
  'kpWppWppWppWpk..',
  'kpWWpWWWWpWWpk..',
  'kppWppppppWppk..',
  '.kpWWWppWWWpk...',
  '.kpppWWWWpppk...',
  '..kkppppppkk....',
  '....kkkkkk......',
];

const COINS: Sprite = [
  '................',
  '.........kkkk...',
  '........kyyyyk..',
  '........kywwyk..',
  '........kyyyyk..',
  '.........kkkk...',
  '...kkkkkkkk.....',
  '..kyyyyyyyyk....',
  '..kkyyyyyykk....',
  '..kYYYYYYYYk....',
  '..kkyyyyyykk....',
  '..kYYYYYYYYk....',
  '..kkyyyyyykk....',
  '..kYYYYYYYYk....',
  '...kkkkkkkk.....',
  '................',
];

const CREATURE: Sprite = [
  '................',
  '......kkkk......',
  '....kkvvvvkk....',
  '...kvvvvvvvvk...',
  '..kvvwvvvvvvvk..',
  '..kvvvvvvvvvvk..',
  '.kvvwwvvvvwwvvk.',
  '.kvvwkvvvvwkvvk.',
  '.kvvvvvvvvvvvvk.',
  '.kvppvvvvvvppvk.',
  '.kvvvvkkkkvvvvk.',
  '.kvvvvvvvvvvvvk.',
  '.kVvvvvvvvvvvVk.',
  '.kvkvvkvvkvvkvk.',
  '.kk.kk.kk.kk.kk.',
  '................',
];

const CUP: Sprite = [
  '................',
  '..kkkkkkkkkkkk..',
  'kkkwyyyyyyyyYkkk',
  'k.kwyyyyyyyyYk.k',
  'k.kwyyyyyyyyYk.k',
  'kkkkwyyyyyyYkkkk',
  '...kwyyyyyyYk...',
  '....kwyyyyYk....',
  '.....kyyyYk.....',
  '......kyYk......',
  '......kyYk......',
  '.....kkyYkk.....',
  '....kyyyyyYk....',
  '...kyyyyyyyYk...',
  '...kkkkkkkkkk...',
  '................',
];

const FLASK: Sprite = [
  '................',
  '.....kkkkkk.....',
  '......kGGk......',
  '......kGGk......',
  '......kGGk......',
  '.....kGGGGk.....',
  '....kGGGGGGk....',
  '...kGGGGGGGGk...',
  '..kcccccwcccck..',
  '.kcccwcccccccck.',
  '.kccccccccwccck.',
  '.kcwcccccccccck.',
  '.kcccccccccccck.',
  '..kCCCCCCCCCCk..',
  '...kkkkkkkkkk...',
  '................',
];

type TrophyId = (typeof resumeData.trophies)[number]['id'];

export type Tone = 'accent' | 'pink' | 'amber' | 'violet' | 'cyan';

/**
 * Bento layout: `hero` spans two rows and gets the traffic chart, `wide` is a half-width row,
 * `small` a third. Order follows resumeData.trophies.
 */
export const TROPHY_ART: Record<TrophyId, { sprite: Sprite; tone: Tone; size: 'hero' | 'wide' | 'small' }> = {
  readers: { sprite: NEWSPAPER, tone: 'accent', size: 'hero' },
  campaigns: { sprite: TARGET, tone: 'pink', size: 'wide' },
  revenue: { sprite: COINS, tone: 'amber', size: 'wide' },
  nfts: { sprite: CREATURE, tone: 'violet', size: 'small' },
  award: { sprite: CUP, tone: 'cyan', size: 'small' },
  tests: { sprite: FLASK, tone: 'accent', size: 'small' },
};

/** Bar heights (0..1) for the hero tile's decorative chart. Illustrative shape only, not real analytics data. */
export const TRAFFIC = [0.18, 0.22, 0.2, 0.3, 0.34, 0.31, 0.45, 0.52, 0.48, 0.63, 0.7, 0.66, 0.82, 1];
