import type { JSX } from 'react';
import { ContactSection } from '@/components/section/contact-section';
import { EducationSection } from '@/components/section/education-section';
import { GithubActivitySection } from '@/components/section/github-activity-section';
import { HeroSection } from '@/components/section/hero-section';
import { ProjectsSection } from '@/components/section/projects-section';
import { SkillsSection } from '@/components/section/skills-section';
import { StorySection } from '@/components/section/story-section';
import { TrophySection } from '@/components/section/trophy-section';
import { WorkSection } from '@/components/section/work-section';

export default function HomePage(): JSX.Element {
  return (
    <main className="flex flex-col gap-28 sm:gap-36">
      <HeroSection />
      <TrophySection />
      <StorySection />
      <GithubActivitySection />
      <div className="flex flex-col gap-12">
        <WorkSection />
        <EducationSection />
      </div>
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}
