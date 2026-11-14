import type { ComponentType } from 'react';
import { NavbarDock, NavbarDockIcon } from '@/features/navbar/navbar-dock';
import { NavbarHotkeys } from '@/features/navbar/navbar-hotkeys';
import { resumeData } from '@/lib/resume';

const SOCIALS = Object.values(resumeData.contact.social).filter((social) => social.navbar);

/** Game-style hotbar: numbered inventory slots, also reachable with the 1–9 keys. */
export function Navbar() {
  return (
    <nav aria-label="Quick links" className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <NavbarDock className="pointer-events-auto relative h-16 w-fit mx-auto flex items-end gap-2 rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-2 shadow-lg shadow-black/30">
        {resumeData.navbar.map((item, i) => {
          const isCv = item.href === resumeData.cvUrl;
          return (
            <NavbarItem
              key={item.href}
              hotkey={i + 1}
              href={item.href}
              label={item.label}
              icon={item.icon}
              newTab={isCv}
              sfx={isCv ? 'coin' : 'whoosh'}
              cv={isCv}
            />
          );
        })}

        <span aria-hidden className="self-center flex flex-col gap-1">
          <span className="size-1 bg-border" />
          <span className="size-1 bg-border" />
          <span className="size-1 bg-border" />
        </span>

        {SOCIALS.map((social, i) => (
          <NavbarItem
            key={social.name}
            hotkey={resumeData.navbar.length + i + 1}
            href={social.url}
            label={social.name}
            icon={social.icon}
            newTab={social.url.startsWith('http')}
          />
        ))}
      </NavbarDock>
      <NavbarHotkeys />
    </nav>
  );
}

type NavbarItemProps = {
  hotkey: number;
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  newTab?: boolean;
  sfx?: string;
  /** Marks the resume link, which unlocks an achievement. */
  cv?: boolean;
};

function NavbarItem(props: NavbarItemProps) {
  const { hotkey, href, label, icon: Icon, newTab, sfx, cv } = props;

  return (
    <a
      href={href}
      aria-label={label}
      aria-keyshortcuts={String(hotkey)}
      data-hotkey={hotkey}
      data-sfx={sfx}
      data-cv={cv ? '' : undefined}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className="group/slot relative flex rounded-xl focus-visible:outline-none">
      <NavbarDockIcon className="rounded-xl border border-border bg-background/60 text-muted-foreground transition-colors group-hover/slot:border-game-accent group-hover/slot:text-game-accent-text group-hover/slot:bg-game-accent/10 group-hover/slot:shadow-[0_0_16px_-4px_var(--game-accent)] group-focus-visible/slot:border-game-accent group-focus-visible/slot:text-game-accent-text">
        <Icon className="size-full object-contain" />
      </NavbarDockIcon>

      <span
        aria-hidden
        className="absolute top-0.5 left-1 font-pixel text-[8px] leading-none text-muted-foreground/70 group-hover/slot:text-game-accent-text">
        {hotkey}
      </span>

      {/* Pixel label, shown on hover and keyboard focus. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap rounded-lg border-2 border-game-accent bg-card px-2 py-1 font-pixel text-[10px] uppercase tracking-wider text-foreground opacity-0 translate-y-1 transition-[opacity,translate] duration-150 group-hover/slot:opacity-100 group-hover/slot:translate-y-0 group-focus-visible/slot:opacity-100 group-focus-visible/slot:translate-y-0">
        {label}
        <span className="absolute left-1/2 top-full -translate-x-1/2 -mt-1.25 size-2 rotate-45 border-r-2 border-b-2 border-game-accent bg-card" />
      </span>
    </a>
  );
}
