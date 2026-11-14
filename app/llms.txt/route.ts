import { llmsTxt } from '@/features/seo/seo.lib';

/** /llms.txt: a Markdown summary for AI assistants, generated from the same resume data as the page. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
