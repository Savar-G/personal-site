"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Site = { src: string; url: string; width: number; height: number };
type Team = { src: string; alt: string; width: number; height: number };

// The showcase's wide slot: the landing page in a browser frame, and the team
// photo behind it. The caption is the toggle. On a wide screen the slot moves
// to the photo once, a few seconds after it comes into view, unless the
// visitor has already pointed at it or chosen a view. Phones show the photo as
// its own item at the end of the scrolling strip instead (see ProjectCard).
const AUTO_SWITCH_MS = 6000;

export function ShowcaseSite({ site, team }: { site: Site; team?: Team }) {
  const [view, setView] = useState<"site" | "team">("site");
  const ref = useRef<HTMLElement>(null);
  const settled = useRef(false);

  useEffect(() => {
    const figure = ref.current;
    if (
      !figure ||
      !team ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !matchMedia("(min-width: 900px)").matches
    )
      return;

    let timer: number | undefined;
    const stop = () => {
      settled.current = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (!entry.isIntersecting || settled.current) return;
        timer = window.setTimeout(() => {
          // A choice in the caption also settles the slot.
          if (!settled.current) setView("team");
          stop();
        }, AUTO_SWITCH_MS);
      },
      { threshold: 0.6 },
    );
    observer.observe(figure);
    figure.addEventListener("pointerenter", stop);
    figure.addEventListener("focusin", stop);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      figure.removeEventListener("pointerenter", stop);
      figure.removeEventListener("focusin", stop);
    };
  }, [team]);

  const choose = (next: "site" | "team") => {
    settled.current = true;
    setView(next);
  };

  return (
    <figure ref={ref} className="pj-shot pj-shot--site pj-slot" data-view={view}>
      <div className="pj-slot-stage">
        <div className="pj-browser" inert={view !== "site"}>
          <div className="pj-browser-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <em>{site.url}</em>
          </div>
          <Image
            src={site.src}
            alt={`${site.url} landing page`}
            preload
            width={site.width}
            height={site.height}
            sizes="(max-width: 900px) 85vw, 560px"
          />
        </div>
        {team && (
          <div className="pj-team pj-slot-team" inert={view !== "team"}>
            <Image src={team.src} alt={team.alt} fill sizes="560px" />
          </div>
        )}
      </div>
      <figcaption>
        {team ? (
          <>
            <span className="pj-slot-static">Landing page</span>
            <span className="pj-slot-tabs" role="group" aria-label="Show">
              <button
                type="button"
                aria-pressed={view === "site"}
                onClick={() => choose("site")}
              >
                Landing page
              </button>
              <button
                type="button"
                aria-pressed={view === "team"}
                onClick={() => choose("team")}
              >
                Team
              </button>
            </span>
          </>
        ) : (
          "Landing page"
        )}
      </figcaption>
    </figure>
  );
}
