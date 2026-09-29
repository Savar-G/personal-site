"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { mountDesk } from "./engine";
import "./desk.css";

// The desk homepage. The markup is static HTML from markup.ts; engine.js
// brings it to life after mount and cleans up when the route changes.
export function Desk({
  markup,
  className,
}: {
  markup: string;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
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
