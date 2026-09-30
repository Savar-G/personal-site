import Image from "next/image";
import { VideoEmbed } from "@/app/_components/video-embed";
import {
  CameraIcon,
  GitHubIcon,
  HeartbeatIcon,
  ListChecksIcon,
} from "@/app/_components/icons";
import type { Project, ProjectLink, ProjectMedia } from "@/lib/projects";
import { LoopVideo } from "./loop-video";

function Media({ media }: { media: ProjectMedia }) {
  switch (media.kind) {
    case "showcase":
      return (
        <div className="pj-media pj-showcase">
          <figure className="pj-shot pj-shot--site">
            <div className="pj-browser">
              <div className="pj-browser-bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>{media.site.url}</em>
              </div>
              <Image
                src={media.site.src}
                alt={`${media.site.url} landing page`}
                width={media.site.width}
                height={media.site.height}
                sizes="(max-width: 900px) 85vw, 560px"
              />
            </div>
            <figcaption>Landing page</figcaption>
          </figure>
          {media.screens.map((screen) => (
            <figure key={screen.caption} className="pj-shot pj-shot--phone">
              <div className="pj-phone">
                {screen.video ? (
                  <LoopVideo
                    src={screen.video}
                    poster={screen.src}
                    label={`${screen.caption}, screen recording`}
                    width={screen.width}
                    height={screen.height}
                  />
                ) : (
                  <Image
                    src={screen.src}
                    alt={`${screen.caption} screen`}
                    width={screen.width}
                    height={screen.height}
                    sizes="(max-width: 900px) 38vw, 150px"
                  />
                )}
              </div>
              <figcaption>{screen.caption}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "youtube":
      return (
        <div className="pj-media">
          <VideoEmbed
            kind="iframe"
            title={media.title}
            label={`Demo · ${media.title}`}
            poster={`https://i.ytimg.com/vi/${media.id}/maxresdefault.jpg`}
            src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0${
              media.start ? `&start=${media.start}` : ""
            }`}
          />
        </div>
      );
    case "placeholder":
      return (
        <div className="pj-media pj-placeholder">
          <CameraIcon className="h-6 w-6" />
          <span>{media.label}</span>
        </div>
      );
    case "icon":
      return null;
  }
}

function LinkPill({ link }: { link: ProjectLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`pj-link press${link.kind === "site" ? " pj-link--site" : ""}`}
    >
      {link.kind === "github" && <GitHubIcon className="h-3.5 w-3.5" />}
      {link.label}
      {link.kind !== "github" && <span aria-hidden="true">↗</span>}
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const { media } = project;
  const compact = media.kind === "icon";
  const Icon =
    media.kind === "icon"
      ? media.icon === "tasks"
        ? ListChecksIcon
        : HeartbeatIcon
      : null;

  return (
    <article
      className={`pj-card${project.layout ? ` pj-card--${project.layout}` : ""}${
        compact ? " pj-card--compact" : ""
      }`}
    >
      <Media media={media} />

      <div className="pj-body">
        <div className="pj-intro">
          <div className="pj-overline">
            <span className="pj-num">{String(index + 1).padStart(2, "0")}</span>
            <span className={`pj-chip pj-tone--${project.tone}`}>
              {project.category}
            </span>
            {Icon && (
              <span className="pj-icon" aria-hidden="true">
                <Icon className="h-4 w-4" />
              </span>
            )}
          </div>
          <h2 className="pj-name">{project.name}</h2>
          <p className="pj-role">
            <strong>{project.role}</strong>
            {project.dates && <span> · {project.dates}</span>}
          </p>
          <p className="pj-summary">{project.summary}</p>
          {project.stats && (
            <dl className="pj-stats">
              {project.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="pj-detail">
          {project.did.length > 0 && (
            <>
              <h3 className="pj-label">What I did</h3>
              <ul className="pj-did">
                {project.did.map((item) => (
                  <li key={item.text}>
                    {item.lead && <strong>{item.lead} </strong>}
                    {item.text}
                  </li>
                ))}
              </ul>
            </>
          )}
          {project.tools.length > 0 && (
            <ul className="pj-tools" aria-label="Tools">
              {project.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          )}
          {project.links.length > 0 && (
            <div className="pj-links">
              {project.links.map((link) => (
                <LinkPill key={link.href} link={link} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
