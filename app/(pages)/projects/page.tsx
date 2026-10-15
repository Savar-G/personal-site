import type { Metadata } from "next";
import { GitHubContributions } from "@/app/_components/github-contributions";
import { projects } from "@/lib/projects";
import { ProjectRail } from "./_components/project-rail";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Savar Gupta: Unify, Embedr, Podcast Sync, SFU Rocketry, a health and activity wearable, Taskline, and HealthOS.",
};

// One project at a time on a rail (decision R-90); each card opens its case
// study at /projects/<slug>. The full detail (ProjectCard) moves to those pages.
export default function ProjectsPage() {
  return (
    <div className="page-wide animate-fade-in">
      <header className="pt-2 pb-2">
        <h1 className="page-title">Projects</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          Things I&apos;ve built.
        </p>
      </header>

      <ProjectRail projects={projects} />

      <div className="mt-10 sm:mt-12">
        <GitHubContributions />
      </div>
    </div>
  );
}
