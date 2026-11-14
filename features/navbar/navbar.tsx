import type { ComponentType } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NavbarDock, NavbarDockIcon } from '@/features/navbar/navbar-dock';
import { resumeData } from '@/lib/resume';

const SOCIALS = Object.values(resumeData.contact.social).filter((social) => social.navbar);

export function Navbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30">
      <NavbarDock className="z-50 pointer-events-auto relative h-14 p-2 w-fit mx-auto flex gap-2 border bg-card/90 backdrop-blur-3xl shadow-[0_0_10px_3px] shadow-primary/5">
        {resumeData.navbar.map((item) => {
          const isCv = item.href === resumeData.cvUrl;
          return (
            <NavbarItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              newTab={isCv}
              sfx={isCv ? 'coin' : 'whoosh'}
              cv={isCv}
            />
          );
        })}

        <Separator orientation="vertical" className="h-2/3 m-auto w-px bg-border" />

        {SOCIALS.map((social) => (
          <NavbarItem
            key={social.name}
            href={social.url}
            label={social.name}
            icon={social.icon}
            newTab={social.url.startsWith('http')}
          />
        ))}
      </NavbarDock>
    </div>
  );
}

type NavbarItemProps = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  newTab?: boolean;
  sfx?: string;
  /** Marks the resume link, which unlocks an achievement. */
  cv?: boolean;
};

function NavbarItem(props: NavbarItemProps) {
  const { href, label, icon: Icon, newTab, sfx, cv } = props;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          aria-label={label}
          data-sfx={sfx}
          data-cv={cv ? '' : undefined}
          target={newTab ? '_blank' : undefined}
          rel={newTab ? 'noopener noreferrer' : undefined}>
          <NavbarDockIcon className="rounded-3xl cursor-pointer size-full bg-background p-0 text-muted-foreground hover:text-foreground hover:bg-muted backdrop-blur-3xl border border-border transition-colors">
            <Icon className="size-full rounded-sm overflow-hidden object-contain" />
          </NavbarDockIcon>
        </a>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}
