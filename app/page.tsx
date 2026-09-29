import Link from "next/link";
import { BrandLink } from "@/app/_components/brand-link";
import { EssayList } from "@/app/_components/essay-list";
import { GitHubContributions } from "@/app/_components/github-contributions";
import { LocationTime } from "@/app/_components/location-time";
import {
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  XIcon,
} from "@/app/_components/icons";

const projects = [
  {
    name: "Taskline",
    description:
      "Obsidian task dashboard that turns agent-extracted action items into one execution queue.",
    href: "https://github.com/Savar-G/taskline",
  },
  {
    name: "Unify - Mobile App",
    description: "Mobile app helping newcomers settle in Canada.",
    href: "https://github.com/UnifyCN/mobile-app",
  },
  {
    name: "Unify - Landing Page",
    description: "Public website for Unify.",
    href: "https://github.com/UnifyCN/landing-page",
  },
  {
    name: "Unify - Web App",
    description: "Web app for Unify.",
    href: "https://github.com/UnifyCN/web-app",
  },
  {
    name: "HealthOS",
    description: "Personal health dashboard.",
    href: "https://github.com/Savar-G/HealthOS",
  },
];

const socials = [
  { label: "GitHub", href: "https://github.com/Savar-G", Icon: GitHubIcon },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/savar-gupta",
    Icon: LinkedInIcon,
  },
  { label: "X", href: "https://x.com/savar_gupta", Icon: XIcon },
  { label: "Email", href: "mailto:savar.gupta1922@gmail.com", Icon: MailIcon },
];

export default function Home() {
  // Temporary: the desk replaces this page. Until then it keeps the old
  // column, without the back link that the inner pages have.
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900">
      <div className="h-14 shrink-0" />
      <header className="mx-auto w-full max-w-[44rem] px-5 pt-8 pb-10 sm:px-8 sm:pt-12 sm:pb-14 animate-fade-in">
        <Link
          href="/about"
          className="press text-base font-medium tracking-tight text-stone-900 hover:text-stone-600"
        >
          Savar Gupta
        </Link>
      </header>
      <main className="mx-auto w-full max-w-[44rem] flex-1 px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="animate-fade-in">
          <LocationTime />

          <section className="mb-10 sm:mb-12">
            <div className="space-y-4">
              <p className="text-stone-500">
                Studying Mechatronics Engineering and Business @ SFU. Building at
                the intersection of hardware, software, and AI.
              </p>
              <p className="text-stone-500">
                Currently a technical product manager at{" "}
                <BrandLink
                  href="https://www.telus.com"
                  name="TELUS"
                  logo="/telus-logo.png"
                />{" "}
                on the Internet Hardware team, working in Product &amp; GTM at{" "}
                <BrandLink
                  href="https://www.embedr.app/"
                  name="Embedr"
                  logo="https://www.embedr.app/logo.png"
                />
                , and co-founder of{" "}
                <BrandLink
                  href="https://unifysocial.ca"
                  name="Unify"
                  logo="/app-icon.png"
                />{" "}
                — a mobile app helping newcomers settle in Canada. Writing on
                consumer hardware, AI tools, and what it takes to build things
                people actually want.
              </p>
              <p className="text-stone-500">
                Drawn to the spaces where hardware, software, and good product
                taste collide.
              </p>
            </div>
          </section>

          <GitHubContributions />

          <section className="mb-10 sm:mb-12">
            <h3 className="section-label pb-3 sm:pb-4">Projects</h3>
            <ul className="stagger-children">
              {projects.map((project) => (
                <li key={project.name}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="essay-link group block py-3 sm:py-2.5"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <h2 className="entry-title inline-flex items-center gap-1.5 group-hover:text-stone-600">
                        {project.name}
                        <GitHubIcon className="h-3.5 w-3.5 text-stone-300 transition-colors group-hover:text-stone-500" />
                        <span
                          aria-hidden="true"
                          className="icon-shift text-[12px] leading-none text-stone-300 group-hover:translate-x-0.5 group-hover:text-stone-500"
                        >
                          ↗
                        </span>
                        <span className="sr-only">(opens on GitHub)</span>
                      </h2>
                      <span className="entry-meta">{project.description}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <EssayList />
          </section>

          <footer className="mt-10 border-t border-stone-200 pt-8 sm:mt-12">
            <ul className="flex items-center gap-6">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(href.startsWith("mailto:")
                      ? {}
                      : { target: "_blank", rel: "noopener noreferrer" })}
                    aria-label={label}
                    className="press inline-flex text-stone-400 transition-colors hover:text-stone-900"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </main>
    </div>
  );
}
