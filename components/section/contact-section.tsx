'use client';

import { Check, Copy, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { type JSX, useState } from 'react';
import { useGame } from '@/components/game/game-provider';
import { Reveal } from '@/components/game/primitives';
import { fx } from '@/lib/fx';
import { resumeData } from '@/lib/resume';
import { play } from '@/lib/sound';

const SOCIALS = [resumeData.contact.social.LinkedIn, resumeData.contact.social.GitHub, resumeData.contact.social.X];

export function ContactSection(): JSX.Element {
  const { award, notify } = useGame();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    const { clientX: x, clientY: y } = e;
    try {
      await navigator.clipboard.writeText(resumeData.contact.email);
      setCopied(true);
      play('coin');
      fx.confetti(140);
      fx.burst(x, y, { count: 40, spread: 9 });
      notify({ title: 'Email copied!', description: resumeData.contact.email, emoji: '📋' });
      award('party-invite', { x, y });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${resumeData.contact.email}`;
    }
  };

  return (
    <section id="contact" data-section="contact" className="mx-auto w-full max-w-4xl px-5 sm:px-6 scroll-mt-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border-2 border-game-pink/40 bg-card/90 backdrop-blur px-6 py-14 sm:px-12 sm:py-20 text-center">
          <div
            aria-hidden
            className="absolute -top-32 left-1/2 -translate-x-1/2 size-[28rem] rounded-full bg-game-pink/20 blur-3xl"
          />
          <div aria-hidden className="absolute -bottom-40 -right-20 size-80 rounded-full bg-game-accent/15 blur-3xl" />

          <div className="relative flex flex-col items-center gap-5">
            <p className="font-pixel text-[11px] uppercase tracking-[0.3em] text-game-pink">07 · Final boss</p>
            <motion.div
              aria-hidden
              className="text-6xl sm:text-7xl"
              animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, -4, 4, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}>
              👾
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-balance">
              Let&apos;s build something together
            </h2>
            <p className="text-muted-foreground max-w-lg text-pretty">
              Hiring, collaborating, or just want to say hi? Send a party invite. {resumeData.availability}.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <motion.button
                type="button"
                data-sfx="none"
                onClick={copy}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-2 rounded-2xl bg-game-pink text-white font-semibold px-6 py-3.5 shadow-[0_6px_0_0_color-mix(in_oklab,var(--game-pink)_55%,black)] active:shadow-none active:translate-y-1.5 transition-shadow">
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? 'Copied!' : resumeData.contact.email}
              </motion.button>
              <motion.a
                href={resumeData.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-sfx="coin"
                data-cv
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-background font-semibold px-6 py-3 hover:border-game-amber transition-colors">
                <FileText className="size-4 text-game-amber" aria-hidden />
                Download resume
              </motion.a>
            </div>
            <div>
              <a
                href={`mailto:${resumeData.contact.email}`}
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                or open your mail app
              </a>
            </div>

            <div className="flex gap-2 mt-4">
              {SOCIALS.map((s) => (
                <motion.a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  whileHover={{ y: -4, rotate: -6 }}
                  whileTap={{ scale: 0.9 }}
                  className="grid place-items-center size-12 rounded-2xl border border-border bg-background hover:border-game-accent transition-colors">
                  <s.icon className="size-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <p className="mt-10 text-center font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
        Thanks for playing · Try ↑ ↑ ↓ ↓ ← → ← → B A
      </p>
    </section>
  );
}
