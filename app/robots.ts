import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/features/seo/seo.lib';

/**
 * Everything is public. AI crawlers are named explicitly: being quoted by ChatGPT, Claude, Perplexity
 * and Google's AI answers is a goal of this site, not something to block.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
