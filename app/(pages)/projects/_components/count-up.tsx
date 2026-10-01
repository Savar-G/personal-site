"use client";

import { useLayoutEffect, useRef } from "react";

// A stat such as "450+" counts up from 0 the first time it scrolls into view
// (R-79). The server renders the real value, so it reads right without
// JavaScript, with reduced motion, and in the flight from the desk; the count
// only starts once the number is on screen.
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const text = el?.firstChild;
    const parts = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
    if (
      !el ||
      !(text instanceof Text) ||
      !parts ||
      !("IntersectionObserver" in window) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const [, before, digits] = parts;
    const to = Number(digits.replaceAll(",", ""));
    let frame = 0;
    // The "+" joins once the count arrives.
    const show = (n: number) => {
      text.data = n === to ? value : `${before}${n.toLocaleString("en-US")}`;
    };

    show(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / 1000);
          show(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      text.data = value;
    };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
