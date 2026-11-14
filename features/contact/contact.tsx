import { Reveal } from '@/components/reveal';
import { SectionHeader } from '@/components/section-header';
import { ContactBattle } from '@/features/contact/contact-battle';

export function Contact() {
  return (
    <section id="contact" data-section="contact" className="mx-auto w-full max-w-4xl px-5 sm:px-6 scroll-mt-28">
      <SectionHeader
        index="07"
        kicker="Final boss"
        title="Let's build something together"
        subtitle="Hiring, collaborating, or just want to say hi? Every move below reaches me. Pick your attack."
      />
      <Reveal className="mt-10">
        <ContactBattle />
      </Reveal>
      <p className="mt-10 text-center font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
        Thanks for playing · Try ↑ ↑ ↓ ↓ ← → ← → B A
      </p>
    </section>
  );
}
