import { Contact } from '@/features/contact/contact';
import { Education } from '@/features/education/education';
import { Github } from '@/features/github/github';
import { Hero } from '@/features/hero/hero';
import { Loot } from '@/features/loot/loot';
import { Quests } from '@/features/quests/quests';
import { homeJsonLd, serializeJsonLd } from '@/features/seo/seo.lib';
import { Skills } from '@/features/skills/skills';
import { Story } from '@/features/story/story';
import { Trophies } from '@/features/trophies/trophies';

export default function HomePage() {
  return (
    <main className="flex flex-col gap-28 sm:gap-36">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from our own data; `<` is escaped
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeJsonLd(new Date())) }}
      />
      <Hero />
      <Trophies />
      <Story />
      <Github />
      <div className="flex flex-col gap-12">
        <Quests />
        <Education />
      </div>
      <Loot />
      <Skills />
      <Contact />
    </main>
  );
}
