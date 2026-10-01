"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

// The name in the page header links to About. On /about it is the twin of
// "Savar." on the desk, so the name flies from the greeting into this spot and
// back (view transition, R-76). Other pages leave it out of the flight.
export function HeaderName() {
  const onAbout = usePathname() === "/about";
  const link = (
    <Link
      href="/about"
      className="press text-base font-medium tracking-tight text-stone-900 hover:text-stone-600"
    >
      Savar Gupta
    </Link>
  );
  if (!onAbout) return link;
  return (
    <ViewTransition name="savar-name" share="flight">
      {link}
    </ViewTransition>
  );
}
