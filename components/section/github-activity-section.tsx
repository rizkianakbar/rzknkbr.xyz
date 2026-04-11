import type { JSX } from 'react';
import { BlurFade } from '@/components/blur-fade';
import { GitHubContributionGraph } from '@/components/github-contribution-graph';
import { fetchGitHubContributions } from '@/lib/github-contributions';
import { resumeData } from '@/lib/resume';

const BLUR_STEP = 0.04;

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
    <section id="github">
      <div className="flex min-h-0 flex-col gap-y-6">
        <BlurFade delay={BLUR_STEP * 4.25}>
          <h2 className="text-xl font-bold">GitHub Activity</h2>
        </BlurFade>

        <BlurFade delay={BLUR_STEP * 4.5}>
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
        </BlurFade>
      </div>
    </section>
  );
}
