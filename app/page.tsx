import Link from "next/link";
import { BrandLink } from "@/app/_components/brand-link";
import { LocationTime } from "@/app/_components/location-time";
import {
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  XIcon,
} from "@/app/_components/icons";
import { getAllPostsByYear } from "@/lib/posts";

const projects = [
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
  const yearGroups = getAllPostsByYear();

  return (
    <div className="animate-fade-in">
      <LocationTime />

      <section className="mb-10 sm:mb-12">
        <div className="space-y-4">
          <p className="text-stone-500">
            Studying Mechatronics Engineering and Business @ SFU. Building in
            physical AI.
          </p>
          <p className="text-stone-500">
            Currently a technical product manager at{" "}
            <BrandLink
              href="https://www.telus.com"
              name="TELUS"
              logo="/telus-logo.png"
            />{" "}
            on the Internet Hardware team, and co-founder of{" "}
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

      {yearGroups.length > 0 && (
        <section>
          <div className="stagger-children">
            {yearGroups.map(({ year, posts }) => (
              <section key={year} className="mb-2">
                <h3 className="section-label pb-3 sm:pb-4">{year}</h3>
                <ul>
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${post.slug}`}
                        className="essay-link group block py-3 sm:py-2.5"
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <h2 className="entry-title group-hover:text-stone-600">
                            {post.title}
                          </h2>
                          <span className="entry-meta">
                            {post.readingTime}
                            <span aria-hidden="true"> · </span>
                            <time
                              dateTime={post.date}
                              className="tabular-nums tracking-wide"
                            >
                              {post.formattedDate}
                            </time>
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      )}

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
  );
}
