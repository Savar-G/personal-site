import type { Metadata } from "next";
import { ViewTransition } from "react";
import { GitHubContributions } from "@/app/_components/github-contributions";
import { VideoEmbed } from "@/app/_components/video-embed";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Savar Gupta: Unify, Taskline, Embedr, a health and activity wearable, and HealthOS.",
};

export default function ProjectsPage() {
  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-9 sm:pb-11">
        <h1 className="page-title">Projects</h1>
      </header>

      <div className="stagger-children">
        {projects.map((project, i) => (
          // The folder's three papers on the desk fly into the first three projects.
          <ViewTransition
            key={project.name}
            name={i < 3 ? `paper-${i + 1}` : undefined}
            share="flight"
          >
            <article className="project">
              <h2 className="project-name">{project.name}</h2>
              {(project.role || project.tags) && (
                <p className="entry-meta">
                  {[project.role, project.tags].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="project-description">{project.description}</p>

              {project.links.length > 0 && (
                <ul className="project-links">
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="press group inline-flex items-center gap-1"
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="icon-shift text-[12px] leading-none text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-600"
                        >
                          ↗
                        </span>
                        <span className="sr-only">(opens in new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {project.video && (
                <VideoEmbed
                  kind="iframe"
                  title={project.video.title}
                  poster={`https://i.ytimg.com/vi/${project.video.youtubeId}/maxresdefault.jpg`}
                  src={`https://www.youtube-nocookie.com/embed/${project.video.youtubeId}?autoplay=1&rel=0${
                    project.video.start ? `&start=${project.video.start}` : ""
                  }`}
                />
              )}
            </article>
          </ViewTransition>
        ))}
      </div>

      <div className="mt-12 sm:mt-14">
        <GitHubContributions />
      </div>
    </div>
  );
}
