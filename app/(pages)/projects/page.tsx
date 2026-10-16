import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { ProjectRail } from "./_components/project-rail";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Savar Gupta: Unify, Embedr, Podcast Sync, SFU Rocketry, a health and activity wearable, Taskline, and HealthOS.",
};

// One project at a time on a rail, on a page that does not scroll (decisions
// R-90, R-91); each card opens its case study at /projects/<slug>. The full
// detail (ProjectCard) moves to those pages. The GitHub graph component stays
// in app/_components for reuse, but this page no longer shows it.
export default function ProjectsPage() {
  return (
    <div className="page-wide pj-rail-page animate-fade-in">
      <header className="pt-2">
        <h1 className="page-title">Projects</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          Things I&apos;ve built.
        </p>
      </header>

      <ProjectRail projects={projects} />
    </div>
  );
}
