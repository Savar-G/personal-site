"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { spineFontVars } from "./spine-fonts";
import "./shelf.css";

/** A book as the 3D shelf needs it (all serializable). */
export type ShelfBook = {
  slug: string;
  title: string;
  author: string;
  status: "reading" | "read";
  dateRead?: string;
  dateStarted?: string;
  category?: string;
  summary: string;
  takeaways: string[];
  coverImage?: string;
  coverSmall?: string;
  pages: number;
  heightCm: number;
  spineType: string;
  series?: string;
  seriesOrder?: number;
};

type Engine = { select: (slug: string | null) => void; destroy: () => void };

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

function eyebrow(b: ShelfBook) {
  const when =
    b.status === "reading"
      ? `Reading now${b.dateStarted ? ` · since ${fmt(b.dateStarted)}` : ""}`
      : `Read${b.dateRead ? ` · ${fmt(b.dateRead)}` : ""}`;
  return b.category ? `${when} · ${b.category}` : when;
}

// /bookshelf: a wall shelf of hardcovers (shelf-engine.js draws it in WebGL).
// Click a spine and the book comes off the shelf to show its cover; the card
// beside it holds the description and my takeaways. The visually hidden list
// below is the same shelf for screen readers, keyboards, and search engines;
// it becomes the visible page if WebGL is unavailable.
export function Shelf({ books }: { books: ShelfBook[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const book = books.find((b) => b.slug === selected) ?? null;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let engine: Engine | null = null;
    let cancelled = false;
    import("./shelf-engine").then(({ mountShelf }) => {
      if (cancelled) return;
      engine = mountShelf(stage, books, {
        onSelect: (slug: string | null) => {
          setSelected(slug);
          const url = `${location.pathname}${location.search}${slug ? `#${slug}` : ""}`;
          history.replaceState(history.state, "", url);
        },
        onReady: () => {
          const slug = decodeURIComponent(location.hash.slice(1));
          if (slug && books.some((b) => b.slug === slug)) engine?.select(slug);
        },
        onFail: () => setFailed(true),
      });
      engineRef.current = engine;
    });
    return () => {
      cancelled = true;
      engine?.destroy();
      engineRef.current = null;
    };
  }, [books]);

  const select = useCallback((slug: string | null) => {
    engineRef.current?.select(slug);
  }, []);

  const step = (d: number) => {
    if (!book) return;
    const i = books.findIndex((b) => b.slug === book.slug);
    select(books[(i + d + books.length) % books.length].slug);
  };

  return (
    <div className={`shelf-wrap ${spineFontVars}`}>
      <div
        ref={stageRef}
        className={`shelf-stage${failed ? " is-failed" : ""}`}
        tabIndex={0}
        role="group"
        aria-label="Bookshelf. Use the list of books below to open one."
      >
        <p className="shelf-loading" aria-hidden="true">
          Shelving books…
        </p>

        <aside
          className={`shelf-card${book ? " is-open" : ""}`}
          aria-live="polite"
          aria-hidden={!book}
          inert={!book}
        >
          {book && (
            <div key={book.slug} className="shelf-card-body">
              <button
                type="button"
                className="shelf-close"
                onClick={() => select(null)}
                aria-label="Put the book back"
              >
                Esc ✕
              </button>
              <p className="shelf-eyebrow">{eyebrow(book)}</p>
              <h2 className="shelf-title">{book.title}</h2>
              <p className="shelf-author">{book.author}</p>
              <p className="shelf-desc">{book.summary}</p>
              {book.takeaways.length > 0 && (
                <>
                  <h3 className="shelf-eyebrow shelf-sub">My takeaways</h3>
                  <ul className="shelf-takeaways">
                    {book.takeaways.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="shelf-nav">
                <button type="button" onClick={() => step(-1)}>
                  ← Previous
                </button>
                <button type="button" onClick={() => step(1)}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <ol className={failed ? "shelf-list" : "shelf-list sr-only"} aria-label="Books">
        {books.map((b) => (
          <li key={b.slug}>
            <button type="button" onClick={() => select(b.slug)} disabled={failed}>
              <span className="shelf-list-title">{b.title}</span>
              <span className="shelf-list-author"> by {b.author}</span>
            </button>
            <p className="shelf-list-meta">{eyebrow(b)}</p>
            <p>{b.summary}</p>
            {b.takeaways.length > 0 && (
              <ul>
                {b.takeaways.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
