import { resumeData } from '@/lib/resume';

const { url: SITE_URL, contact } = resumeData;

/** ~50–60 chars: name first (people search the name), then role and the two strongest keywords. */
export const SEO_TITLE = `${resumeData.name} · ${resumeData.title} (Full-Stack & Web3)`;

/** ~150–160 chars, third person so it reads as a fact when quoted by search and AI answers. */
export const SEO_DESCRIPTION = `${resumeData.name} (rizkianakbar) is a ${resumeData.title} in ${resumeData.location}: 6+ years shipping full-stack and Web3 products, from award-winning apps to B2B.`;

export const SEO_KEYWORDS = [
  resumeData.name,
  ...resumeData.alternateNames,
  'Rizkian',
  'Rizkian dev',
  'Rizkian frontend',
  'Rizkian Akbar developer',
  resumeData.title,
  'Software Engineer',
  'Frontend Developer',
  'Full-Stack Engineer',
  'Web3 Engineer',
  'Next.js Developer',
  'React Developer',
  'TypeScript',
  'Solidity',
  'Bandung',
  'Indonesia',
  'Remote Software Engineer',
];

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

const PERSON_ID = absoluteUrl('/#person');
const WEBSITE_ID = absoluteUrl('/#website');

/** Public profiles that are the same person: links the site to them in Google's knowledge graph. */
export const SAME_AS = Object.values(contact.social)
  .map((social) => social.url)
  .filter((url) => url.startsWith('http'));

function person() {
  const edu = resumeData.education;
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: resumeData.name,
    alternateName: [...resumeData.alternateNames],
    jobTitle: resumeData.title,
    description: SEO_DESCRIPTION,
    url: SITE_URL,
    image: absoluteUrl(resumeData.avatarUrl),
    email: `mailto:${contact.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Bandung', addressCountry: 'ID' },
    sameAs: SAME_AS,
    knowsAbout: resumeData.skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)),
    alumniOf: edu.map((e) => ({ '@type': 'EducationalOrganization', name: e.school, url: e.href })),
    award: ['WAN-IFRA Digital Media Awards Asia 2024: Best Innovative Digital Product (KBR Prime)'],
    hasOccupation: {
      '@type': 'Occupation',
      name: resumeData.title,
      skills: resumeData.skillGroups.map((group) => group.name).join(', '),
    },
  };
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: resumeData.name,
    description: SEO_DESCRIPTION,
    inLanguage: 'en',
    author: { '@id': PERSON_ID },
  };
}

function projects() {
  return {
    '@type': 'ItemList',
    name: `Projects by ${resumeData.name}`,
    itemListElement: [
      ...resumeData.projects.map((project) => ({
        '@type': 'CreativeWork',
        name: project.title,
        description: `${project.type}. ${project.stats.map((stat) => stat.replace(/^\+/, '')).join('. ')}.`,
        creator: { '@id': PERSON_ID },
        keywords: project.technologies.join(', '),
      })),
      ...resumeData.sideQuests.map((quest) => ({
        '@type': 'SoftwareSourceCode',
        name: quest.title,
        description: quest.description,
        url: quest.href,
        codeRepository: quest.repo,
        programmingLanguage: quest.technologies[0],
        creator: { '@id': PERSON_ID },
      })),
    ].map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
  };
}

/**
 * One JSON-LD graph for the home page: a ProfilePage about a Person, the WebSite, and the projects.
 * `dateModified` is when the page was built, which is when its content last changed.
 */
export function homeJsonLd(builtAt: Date) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': absoluteUrl('/#profile'),
        url: SITE_URL,
        name: SEO_TITLE,
        dateModified: builtAt.toISOString(),
        mainEntity: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
      },
      person(),
      website(),
      projects(),
    ],
  };
}

/** Serializes JSON-LD for a <script> tag; `<` is escaped so content can never close the tag early. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Plain-text summary for /llms.txt: what AI assistants should know, in Markdown. */
export function llmsTxt(): string {
  const lines = [
    `# ${resumeData.name}`,
    '',
    `> ${SEO_DESCRIPTION}`,
    '',
    `${resumeData.availability}. Contact: ${contact.email}. Resume (PDF): ${absoluteUrl(resumeData.cvUrl)}`,
    '',
    '## About',
    '',
    ...resumeData.summary.map((paragraph) => `${paragraph}\n`),
    '## Experience',
    '',
    ...resumeData.work.flatMap((job) => [
      `### ${job.title}, ${job.company} (${job.start} – ${job.end})`,
      '',
      job.blurb,
      '',
      ...job.bullets.map((bullet) => `- ${bullet}`),
      '',
    ]),
    '## Projects',
    '',
    ...resumeData.projects.map(
      (p) => `- **${p.title}** (${p.dates}): ${p.type}. ${p.stats.map((s) => s.replace(/^\+/, '')).join('; ')}.`,
    ),
    ...resumeData.sideQuests.map(
      (q) => `- **${q.title}**: ${q.tagline}. ${q.description} [Live](${q.href}) · [Source](${q.repo})`,
    ),
    '',
    '## Skills',
    '',
    ...resumeData.skillGroups.map((g) => `- ${g.name}: ${g.skills.map((s) => s.name).join(', ')}`),
    '',
    '## Education',
    '',
    ...resumeData.education.map((e) => `- ${e.school}: ${e.degree} (${e.start} – ${e.end})`),
    '',
    '## Links',
    '',
    `- Website: ${SITE_URL}`,
    ...SAME_AS.map((url) => `- ${url}`),
    '',
  ];
  return lines.join('\n');
}
