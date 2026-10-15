"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, ViewTransition, useEffect, useRef, useState } from "react";
import { VideoEmbed } from "@/app/_components/video-embed";
import type { Project, ProjectMedia } from "@/lib/projects";
import { CountUp } from "./count-up";
import { mountRail } from "./rail-engine";
import "./rail.css";

const pad = (n: number) => String(n).padStart(2, "0");

// A muted loop that the rail plays while its card is in the middle. Sound and
// pause buttons sit in the corner; a video someone paused stays paused.
function RailVideo({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const video = ref.current;
    if (!video) return;
    delete video.dataset.userPaused;
    video.play().catch(() => {});
  };

  return (
    <div className="pj-rail-video">
      <video
        ref={ref}
        src={src}
        poster={poster}
        aria-label={title}
        muted={muted}
        loop
        playsInline
        preload="none"
        data-rail-loop=""
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="pj-rail-ctls">
        <button
          type="button"
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          onClick={() => {
            setMuted(!muted);
            if (muted) play();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4z" fill="currentColor" />
            {muted ? (
              <path d="M15.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M15.2 9.2a4 4 0 0 1 0 5.6M17.6 6.8a7.4 7.4 0 0 1 0 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={() => {
            const video = ref.current;
            if (!video) return;
            if (video.paused) play();
            else {
              video.dataset.userPaused = "1";
              video.pause();
            }
          }}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {playing ? (
              <path d="M5 3.5h2v9H5zm4 0h2v9H9z" fill="currentColor" />
            ) : (
              <path d="M5.5 3.2v9.6L13 8z" fill="currentColor" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

const SIZES = "(max-width: 820px) 86vw, 600px";

function RailMedia({ project }: { project: Project }) {
  const media: ProjectMedia = project.media;
  switch (media.kind) {
    case "showcase":
      return (
        <div className="pj-rail-media pj-rail-phones">
          {media.screens.map((screen) => (
            <figure key={screen.caption}>
              {screen.video ? (
                <video
                  src={screen.video}
                  poster={screen.src}
                  aria-label={`${screen.caption}, screen recording`}
                  width={screen.width}
                  height={screen.height}
                  muted
                  loop
                  playsInline
                  preload="none"
                  data-rail-loop=""
                />
              ) : (
                <Image
                  src={screen.src}
                  alt={`${screen.caption} screen`}
                  width={screen.width}
                  height={screen.height}
                  sizes="150px"
                />
              )}
              <figcaption>{screen.caption}</figcaption>
            </figure>
          ))}
        </div>
      );
    case "youtube":
      return (
        <div className="pj-rail-media pj-rail-player">
          <VideoEmbed
            kind="iframe"
            title={media.title}
            poster={`https://i.ytimg.com/vi_webp/${media.id}/maxresdefault.webp`}
            sizes={SIZES}
            src={`https://www.youtube-nocookie.com/embed/${media.id}?autoplay=1&rel=0${
              media.start ? `&start=${media.start}` : ""
            }`}
          />
        </div>
      );
    case "video":
      return (
        <div className="pj-rail-media pj-rail-player">
          <RailVideo src={media.src} poster={media.poster} title={media.title} />
        </div>
      );
    case "image":
      return (
        <div
          className="pj-rail-media pj-rail-photo"
          style={{ aspectRatio: `${media.width} / ${media.height}` }}
        >
          <Image src={media.src} alt={media.alt} fill sizes={SIZES} />
        </div>
      );
    case "placeholder":
    case "icon":
      // No real photo or recording yet: the tools stand in.
      return (
        <div className="pj-rail-media pj-rail-tools">
          <p>Built with</p>
          <ul>
            {project.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      );
  }
}

function RailCard({ project, index }: { project: Project; index: number }) {
  // The card shows the project's own site; GitHub only when there is no site.
  const sites = project.links.filter((link) => link.kind === "site");
  const links = sites.length ? sites : project.links.slice(0, 1);

  return (
    <article className="pj-rail-card" aria-labelledby={`pj-${project.slug}`}>
      <div className="pj-rail-text">
        <p className="pj-rail-eyebrow">
          {pad(index + 1)} · {project.category}
        </p>
        <h2 id={`pj-${project.slug}`} className="pj-rail-name">
          {project.name}
        </h2>
        <p className="pj-rail-blurb">{project.blurb}</p>
        <p className="pj-rail-role">
          {project.role}
          {project.dates && ` · ${project.dates}`}
        </p>
        {project.stats && (
          <dl className="pj-rail-stats">
            {project.stats.map((stat) => (
              <div key={stat.label}>
                <dd>
                  <CountUp value={stat.value} />
                </dd>
                <dt>{stat.label}</dt>
              </div>
            ))}
          </dl>
        )}
        <div className="pj-rail-actions">
          {/* Its hit area covers the whole card (see .pj-rail-case::after). */}
          <Link href={`/projects/${project.slug}`} className="pj-rail-case">
            Case study <span aria-hidden="true">→</span>
            <span className="sr-only">: {project.name}</span>
          </Link>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pj-rail-ext"
            >
              {link.label} <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens in new tab)</span>
            </a>
          ))}
        </div>
      </div>
      <RailMedia project={project} />
    </article>
  );
}

// One project at a time (R-90): the stage pins, and scrolling down pans a row
// of cards sideways. The engine (rail-engine.ts) moves the cards; this renders
// them and the counter. With reduced motion the cards sit in a plain list.
export function ProjectRail({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => (ref.current ? mountRail(ref.current) : undefined), []);

  return (
    <section
      ref={ref}
      className="pj-rail"
      aria-label="Projects"
      style={{ "--n": projects.length } as React.CSSProperties}
    >
      <div className="pj-rail-stage">
        <div className="pj-rail-track">
          {projects.map((project, i) => {
            const card = <RailCard project={project} index={i} />;
            // The folder's three papers on the desk fly into the first three cards.
            return i < 3 ? (
              <ViewTransition
                key={project.slug}
                name={`paper-${i + 1}`}
                share="flight"
              >
                {card}
              </ViewTransition>
            ) : (
              <Fragment key={project.slug}>{card}</Fragment>
            );
          })}
        </div>
        <div className="pj-rail-foot">
          <button type="button" className="pj-rail-arrow press" aria-label="Previous project">
            ←
          </button>
          <span className="pj-rail-progress" aria-hidden="true">
            <i />
          </span>
          <span className="pj-rail-count" aria-hidden="true">
            01 / {pad(projects.length)}
          </span>
          <button type="button" className="pj-rail-arrow press" aria-label="Next project">
            →
          </button>
        </div>
      </div>
      {projects.map((project) => (
        <span key={project.slug} className="pj-rail-snap" aria-hidden="true" />
      ))}
    </section>
  );
}
