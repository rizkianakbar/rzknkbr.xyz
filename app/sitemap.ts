import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/features/seo/seo.lib';
import { resumeData } from '@/lib/resume';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl(resumeData.cvUrl), lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
