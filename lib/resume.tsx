import { FileText, HomeIcon } from 'lucide-react';
import { Docker } from '@/components/icons/docker';
import { DrizzleORM } from '@/components/icons/drizzle';
import { Expo } from '@/components/icons/expo';
import { Golang } from '@/components/icons/golang';
import { GraphQL } from '@/components/icons/graphql';
import { Icons } from '@/components/icons/icons';
import { Java } from '@/components/icons/java';
import { JavaScript } from '@/components/icons/javascript';
import { NextjsIconDark } from '@/components/icons/nextjs';
import { Nodejs } from '@/components/icons/nodejs';
import { Postgresql } from '@/components/icons/postgresql';
import { Prisma } from '@/components/icons/prisma';
import { ReactLight } from '@/components/icons/react';
import { Solidity } from '@/components/icons/solidity';
import { TailwindCSS } from '@/components/icons/tailwindcss';
import { Typescript } from '@/components/icons/typescript';

type Rarity = 'legendary' | 'epic' | 'rare';
type QuestStatus = 'done' | 'active';
type LootTone = 'red' | 'yellow' | 'purple';

export const resumeData = {
  name: 'Rizkian Akbar',
  /**
   * Other names people search for: full legal name, nickname and handles. Used in metadata and structured
   * data; the visible intro in `summary` names them too, since Google ranks on what the page shows.
   */
  alternateNames: ['Rizkian Akbar Juniansyah', 'Kian', 'rizkianakbar', 'rzknkbr'],
  // Canonical host: the apex domain redirects to www, so every absolute URL must use www.
  url: 'https://www.rzknkbr.xyz',
  location: 'Bandung, Indonesia',
  locationLink: 'https://www.google.com/maps/place/bandung',
  availability: 'Open to remote & relocation',
  title: 'Senior Product Engineer',
  roles: ['Senior Product Engineer', 'Full-stack builder', 'Web3 tinkerer', 'Sole engineer, award-winning app'],
  description:
    'Product engineer with 6+ years shipping production systems across banking, media, esports and Web3. I take products from idea to deployed, end to end.',
  summary: [
    "Hi, I'm Rizkian Akbar Juniansyah: Kian to friends, rizkianakbar on GitHub and LinkedIn. I'm a software engineer from Bandung who started in frontend and now builds full-stack and Web3 products end to end.",
    'It started in 2019 with a KEB Hana Bank scholarship. I was picked from nearly 3,000 applicants for an intensive coding bootcamp, and that was the spark.',
    'Since then I have shipped banking tools, test automation, an esports platform, Web3 products and a national news site. I joined Avocado DAO as a frontend engineer and grew into owning products end to end: backend, smart contracts, design and deployment. I also became the code-review quality gate for the whole product team.',
    'When the company restructured in 2025, the founder kept two engineers out of about 50 staff. I was one of them.',
  ],
  avatarUrl: '/me.png',
  cvUrl: '/Rizkian_Akbar_Resume.pdf',
  githubUsername: 'rizkianakbar',

  /** Player-card stats, out of 100. Pure vibes, lovingly calibrated. */
  stats: [
    { label: 'Frontend', value: 96 },
    { label: 'Backend', value: 84 },
    { label: 'Web3', value: 88 },
    { label: 'Design', value: 74 },
    { label: 'Shipping', value: 99 },
  ],
  specialMoves: [
    { name: 'Solo Raid', text: 'Sole engineer across three KBR products: design, code, servers, deploys.' },
    { name: 'Quality Gate', text: 'Reviewed 20+ PRs a week across frontend, backend and Solidity.' },
    { name: 'Last One Standing', text: 'One of 2 engineers kept out of ~50 staff after a restructure.' },
  ],

  trophies: [
    {
      id: 'readers',
      value: 800,
      suffix: 'K',
      label: 'monthly readers',
      detail: 'KBR ID national news site',
    },
    {
      id: 'campaigns',
      value: 703,
      suffix: '',
      label: 'gamified campaigns',
      detail: 'run by 300 Web3 communities on Stiqy',
    },
    {
      id: 'revenue',
      value: 156,
      prefix: '$',
      suffix: 'K',
      label: 'billed',
      detail: 'Stripe + on-chain stablecoin billing',
    },
    {
      id: 'nfts',
      value: 4983,
      suffix: '',
      label: 'NFTs on Base',
      detail: 'Bumpies, held by 1,200+ wallets',
    },
    {
      id: 'award',
      value: 2024,
      suffix: '',
      label: 'WAN-IFRA award',
      detail: 'Best Innovative Digital Product, Asia',
      plain: true,
    },
    {
      id: 'tests',
      value: 131,
      suffix: '',
      label: 'contract tests',
      detail: '99% line coverage on Whitzard',
    },
  ],

  skillGroups: [
    {
      name: 'Frontend',
      skills: [
        { name: 'TypeScript', icon: Typescript },
        { name: 'JavaScript', icon: JavaScript },
        { name: 'React', icon: ReactLight },
        { name: 'Next.js', icon: NextjsIconDark },
        { name: 'React Native', icon: Expo },
        { name: 'TanStack' },
        { name: 'Zustand' },
        { name: 'TailwindCSS', icon: TailwindCSS },
        { name: 'GraphQL', icon: GraphQL },
      ],
    },
    {
      name: 'Backend & Data',
      skills: [
        { name: 'Node.js', icon: Nodejs },
        { name: 'Hono' },
        { name: 'NestJS' },
        { name: 'tRPC' },
        { name: 'Go', icon: Golang },
        { name: 'Spring Boot', icon: Java },
        { name: 'PostgreSQL', icon: Postgresql },
        { name: 'Supabase' },
        { name: 'Drizzle', icon: DrizzleORM },
        { name: 'Prisma', icon: Prisma },
      ],
    },
    {
      name: 'Web3',
      skills: [
        { name: 'Solidity', icon: Solidity },
        { name: 'Hardhat' },
        { name: 'Foundry' },
        { name: 'Viem' },
        { name: 'Wagmi' },
        { name: 'Ethers' },
        { name: 'Privy' },
        { name: 'SIWE' },
      ],
    },
    {
      name: 'Quality & Tools',
      skills: [
        { name: 'Playwright' },
        { name: 'Vitest' },
        { name: 'Cypress' },
        { name: 'Docker', icon: Docker },
        { name: 'AWS' },
        { name: 'Vercel' },
        { name: 'GitHub Actions' },
        { name: 'Sentry' },
        { name: 'Figma' },
      ],
    },
  ],

  navbar: [
    { href: '#hero', icon: HomeIcon, label: 'Home' },
    { href: '/Rizkian_Akbar_Resume.pdf', icon: FileText, label: 'Resume (PDF)' },
  ],
  contact: {
    email: 'rizkianakbar4@gmail.com',
    social: {
      GitHub: {
        name: 'GitHub',
        url: 'https://github.com/rizkianakbar',
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: 'LinkedIn',
        url: 'https://linkedin.com/in/rizkianakbar',
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: 'X',
        url: 'https://x.com/rzknkbr',
        icon: Icons.x,
        navbar: true,
      },
      email: {
        name: 'Send Email',
        url: 'mailto:rizkianakbar4@gmail.com',
        icon: Icons.email,
        navbar: true,
      },
    },
  },

  work: [
    {
      company: 'Stealth Startup',
      location: 'Singapore (Remote)',
      title: 'Founding Engineer',
      logoUrl: '',
      start: 'Sep 2025',
      end: 'Present',
      blurb: "Product studio founded by Avocado DAO's founder, building products for B2B clients.",
      bullets: [
        "One of two engineers the founder chose to continue with after Avocado DAO's restructuring, out of a ~50-person company.",
        'Delivered 10+ client products end to end in a four-person team with the founder, frontend lead and PM.',
        'Built an AI property platform: a full property website plus a voice agent that answers inbound calls 24/7 and handles questions, rentals and viewing bookings with no staff on the phone.',
      ],
      tech: ['Vapi', 'n8n', 'Twilio', 'ElevenLabs', 'Next.js', 'TanStack', 'Supabase'],
    },
    {
      company: 'Avocado DAO',
      location: 'Singapore (Remote)',
      title: 'Senior Frontend Engineer',
      logoUrl: '/avocadodao.png',
      start: 'Oct 2022',
      end: 'Sep 2025',
      blurb: 'Web3 gaming and growth company. $18M Series A, backed by Animoca Brands and Algorand.',
      bullets: [
        'Grew from frontend into owning Stiqy end to end (backend, smart contracts, design, deployment), where 300 Web3 communities ran 703 gamified campaigns.',
        'Code-review quality gate for the 12-person product team: 20+ PRs a week across frontend, backend and Solidity. Mentored junior engineers.',
        'Built billing on Stripe and on-chain stablecoins: 104 Pro subscriptions at $1,499 each, about $156K in revenue.',
        'Built a Gemini-powered analytics assistant that answers campaign-data questions in plain language.',
        'Built smart contracts and on-chain gameplay for Bumpies, a 4,983-NFT collection on Base held by 1,200+ wallets.',
      ],
      tech: ['Next.js', 'tRPC', 'Supabase', 'Turborepo', 'Solidity', 'Viem', 'Wagmi', 'Stripe', 'Gemini'],
    },
    {
      company: 'KBR Media',
      location: 'Jakarta, Indonesia (Remote)',
      title: 'Full-Stack Developer',
      logoUrl: '/kbr.png',
      start: 'Jan 2023',
      end: 'Dec 2025',
      blurb: 'Indonesian national radio news agency. Held alongside Avocado DAO, with its approval.',
      bullets: [
        'Sole engineer across three products for most of the engagement: UX/UI, full-stack, servers and deployment.',
        'Built KBR ID, the national news site, serving up to 800K monthly visitors.',
        'Shipped KBR Prime, winner of the WAN-IFRA Digital Media Awards Asia 2024 (Best Innovative Digital Product).',
        'Built an internal podcast analytics platform, then onboarded a new product team in 2025.',
      ],
      tech: ['Next.js', 'tRPC', 'NextAuth', 'Zustand', 'Turborepo', 'Go', 'MariaDB'],
    },
    {
      company: 'Bountie Holdings',
      location: 'Singapore (Remote)',
      title: 'Frontend Engineer',
      logoUrl: '/bountie.png',
      start: 'Jan 2022',
      end: 'Oct 2022',
      blurb: 'Esports tournament platform that pivoted to Web3.',
      bullets: [
        "Built the platform's first wallet and prize-distribution system for organizers and winners.",
        'Delivered real-time brackets, team registration and a live tournament feed with comments and streaming.',
        'During the Web3 pivot, built token staking and a quest system with on-chain verification.',
      ],
      tech: ['Next.js', 'NestJS', 'NextAuth', 'Ethers', 'Moralis', 'Solidity'],
    },
    {
      company: 'HappyFresh',
      location: 'Jakarta, Indonesia (Remote)',
      title: 'Test Automation Engineer',
      logoUrl: '/happyfresh.png',
      start: 'Nov 2021',
      end: 'Oct 2022',
      blurb: 'Online grocery delivery platform in Southeast Asia.',
      bullets: [
        'Owned the daily end-to-end suite for the iOS and Android apps, with automated morning regression reports.',
        "Expanded coverage alongside new features and cut the suite's runtime.",
      ],
      tech: ['Ruby', 'Appium', 'Cucumber', 'Selenium', 'GoCD'],
    },
    {
      company: 'Next TI',
      location: 'Jakarta, Indonesia',
      title: 'Software Engineer',
      logoUrl: '/nextti.png',
      start: 'Jan 2020',
      end: 'Nov 2021',
      blurb: 'IT consultancy. Client: KEB Hana Bank Indonesia.',
      bullets: [
        "Built from scratch an offline-capable hybrid mobile app used daily by the bank's field collectors.",
        "Maintained and extended the bank's internal collection system, including SQL query optimization.",
        "Became the team's go-to engineer for production incidents and technical decisions.",
      ],
      tech: ['React', 'KendoUI', 'Java', 'Spring Boot', 'PostgreSQL'],
    },
  ],
  education: [
    {
      school: 'Binus University',
      href: 'https://binus.ac.id',
      degree: 'Bachelor of Computer Science · final year, alongside full-time work',
      logoUrl: '/binus.png',
      start: '2021',
      end: 'Present',
    },
    {
      school: 'Impact Byte',
      href: 'https://www.linkedin.com/school/impactbyte/posts/?feedView=all',
      degree: 'Full Stack Web Development Bootcamp (KEB Hana Bank scholarship)',
      logoUrl: '/impactbyte.png',
      start: '2019',
      end: '2019',
    },
  ],
  projects: [
    {
      title: 'KBR Prime',
      tone: 'red' as LootTone,
      type: 'Award-winning podcast platform',
      boundTo: 'KBR Media',
      dates: '2023 - 2025',
      rarity: 'legendary' as Rarity,
      stats: [
        '+1 WAN-IFRA Award, Asia 2024',
        '+Best Innovative Digital Product',
        '+Embeddable player & RSS distribution',
        '+Internal podcast analytics',
      ],
      flavor: 'Radio, but make it award-winning.',
      technologies: ['Next.js', 'TypeScript', 'tRPC', 'Zustand', 'Go', 'MariaDB'],
      video: '/kbr.mp4',
      poster: '/projects/posters/kbr.jpg',
    },
    {
      title: 'Stiqy Dashboard',
      tone: 'yellow' as LootTone,
      type: 'B2B Web3 growth platform',
      boundTo: 'Avocado DAO',
      dates: '2022 - 2025',
      rarity: 'legendary' as Rarity,
      stats: [
        '+703 gamified campaigns',
        '+300 Web3 communities',
        '+Gemini analytics assistant',
        '+Stripe & stablecoin billing',
      ],
      flavor: 'Where communities come to grind.',
      technologies: ['Next.js', 'tRPC', 'Supabase', 'Solidity', 'Viem', 'Wagmi', 'Privy'],
      video: '/stiqy-admin.mp4',
      poster: '/projects/posters/stiqy-admin.jpg',
    },
    {
      title: 'KBR ID',
      tone: 'red' as LootTone,
      type: 'National news site',
      boundTo: 'KBR Media',
      dates: '2023 - 2025',
      rarity: 'epic' as Rarity,
      stats: ['+800K monthly visitors', '+Built and run solo'],
      flavor: 'Breaking news, never breaking prod.',
      technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'Go', 'MariaDB'],
      video: '/kbr.mp4',
      poster: '/projects/posters/kbr.jpg',
    },
    {
      title: 'Bumpies NFT',
      tone: 'purple' as LootTone,
      type: 'NFT collection on Base',
      boundTo: 'Avocado DAO',
      dates: '2022 - 2025',
      rarity: 'epic' as Rarity,
      stats: ['+4,983 NFTs minted', '+1,200+ unique holders', '+On-chain gameplay'],
      flavor: 'Small, round, and fully on-chain.',
      technologies: ['Solidity', 'Hardhat', 'Viem', 'Wagmi', 'Next.js'],
      video: '/bumpies.mp4',
      poster: '/projects/posters/bumpies.jpg',
    },
    {
      title: 'Stiqy App',
      tone: 'yellow' as LootTone,
      type: 'Player-side quest app',
      boundTo: 'Avocado DAO',
      dates: '2022 - 2025',
      rarity: 'rare' as Rarity,
      stats: ['+On-chain & social quests', '+Wallet sign-in', '+Real-time campaigns'],
      flavor: 'Quests for the people.',
      technologies: ['Next.js', 'tRPC', 'Supabase', 'Wagmi', 'Privy'],
      video: '/stiqy-app.mp4',
      poster: '/projects/posters/stiqy-app.jpg',
    },
    {
      title: 'Stiqy',
      tone: 'yellow' as LootTone,
      type: 'Product landing page',
      boundTo: 'Avocado DAO',
      dates: '2022 - 2025',
      rarity: 'rare' as Rarity,
      stats: ['+Features & pricing', '+Client onboarding flow'],
      flavor: 'First impressions, minted.',
      technologies: ['Next.js', 'TypeScript', 'TailwindCSS'],
      video: '/stiqy.mp4',
      poster: '/projects/posters/stiqy.jpg',
    },
  ],
  sideQuests: [
    {
      title: 'Lantun',
      status: 'done' as QuestStatus,
      reward: '~38 kB · 12 reading aids',
      tagline: 'Turn any article into something people can listen to',
      href: 'https://lantun.rzknkbr.xyz',
      repo: 'https://github.com/rizkianakbar/lantun',
      image: '/projects/lantun.jpg',
      description:
        'One script tag adds read-aloud with sentence and word highlighting, plus 12 reading aids for low vision, dyslexia and ADHD. Lifelike voices run in the browser, no backend.',
      technologies: ['TypeScript', 'Web Components', 'Web Workers', 'React'],
    },
    {
      title: 'Whitzard',
      status: 'done' as QuestStatus,
      reward: '131 tests · 99% coverage',
      tagline: 'Trustless escrow for community health aid',
      href: 'https://whitzard.rzknkbr.xyz',
      repo: 'https://github.com/rizkianakbar/whitzard',
      image: '/projects/whitzard.jpg',
      description:
        'Admin-less Solidity escrow: no voting, no approvals, the rules are the code. 131 tests incl. fuzz and invariant, 99% coverage, Go indexer and keeper.',
      technologies: ['Solidity', 'Go', 'Next.js', 'Viem'],
    },
    {
      title: 'e-Clinic',
      status: 'active' as QuestStatus,
      reward: 'Built for a real clinic',
      tagline: 'Clinic management for Indonesian clinics',
      href: 'https://clinic.rzknkbr.xyz',
      repo: 'https://github.com/rizkianakbar/eClinic',
      image: '',
      caption: 'Front desk → Exam → Pharmacy → Cashier',
      description:
        'Registration, queues, medical records, pharmacy stock by batch and expiry, cashier with QRIS and owner reports. Multi-tenant with row-level security.',
      technologies: ['Next.js 16', 'Supabase', 'TanStack', 'Playwright'],
    },
    {
      title: 'Noorish',
      status: 'active' as QuestStatus,
      reward: 'Recitation that follows along word by word',
      tagline: 'A calm Quran reader',
      href: 'https://noorish.rzknkbr.xyz',
      repo: 'https://github.com/rizkianakbar/noorish',
      image: '/projects/noorish.jpg',
      description:
        'Word-by-word meanings, tafsir and recitation that follows along word by word, with notes, bookmarks and instant in-browser search.',
      technologies: ['TanStack Start', 'Drizzle', 'PostgreSQL', 'Bun'],
    },
  ],
} as const;
