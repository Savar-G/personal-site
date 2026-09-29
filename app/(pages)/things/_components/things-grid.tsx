"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";

/** A thing as the client needs it: serializable fields + pre-rendered reason. */
export type ThingItem = {
  slug: string;
  name: string;
  type?: string;
  image?: string;
  owned?: string;
  /** Server-rendered MDX, or null when the reason has not been written yet. */
  reason: ReactNode;
  hasReason: boolean;
};

const IMAGE_SIZES = "(max-width: 560px) 78vw, 288px";

export function ThingsGrid({ items }: { items: ThingItem[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const faceRefs = useRef(new Map<string, HTMLButtonElement>());

  // Escape closes the open tile and returns focus to the object that opened it,
  // matching the reader modal's behaviour on /bookshelf.
  useEffect(() => {
    if (!openSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const face = faceRefs.current.get(openSlug);
      setOpenSlug(null);
      face?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openSlug]);

  function close(slug: string) {
    setOpenSlug(null);
    faceRefs.current.get(slug)?.focus();
  }

  return (
    <ul className="things-grid stagger-children">
      {items.map((thing) => {
        const open = openSlug === thing.slug;
        const panelId = `thing-reason-${thing.slug}`;

        return (
          <li key={thing.slug} className="thing" data-open={open}>
            <button
              type="button"
              ref={(el) => {
                if (el) faceRefs.current.set(thing.slug, el);
                else faceRefs.current.delete(thing.slug);
              }}
              className="thing-face press"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenSlug(open ? null : thing.slug)}
            >
              <span className="thing-figure">
                {thing.image ? (
                  <Image
                    src={thing.image}
                    alt={thing.name}
                    fill
                    sizes={IMAGE_SIZES}
                    className="thing-img"
                  />
                ) : (
                  <span className="thing-figure-fallback" aria-hidden="true" />
                )}
              </span>
              <span className="thing-label">
                <span className="thing-name">{thing.name}</span>
                {thing.type ? (
                  <span className="thing-type">{thing.type}</span>
                ) : null}
              </span>
            </button>

            {/* Sibling of the button, not a child: the reason is prose, which is
                not valid inside <button>. Kept in the DOM so it can cross-fade. */}
            <div className="thing-back" id={panelId} aria-hidden={!open}>
              <div className="thing-back-head">
                {thing.image ? (
                  <span className="thing-back-thumb">
                    <Image
                      src={thing.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="thing-img"
                    />
                  </span>
                ) : null}
                <span>
                  <span className="thing-back-name">{thing.name}</span>
                  {thing.type || thing.owned ? (
                    <span className="thing-back-meta">
                      {[thing.type, thing.owned].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </span>
              </div>

              <div className="thing-back-body">
                {thing.hasReason ? (
                  <div className="prose-site thing-reason">{thing.reason}</div>
                ) : (
                  <p className="thing-empty">Reason not written yet.</p>
                )}
              </div>

              <button
                type="button"
                className="thing-close"
                aria-label={`Close ${thing.name}`}
                tabIndex={open ? 0 : -1}
                onClick={() => close(thing.slug)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
