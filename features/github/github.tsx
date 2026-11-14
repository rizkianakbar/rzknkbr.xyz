import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { fetchGitHubContributions } from '@/features/github/github.lib';
import { GithubGraph } from '@/features/github/github-graph';
import { resumeData } from '@/lib/resume';

/** Server Component: contributions are fetched at build time and refreshed hourly (ISR), never in the browser. */
export async function Github() {
  const profileUrl = resumeData.contact.social.GitHub.url;
  const data = await fetchGitHubContributions(resumeData.githubUsername);

  return (
    <section id="github" data-section="github" className="mx-auto w-full max-w-5xl px-5 sm:px-6 scroll-mt-28">
      <div className="flex flex-col gap-y-10">
        <SectionHeader
          index="03"
          kicker="Daily grind"
          title="The grind, visualized"
          subtitle="A year of commits. Hover the squares, then click them for notes."
        />

        <Reveal>
          {data ? (
            <GithubGraph data={data} profileUrl={profileUrl} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Could not load the contribution graph.{' '}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground">
                View my profile on GitHub
              </a>
              .
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
