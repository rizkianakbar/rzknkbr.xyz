import type { Metadata, Viewport } from 'next';
import { Geist, Silkscreen } from 'next/font/google';
import Script from 'next/script';
import { Providers } from '@/app/providers';
import { Game } from '@/features/game/game';
import { Navbar } from '@/features/navbar/navbar';
import { SEO_DESCRIPTION, SEO_KEYWORDS, SEO_TITLE } from '@/features/seo/seo.lib';
import { resumeData } from '@/lib/resume';
import { cn } from '@/lib/utils';

import './globals.css';

// Geist is a variable font: one file covers every weight, so no `weight` list.
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const silkscreen = Silkscreen({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-silkscreen',
});

export const metadata: Metadata = {
  metadataBase: new URL(resumeData.url),
  title: { default: SEO_TITLE, template: `%s | ${resumeData.name}` },
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: resumeData.name,
  authors: [{ name: resumeData.name, url: resumeData.url }],
  creator: resumeData.name,
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    firstName: 'Rizkian',
    lastName: 'Akbar',
    username: 'rzknkbr',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: '/',
    siteName: resumeData.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    creator: '@rzknkbr',
    site: '@rzknkbr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#16151f',
  colorScheme: 'dark',
};

/** Runs before paint so visitors who already pressed start this session never see the start screen flash. */
const SKIP_START = `try{if(sessionStorage.getItem('rzk-started'))document.documentElement.dataset.started='1'}catch(e){}`;

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout(props: RootLayoutProps) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script */}
        <script dangerouslySetInnerHTML={{ __html: SKIP_START }} />
        <noscript>
          <style>
            {
              '#start-screen,[data-chest]{display:none!important}[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}'
            }
          </style>
        </noscript>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased relative overflow-x-clip',
          geist.variable,
          silkscreen.variable,
        )}>
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="19f914e0-2aba-42c7-bdb9-d73147572d3d" />

        <Providers>
          <Game />
          <div className="relative z-10 pt-24 pb-32 sm:pt-28">{props.children}</div>
          <Navbar />
        </Providers>
      </body>
    </html>
  );
}
