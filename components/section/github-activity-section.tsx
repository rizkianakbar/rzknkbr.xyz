import type { JSX } from 'react';
import { Reveal, SectionHeader } from '@/components/game/primitives';
import { GitHubContributionGraph } from '@/components/github-contribution-graph';
import { fetchGitHubContributions } from '@/lib/github-contributions';
import { resumeData } from '@/lib/resume';

function githubProfileUrl(): string {
  const gh = resumeData.contact.social.GitHub;
  return gh?.url ?? 'https://github.com/rizkianakbar';
}

function githubUsernameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/^\//, '').replace(/\/$/, '');
    const seg = path.split('/').filter(Boolean)[0];
    return seg ?? 'rizkianakbar';
  } catch {
    return 'rizkianakbar';
  }
}

export async function GithubActivitySection(): Promise<JSX.Element> {
  const profileUrl = githubProfileUrl();
  const username = githubUsernameFromUrl(profileUrl);
  const data = await fetchGitHubContributions(username);

  return (
    <section id="github" data-section="github" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <div className="flex min-h-0 flex-col gap-y-10">
        <SectionHeader
          index="03"
          kicker="Daily grind"
          title="The grind, visualized"
          subtitle="A year of commits. Hover the squares, then click them for notes."
        />

        <Reveal>
          {data ? (
            <GitHubContributionGraph data={data} profileUrl={profileUrl} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Could not load contribution graph.{' '}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground">
                View profile on GitHub
              </a>
              .
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
