"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/bookshelf", label: "Bookshelf" },
  { href: "https://health.savargupta.com", label: "Health", external: true },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close when the route changes — React's "adjust state during render"
  // pattern, so we avoid a setState-in-effect cascade.
  const [pathAtOpen, setPathAtOpen] = useState(pathname);
  if (pathname !== pathAtOpen) {
    setPathAtOpen(pathname);
    setOpen(false);
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="nav-menu-trigger press"
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Open menu</span>
        <span
          className="nav-menu-icon nav-menu-icon--hamburger"
          aria-hidden="true"
        />
      </button>

      <div
        className="nav-menu-overlay"
        data-open={open}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className="absolute left-0 top-0 flex h-14 items-center px-3">
          <button
            type="button"
            className="nav-menu-trigger nav-menu-trigger--on-dark press"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
          >
            <span className="sr-only">Close menu</span>
            <span
              className="nav-menu-icon nav-menu-icon--close"
              aria-hidden="true"
            />
          </button>
        </div>

        <nav className="flex h-full items-center justify-center">
          <ul className="nav-menu-stagger flex flex-col items-center gap-7">
            {LINKS.map((link) => {
              const isActive = pathname === link.href;
              const className = `nav-menu-link press text-2xl font-medium tracking-tight sm:text-3xl ${
                isActive ? "nav-menu-link--active" : ""
              }`;
              return (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                      tabIndex={open ? 0 : -1}
                    >
                      {link.label}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className="ml-1.5 inline-block h-[0.5em] w-[0.5em] -translate-y-[0.4em] opacity-60"
                      >
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className={className}
                      tabIndex={open ? 0 : -1}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
