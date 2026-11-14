import { ArrowUpRight } from 'lucide-react';
import type { JSX } from 'react';
import { Reveal } from '@/components/game/primitives';
import { resumeData } from '@/lib/resume';

export function EducationSection(): JSX.Element {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 sm:px-6">
      <Reveal>
        <p className="font-pixel text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Training grounds
        </p>
      </Reveal>
      <div className="grid gap-3 sm:grid-cols-2">
        {resumeData.education.map((edu, i) => (
          <Reveal key={edu.school} delay={i * 0.06}>
            <a
              href={edu.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-3xl border border-border bg-card/80 backdrop-blur p-4 h-full hover:border-foreground/25 hover:-translate-y-1 transition-all">
              {/* biome-ignore lint/performance/noImgElement: small static logos */}
              <img
                src={edu.logoUrl}
                alt=""
                className="size-10 rounded-2xl border border-border bg-white p-1 object-contain shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold flex items-center gap-1">
                  {edu.school}
                  <ArrowUpRight
                    className="size-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    aria-hidden
                  />
                </p>
                <p className="text-xs text-muted-foreground">{edu.degree}</p>
                <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                  {edu.start === edu.end ? edu.start : `${edu.start} – ${edu.end}`}
                </p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
