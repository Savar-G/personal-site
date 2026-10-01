"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// The contribution graph fills in week by week, left to right, the first time
// it scrolls into view (R-79). Without JavaScript or with reduced motion it is
// simply there. globals.css draws the "armed" (empty) and "play" states; each
// cell's --d delay comes from its week.
export function GraphReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    el.dataset.reveal = "armed";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.dataset.reveal = "play";
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <div ref={ref} className="contribution-reveal">
      {children}
    </div>
  );
}
