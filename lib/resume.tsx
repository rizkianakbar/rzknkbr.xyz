import { HomeIcon } from 'lucide-react';
import { Docker } from '@/components/ui/svgs/docker';
import { DrizzleORM } from '@/components/ui/svgs/drizzle';
import { Expo } from '@/components/ui/svgs/expo';
import { Golang } from '@/components/ui/svgs/golang';
import { GraphQL } from '@/components/ui/svgs/graphql';
import { Icons } from '@/components/ui/svgs/icons';
import { Java } from '@/components/ui/svgs/java';
import { JavaScript } from '@/components/ui/svgs/javascript';
import { NextjsIconDark } from '@/components/ui/svgs/nextjsIconDark';
import { Nodejs } from '@/components/ui/svgs/nodejs';
import { Postgresql } from '@/components/ui/svgs/postgresql';
import { Prisma } from '@/components/ui/svgs/prisma';
import { ReactLight } from '@/components/ui/svgs/reactLight';
import { Solidity } from '@/components/ui/svgs/solidity';
import { TailwindCSS } from '@/components/ui/svgs/tailwindcss';
import { Typescript } from '@/components/ui/svgs/typescript';

export const resumeData = {
  name: 'Rizkian Akbar',
  initials: 'RA',
  url: 'https://rizkianakbar.com',
  location: 'Bandung, Indonesia',
  locationLink: 'https://www.google.com/maps/place/bandung',
  description: 'Full-stack engineer who builds products end-to-end. I love turning ideas into real things.',
  summary:
    "Started my career in 2019 when I won a scholarship from KEB Hana Bank, beating out nearly 3000 applicants to join an intensive coding bootcamp. That was the spark. Since then I've been grinding through banking systems, test automation, Web3 platforms, and high-traffic news products. These days I'm building full-stack with React, Next.js, and TypeScript.",
  avatarUrl: '/me.png',
  skills: [
    { name: 'React', icon: ReactLight },
    { name: 'Next.js', icon: NextjsIconDark },
    { name: 'Javascript', icon: JavaScript },
    { name: 'Typescript', icon: Typescript },
    { name: 'Expo', icon: Expo },
    { name: 'TailwindCSS', icon: TailwindCSS },
    { name: 'Node.js', icon: Nodejs },
    { name: 'Java', icon: Java },
    { name: 'Go', icon: Golang },
    { name: 'Postgres', icon: Postgresql },
    { name: 'Docker', icon: Docker },
    { name: 'GraphQL', icon: GraphQL },
    { name: 'Solidity', icon: Solidity },
    { name: 'DrizzleORM', icon: DrizzleORM },
    { name: 'Prisma', icon: Prisma },
  ],
  navbar: [
    { href: '/', icon: HomeIcon, label: 'Home' },
    // { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: 'rizkianakbar4@gmail.com',
    tel: '+62895610381334',
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
      company: 'Avocado DAO',
      href: 'https://www.linkedin.com/company/avocadodao/',
      badges: [],
      location: 'Singapore (Remote)',
      title: 'Senior Software Engineer',
      logoUrl: '/avocadodao.png',
      start: 'Oct 2022',
      end: 'Present',
      description:
        "Led end-to-end full-stack development of Stiqy.io, a Web3 'Community as a Service' platform from concept to deployment. Implemented pricing systems integrating Stripe and on-chain stablecoin payments. Oversaw core blockchain functionalities for the Bumpies NFT ecosystem including minting 3,257 NFTs and complex on-chain gameplay. Developed an AI-powered analytics chatbot using Google Gemini. Mentored junior developers and reviewed 10+ PRs weekly.",
    },
    {
      company: 'KBR Media',
      href: 'https://www.linkedin.com/company/medialintasintinusantara/',
      badges: ['WAN-IFRA Award'],
      location: 'Jakarta, Indonesia',
      title: 'Senior Software Engineer',
      logoUrl: '/kbr.png',
      start: 'Jan 2023',
      end: 'Dec 2025',
      description:
        "Developed kbr.id, a news website reaching 800,000 visitors/month. Built kbrprime.id, a podcast platform that won 'WAN-IFRA Digital Media Awards Asia 2024' for Best Innovative Digital Product. Led end-to-end development as the sole engineer, handling full-stack implementation, UX/UI design, and the entire deployment pipeline including server configuration and domain routing.",
    },
    {
      company: 'IFG Life',
      href: 'https://www.linkedin.com/company/ifg-life/',
      badges: [],
      location: 'Jakarta, Indonesia',
      title: 'Software Engineer',
      logoUrl: '/ifg.png',
      start: 'Dec 2022',
      end: 'Mar 2023',
      description:
        'Engineered key features for space.life.id. Developed an automated yearly report generation system reducing manual processing time by 70%. Created a survey management module that increased customer feedback collection by 40%. Designed an activity logging system enhancing data tracking and compliance.',
    },
    {
      company: 'Bountie Holdings',
      href: 'https://www.linkedin.com/search/results/all/?keywords=Bountie',
      badges: [],
      location: 'Singapore (Remote)',
      title: 'Software Engineer',
      logoUrl: '/bountie.png',
      start: 'Jan 2022',
      end: 'Oct 2022',
      description:
        'Led development of a Web3 platform from concept to launch. Integrated token staking, smart contract interactions, and reward systems. Implemented security measures for crypto transactions and user wallets. Conducted code reviews and maintained high code quality standards.',
    },
    {
      company: 'HappyFresh',
      href: 'https://www.linkedin.com/company/happyfresh/',
      badges: [],
      location: 'Jakarta, Indonesia',
      title: 'Test Automation Engineer',
      logoUrl: '/happyfresh.png',
      start: 'Nov 2021',
      end: 'Oct 2022',
      description:
        'Optimized test case scenarios for improved efficiency. Increased reliability of smoke and regression tests. Developed automated tests for all features in the HappyFresh iOS and Android apps using Ruby, Appium, Cucumber, Selenium, and Capybara.',
    },
    {
      company: 'Next TI',
      href: '#',
      badges: [],
      location: 'Jakarta, Indonesia',
      title: 'Software Engineer',
      logoUrl: '/nextti.png',
      start: 'Jan 2020',
      end: 'Nov 2021',
      description:
        "Led maintenance and enhancement of KEB Hana Bank Indonesia's collection system, improving operational efficiency and reducing processing errors. Architected and developed a custom Android application for field agents from scratch. Implemented robust security measures ensuring compliance with banking industry standards.",
    },
  ],
  education: [
    {
      school: 'Binus University',
      href: 'https://binus.ac.id',
      degree: 'Bachelor of Computer Science',
      logoUrl: '/binus.png',
      start: '2017',
      end: '2021',
    },
    {
      school: 'Impact Byte',
      href: 'https://www.linkedin.com/school/impactbyte/posts/?feedView=all',
      degree: 'Full Stack Web Development Bootcamp (Scholarship — KEB Hana Bank)',
      logoUrl: '/impactbyte.png',
      start: '2019',
      end: '2019',
    },
  ],
  projects: [
    {
      title: 'KBR ID',
      href: 'https://kbr.id',
      dates: 'Jan 2023 - Dec 2025',
      active: true,
      description:
        'A high-traffic news website serving audiences throughout Indonesia, reaching a peak of 800,000 visitors per month. Built and maintained as the sole engineer.',
      technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'Go', 'MariaDB'],
      links: [
        {
          type: 'Website',
          href: 'https://kbr.id',
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: '',
      video: '/kbr.mp4',
    },
    {
      title: 'Stiqy Dashboard',
      href: 'https://business.stiqy.io/login',
      dates: 'Oct 2022 - Present',
      active: true,
      description:
        'The business admin portal for Stiqy where project owners set up communities, create campaigns, design multi-step task flows, and manage their audience. Includes an AI-powered analytics chatbot for querying campaign data through natural language, and an integrated payment system supporting both Stripe and on-chain stablecoin payments.',
      technologies: [
        'Next.js',
        'TypeScript',
        'TRPC',
        'TailwindCSS',
        'Supabase',
        'React Query',
        'Node.js',
        'Solidity',
        'Hardhat',
        'Wagmi',
        'Viem',
        'Moralis',
        'Privy',
      ],
      links: [],
      image: '',
      video: '/stiqy-admin.mp4',
    },
    {
      title: 'KBR Prime',
      href: 'https://kbrprime.id',
      dates: 'Jan 2023 - Dec 2025',
      active: true,
      description:
        "Award-winning podcast platform that won the 'WAN-IFRA Digital Media Awards Asia 2024' for Best Innovative Digital Product. Includes a comprehensive podcast analytics platform for internal teams to analyze performance, trends, and metrics. The platform has since been merged into kbr.id.",
      technologies: [
        'Next.js',
        'TypeScript',
        'TRPC',
        'TailwindCSS',
        'NextAuth',
        'React Query',
        'Zustand',
        'Go',
        'MariaDB',
      ],
      links: [
        {
          type: 'Website',
          href: 'https://kbrprime.id',
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: '',
      video: '/kbr.mp4',
    },
    {
      title: 'Stiqy App',
      href: 'https://loyaltys2.sugarverse.io/campaigns/0ec811dd-340e-4046-a5c1-20b36f4218b2',
      dates: 'Oct 2022 - Present',
      active: true,
      description:
        'The public-facing side of Stiqy where end users discover communities, join campaigns, and complete on-chain and social tasks to earn rewards. Features wallet authentication, on-chain verification, and real-time campaign interactions.',
      technologies: [
        'Next.js',
        'TypeScript',
        'TRPC',
        'TailwindCSS',
        'Supabase',
        'React Query',
        'Wagmi',
        'Viem',
        'Moralis',
        'Privy',
      ],
      links: [],
      image: '',
      video: '/stiqy-app.mp4',
    },
    {
      title: 'Bumpies NFT',
      href: 'https://www.bumpies.gg/',
      dates: 'Oct 2022 - Present',
      active: true,
      description:
        'The official Bumpies NFT website where users can mint NFTs and explore the full gallery of all minted Bumpies. Includes collection info and on-chain minting functionality.',
      technologies: ['Solidity', 'Hardhat', 'Ethers', 'Wagmi', 'Viem', 'Moralis', 'Next.js', 'TypeScript'],
      links: [],
      image: '',
      video: '/bumpies.mp4',
    },
    {
      title: 'Stiqy',
      href: 'https://stiqy.io',
      dates: 'Oct 2022 - Present',
      active: true,
      description:
        'The official landing page for Stiqy, a Web3 community engagement platform. Showcases the platform features, pricing, and onboarding flow for potential business clients.',
      technologies: ['Next.js', 'TypeScript', 'TailwindCSS'],
      links: [
        {
          type: 'Website',
          href: 'https://stiqy.io',
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: '',
      video: '/stiqy.mp4',
    },
  ],
  hackathons: [],
} as const;
