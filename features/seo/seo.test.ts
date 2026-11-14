import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  homeJsonLd,
  llmsTxt,
  SAME_AS,
  SEO_DESCRIPTION,
  SEO_TITLE,
  serializeJsonLd,
} from '@/features/seo/seo.lib';
import { resumeData } from '@/lib/resume';

describe('SEO copy', () => {
  it('keeps the title within what search results show (~60 chars) and leads with the name', () => {
    expect(SEO_TITLE.length).toBeLessThanOrEqual(62);
    expect(SEO_TITLE.startsWith(resumeData.name)).toBe(true);
  });

  it('keeps the description within ~160 chars and names the person', () => {
    expect(SEO_DESCRIPTION.length).toBeGreaterThan(110);
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(165);
    expect(SEO_DESCRIPTION).toContain(resumeData.name);
  });
});

describe('absoluteUrl', () => {
  it('uses the canonical www host', () => {
    expect(absoluteUrl('/me.png')).toBe('https://www.rzknkbr.xyz/me.png');
  });
});

describe('homeJsonLd', () => {
  const graph = homeJsonLd(new Date('2026-01-01T00:00:00Z'))['@graph'] as Record<string, unknown>[];
  const byType = (type: string) => graph.find((node) => node['@type'] === type) as Record<string, unknown>;

  it('describes a ProfilePage whose main entity is the Person', () => {
    const page = byType('ProfilePage');
    const person = byType('Person');
    expect(page.mainEntity).toEqual({ '@id': person['@id'] });
    expect(page.dateModified).toBe('2026-01-01T00:00:00.000Z');
  });

  it('links the person to every public profile, with absolute https URLs only', () => {
    const person = byType('Person');
    expect(person.sameAs).toEqual(SAME_AS);
    expect(SAME_AS.length).toBeGreaterThanOrEqual(3);
    for (const url of SAME_AS) expect(url).toMatch(/^https:\/\//);
    expect(person.image).toMatch(/^https:\/\/www\.rzknkbr\.xyz\//);
  });

  it('lists every project and side quest', () => {
    const list = byType('ItemList') as { itemListElement: { position: number }[] };
    expect(list.itemListElement).toHaveLength(resumeData.projects.length + resumeData.sideQuests.length);
    expect(list.itemListElement.map((i) => i.position)).toEqual(list.itemListElement.map((_, i) => i + 1));
  });

  it('is serialized safely inside a <script> tag', () => {
    const json = serializeJsonLd({ text: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).text).toBe('</script><script>alert(1)</script>');
  });
});

describe('llmsTxt', () => {
  it('starts with the name as an H1 and the summary as a quote, per the llms.txt format', () => {
    const [h1, , quote] = llmsTxt().split('\n');
    expect(h1).toBe(`# ${resumeData.name}`);
    expect(quote).toBe(`> ${SEO_DESCRIPTION}`);
  });

  it('includes every job and project', () => {
    const text = llmsTxt();
    for (const job of resumeData.work) expect(text).toContain(job.company);
    for (const project of resumeData.projects) expect(text).toContain(project.title);
  });
});
