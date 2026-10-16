"use client";

import { useEffect, useRef, useState } from "react";

// The case study card: its loops play while the card is on screen. A video
// someone paused stays paused, and nothing plays with reduced motion.
export function CaseCard({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const videos = card.querySelectorAll<HTMLVideoElement>("video[data-rail-loop]");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          const video = target as HTMLVideoElement;
          if (isIntersecting && !video.dataset.userPaused) video.play().catch(() => {});
          else if (!video.paused) video.pause();
        }),
      { threshold: 0.35 },
    );
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  return (
    <article ref={ref} className={className}>
      {children}
    </article>
  );
}

// The contents list beside the sections. The section whose top has passed
// the upper third of the window is marked, and the line fills as you read.
export function CaseContents({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const fill = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(0);

  useEffect(() => {
    const els = sections
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    let queued = false;
    const paint = () => {
      queued = false;
      const line = innerHeight * 0.35;
      const rects = els.map((el) => el.getBoundingClientRect());
      let current = 0;
      rects.forEach((r, i) => {
        if (r.top < line) current = i;
      });
      setOn(current);
      const first = rects[0].top;
      const last = rects[rects.length - 1].bottom;
      const t = Math.min(1, Math.max(0, (line - first) / Math.max(1, last - first)));
      if (fill.current) fill.current.style.transform = `scaleY(${t.toFixed(4)})`;
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(paint);
      }
    };
    paint();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return (
    <nav className="cs-toc" aria-label="On this page">
      <ol>
        <span ref={fill} className="cs-toc-fill" aria-hidden="true" />
        {sections.map(({ id, title }, i) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={i === on ? "is-on" : undefined}
              aria-current={i === on ? "location" : undefined}
            >
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
