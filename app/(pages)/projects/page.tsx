import type { Metadata } from "next";
import { ViewTransition } from "react";
import { GitHubContributions } from "@/app/_components/github-contributions";
import { projects } from "@/lib/projects";
import { ProjectCard } from "./_components/project-card";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Savar Gupta: Unify, Embedr, a health and activity wearable, SFU Rocketry, Taskline, and HealthOS.",
};

// Media-led case cards (decision R-70): the flagship spans the full width,
// the rest sit in a two-column grid. Wider than the other inner pages.
export default function ProjectsPage() {
  return (
    <div className="page-wide animate-fade-in">
      <header className="pt-2 pb-9 sm:pb-11">
        <h1 className="page-title">Projects</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          Things I&apos;ve built, from firmware to phones.
        </p>
      </header>

      <div className="pj-grid">
        {projects.map((project, i) => (
          // The folder's three papers on the desk fly into the first three cards.
          <ViewTransition
            key={project.name}
            name={i < 3 ? `paper-${i + 1}` : undefined}
            share="flight"
          >
            <ProjectCard project={project} index={i} />
          </ViewTransition>
        ))}
      </div>

      <div className="mt-14 sm:mt-16">
        <GitHubContributions />
      </div>
    </div>
  );
}
