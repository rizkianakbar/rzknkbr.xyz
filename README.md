# rzknkbr.xyz

My personal website, built as a game. Press start, earn XP, unlock achievements, crack open loot chests and beat the final boss. Under the hood it's a résumé: experience, projects and contact details, all readable by search engines and screen readers.

**Live:** [rzknkbr.xyz](https://rzknkbr.xyz)

## What's inside

| Section | What it does |
| --- | --- |
| **Start screen** | "Press start" boot screen. It also unlocks audio, which browsers only allow after a click. |
| **Hero** | Name letters that drop in, jump and play notes when poked. A holographic, flippable player card. |
| **Trophy room** | Bento grid of real numbers with pixel-art sprites and count-up animations. |
| **Daily grind** | GitHub contribution graph, fetched on the server and refreshed hourly. |
| **Quest log** | Work experience as quests that award XP when opened. |
| **Loot** | Projects sealed in chests by rarity. Opening one reveals an RPG item card. |
| **Side quests** | Open-source and personal projects pinned to a quest board. |
| **Skill tree** | Branching tree where every node is a note you can light up. |
| **Final boss** | The contact section as a boss fight: every way to reach me is an attack. |

Across the whole site:
- XP, 7 ranks and 15 achievements, with a quest board of clues
- Synthesized sound effects and an interactive dot-field background
- A game-style hotbar dock (keys 1–6) and smooth scrolling
- A Konami-code easter egg

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) and **React 19**
- **[Tailwind CSS 4](https://tailwindcss.com)** for styling, dark theme only
- **[Motion](https://motion.dev)** for animation and **[Lenis](https://lenis.darkroom.engineering)** for smooth scrolling
- **Web Audio API**: every sound is synthesized at runtime, so there are no audio files
- **Canvas 2D** for the background, particles and confetti
- **[Biome](https://biomejs.dev)** for lint and formatting, **[Vitest](https://vitest.dev)** for tests, **[Bun](https://bun.sh)** as package manager

## Getting started

```bash
bun install
bun dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `bun dev` | Development server |
| `bun run build` / `bun start` | Production build / serve it |
| `bun run lint` | Biome plus the Tailwind class check (see below) |
| `bun run lint:fix` | Auto-fix both |
| `bun run typecheck` | TypeScript, no emit |
| `bun run test` | Unit tests |
| `bun run commit` | Conventional commit via Commitizen |

Husky runs lint-staged on commit and enforces [Conventional Commits](https://www.conventionalcommits.org) messages, 88 characters max.

## Editing content

Almost everything you read on the site lives in **`lib/resume.tsx`**: bio, work, education, projects, side quests, skills, trophies and links. Edit it there; the components only render it.

| To change… | Edit |
| --- | --- |
| Achievements, clues, XP rewards, rank thresholds | `features/game/game.constants.ts` |
| Pixel-art sprites (trophies, chests, boss) | the `*.constants.ts` file of that feature; each sprite is 16 strings of 16 characters |
| Boss-fight moves and dialogue | `features/contact/contact-battle.tsx` and `contact.constants.ts` |
| Resume PDF | `public/Rizkian_Akbar_Resume.pdf` |

Tests check that the content stays valid. Run `bun run test` after editing; it will catch:
- a malformed sprite
- a rank that can no longer be reached
- an achievement without a clue

## Project structure

Code is grouped by feature. File names carry their role as a dot suffix; components use kebab-case.

```
app/                  Next.js routes, kept thin: layout, page, 404, global error
features/<name>/
  <name>.tsx            the section or main component
  <name>-<part>.tsx     sub-components (e.g. loot-chest.tsx)
  <name>.lib.ts         pure logic, unit-tested
  <name>.constants.ts   data and configuration
  <name>.hooks.ts       React hooks
  <name>.test.ts        tests
components/           shared UI (Reveal, SectionHeader, Tilt, CountUp, PixelArt, icons)
lib/                  shared data and helpers (resume, pixel-art, utils)
scripts/              tooling (Tailwind class check)
public/               images, videos, resume PDF
```

Key features:
- `game`: XP, achievements, HUD, start screen, toasts
- `fx`: canvas effects
- `sound`: audio synth
- `scroll`: smooth scrolling

The rest map one-to-one to page sections.

## Engineering notes

**Zero warnings.** Lint, types, tests, the build log and the dev-mode browser console are all expected to be silent. `scripts/check-tailwind.mjs` runs the same check as the Tailwind editor extension (canonical class names, no conflicting classes), so editor warnings also fail `bun run lint`.

**Performance.**
- **Background canvas:** draws only when something changes, so an idle page costs no frames.
- **Idle loops** (bobbing, glows, shimmer) are CSS animations on transform and opacity, which run on the compositor without React.
- **Game state** is split into three contexts (actions, state, feed). Most components only read actions and never re-render from game updates.
- **GitHub graph:** one shared tooltip instead of one per cell.
- **Media:** images are served through `next/image` as AVIF/WebP. Project videos load only once their chest is opened, and pause when off-screen.

**Accessibility and resilience.**
- **Reduced motion:** visitors with `prefers-reduced-motion` get the site without bounces, loops, smooth scrolling or particles.
- **Keyboard:** everything works by keyboard. Sound can be muted and starts muted if you choose.
- **Search engines:** content is server-rendered, so crawlers and link previews see real text.
- **If JavaScript fails:** the start screen hides itself after 8 seconds instead of blocking the page.
- **Storage:** progress is saved in `localStorage`, and the site still works if storage is blocked.