import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GitHubIcon, InstagramIcon, PlayIcon } from "@/app/_components/icons";
import { projects, type Project } from "@/lib/projects";
import { CaseCard, CaseContents } from "../_components/case-client";
import { CountUp } from "../_components/count-up";
import { RailMedia } from "../_components/project-rail";
import "../_components/case.css";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.name, description: project.blurb };
}

const pad = (n: number) => String(n).padStart(2, "0");

function DidList({ items }: { items: Project["did"] }) {
  return (
    <ul className="cs-did">
      {items.map((item) => (
        <li key={item.text}>
          {item.lead && <strong>{item.lead}</strong>} {item.text}
        </li>
      ))}
    </ul>
  );
}

// A project's case study (prototype variant B, R-92): the same card as the
// /projects rail, then the sections beside a contents list that follows the
// reading position. The numbers lead. A section with no content is left out.
export default async function CasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const results = project.results ?? project.stats;

  const sections: { id: string; title: string; body: React.ReactNode }[] = [];
  if (results?.length)
    sections.push({
      id: "results",
      title: "Results",
      body: (
        <>
          <dl className="cs-tiles">
            {results.map((r) => (
              <div key={r.label}>
                <dd>
                  <CountUp value={r.value} />
                </dd>
                <dt>{r.label}</dt>
              </div>
            ))}
          </dl>
          {project.resultsNote && <p className="cs-note">{project.resultsNote}</p>}
        </>
      ),
    });
  if (project.problem?.length)
    sections.push({
      id: "problem",
      title: "The problem",
      body: (
        <div className="cs-prose">
          {project.problem.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ),
    });
  if (project.didGroups?.length || project.did.length)
    sections.push({
      id: "built",
      title: "What I built",
      body: project.didGroups?.length ? (
        <div className="cs-groups">
          {project.didGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <DidList items={group.items} />
            </div>
          ))}
        </div>
      ) : (
        <DidList items={project.did} />
      ),
    });
  const ig = project.instagram;
  if (ig)
    sections.push({
      id: "instagram",
      title: "On Instagram",
      body: (
        <>
          <div className="cs-ig-head">
            <span className="cs-ig-avatar">
              <Image src={ig.avatar} alt="" width={48} height={48} />
            </span>
            <div className="cs-ig-who">
              <strong>@{ig.handle}</strong>
              <span>
                <b>{ig.followers}</b> followers · <b>{ig.posts}</b> posts
              </span>
            </div>
            <a
              href={`https://www.instagram.com/${ig.handle}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-btn cs-btn--primary press"
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              Follow
              <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </div>
          <ul className="cs-ig-grid">
            {ig.items.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={480}
                    height={600}
                    sizes="(max-width: 820px) 31vw, 120px"
                  />
                  {item.reel && <PlayIcon className="cs-ig-reel" />}
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ),
    });
  if (project.approach?.length)
    sections.push({
      id: "approach",
      title: "How I approached it",
      body: (
        <ol className="cs-steps">
          {project.approach.map((step, i) => (
            <li key={step.title}>
              <span aria-hidden="true">{pad(i + 1)}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      ),
    });
  if (project.reflection?.length)
    sections.push({
      id: "reflection",
      title: "Reflection",
      body: (
        <div className="cs-prose">
          {project.reflection.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      ),
    });

  const facts = [
    ["Timeline", project.dates],
    ["Team", project.team],
    ["Stack", project.tools.join(", ")],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <div className="page-wide cs-page animate-fade-in">
      <Link href={`/projects?p=${project.slug}`} className="cs-back press">
        <span aria-hidden="true">←</span> All projects
      </Link>

      <CaseCard className="cs-card">
        <div className="cs-card-text">
          <p className="pj-rail-eyebrow">
            {pad(index + 1)} · {project.category}
          </p>
          <h1 className="cs-name">{project.name}</h1>
          <p className="cs-blurb">{project.blurb}</p>
          <p className="cs-role">
            {project.role}
            {project.dates && ` · ${project.dates}`}
          </p>
          {project.links.length > 0 && (
            <div className="cs-links">
              {project.links.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`cs-btn press${i === 0 ? " cs-btn--primary" : ""}`}
                >
                  {link.kind === "github" && <GitHubIcon className="h-3.5 w-3.5" />}
                  {link.label}
                  {link.kind !== "github" && <span aria-hidden="true">↗</span>}
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              ))}
            </div>
          )}
        </div>
        <RailMedia project={project} />
      </CaseCard>

      {sections.length > 0 ? (
        <div className="cs-body">
          <aside className="cs-aside">
            {sections.length > 1 && (
              <CaseContents sections={sections.map(({ id, title }) => ({ id, title }))} />
            )}
            <dl className="cs-facts">
              {facts.map(([term, value]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
          <div className="cs-main">
            {sections.map(({ id, title, body }) => (
              <section key={id} id={id} className="cs-sec">
                <h2>{title}</h2>
                {body}
              </section>
            ))}
          </div>
        </div>
      ) : (
        <dl className="cs-facts cs-facts--row">
          {facts.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <Link href={`/projects/${next.slug}`} className="cs-next">
        <div>
          <span className="pj-rail-eyebrow">
            Next project · {pad(((index + 1) % projects.length) + 1)}
          </span>
          <strong>{next.name}</strong>
          <p>{next.blurb}</p>
        </div>
        <span className="cs-next-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}
