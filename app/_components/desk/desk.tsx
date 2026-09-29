"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { mountDesk } from "./engine";
import "./desk.css";

// The desk homepage. The markup is static HTML from markup.ts; engine.js
// brings it to life and cleans up when the route changes. It mounts in a
// layout effect so the desk is scaled and laid out before the browser takes
// the "new" snapshot of a view transition (the flight back from a page).
export function Desk({
  markup,
  className,
}: {
  markup: string;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    if (!ref.current) return;
    return mountDesk(ref.current, {
      navigate: (href) => router.push(href),
      prefetch: (href) => router.prefetch(href),
    });
  }, [router]);

  return (
    <div
      ref={ref}
      className={`desk-page ${className}`}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
