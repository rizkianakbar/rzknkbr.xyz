import { describe, expect, it } from 'vitest';
import { paginate } from '@/features/testimonials/testimonials.lib';
import { resumeData } from '@/lib/resume';

describe('paginate', () => {
  it('packs sentences into pages without losing text', () => {
    expect(paginate('One. Two! Three?', 10)).toEqual(['One. Two!', 'Three?']);
    expect(paginate('Short.')).toEqual(['Short.']);
  });

  it('keeps every testimonial intact and within page size', () => {
    for (const t of resumeData.testimonials) {
      const pages = paginate(t.quote);
      expect(pages.join(' ')).toBe(t.quote.replace(/\s+/g, ' ').trim());
      // Only a single sentence too long to split may exceed the page size.
      for (const page of pages) if (page.length > 200) expect(page).not.toMatch(/[.!?]\s/);
    }
  });
});
