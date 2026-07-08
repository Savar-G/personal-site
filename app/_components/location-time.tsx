"use client";

import { useEffect, useState } from "react";

/**
 * "Vancouver · 8:16:23 pm" — a quiet live clock that ticks in Pacific time,
 * pinned just under the site name on the homepage. Renders the label
 * immediately; the time hydrates on mount (kept out of SSR to avoid a
 * server/client mismatch on the second) and updates once a second.
 */
export function LocationTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Vancouver",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(format.format(new Date()).toLowerCase());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="-mt-7 mb-9 flex items-center gap-1.5 text-[15px] text-stone-400 sm:-mt-10 sm:mb-11">
      <span className="text-stone-500">Vancouver</span>
      <span aria-hidden="true" className="text-stone-300">
        ·
      </span>
      <time
        suppressHydrationWarning
        className="tabular-nums tracking-wide"
        aria-label={time ? `Local time in Vancouver: ${time}` : undefined}
      >
        {time ?? " "}
      </time>
    </p>
  );
}
