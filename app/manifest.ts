import type { MetadataRoute } from 'next';
import { SEO_DESCRIPTION } from '@/features/seo/seo.lib';
import { resumeData } from '@/lib/resume';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${resumeData.name} · ${resumeData.title}`,
    short_name: resumeData.name,
    description: SEO_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#16151f',
    theme_color: '#16151f',
  };
}
