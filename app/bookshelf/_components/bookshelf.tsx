"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import { BookCover } from "./book-cover";
import { BookReaderModal } from "./book-reader-modal";
import { NotesFeed } from "./notes-feed";

export type ReadingStatus = "reading" | "read";

export type NoteSection = { heading: string; text: string };

/** A book as the client needs it: serializable fields + pre-rendered notes. */
export type BookItem = {
  slug: string;
  title: string;
  author: string;
  status: ReadingStatus;
  coverImage?: string;
  spineColor: string;
  inkColor?: string;
  category?: string;
  formattedDate?: string;
  rating?: number;
  summary: string;
  takeaways: string[];
  quotes: string[];
  noteSections: NoteSection[]; // plain-text notes for the feed + search
  notes: ReactNode; // server-rendered MDX, or null (rich notes for the reader)
};

type View = "shelf" | "notes";

const SHELF_LABELS: Record<ReadingStatus, string> = {
  reading: "Currently reading",
  read: "Read",
};

function BookshelfSection({
  label,
  books,
  onSelect,
}: {
  label: string;
  books: BookItem[];
  onSelect: (slug: string) => void;
}) {
  return (
    <section className="mb-12 sm:mb-14">
      <h2 className="section-label">{label}</h2>
      <div className="shelf">
        <div className="shelf-row">
          {books.map((book) => (
            <BookCover key={book.slug} book={book} onSelect={onSelect} />
          ))}
        </div>
        <div className="shelf-plinth" aria-hidden="true" />
      </div>
    </section>
  );
}

function ShelfIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="5" height="16" rx="1" />
      <rect x="10" y="4" width="5" height="16" rx="1" />
      <path d="M17 5l3.5 1-3 15" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16M4 12h16M4 19h10" />
    </svg>
  );
}

export function Bookshelf({ items }: { items: BookItem[] }) {
  const [view, setView] = useState<View>("shelf");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  // Remember which spine opened the reader so we can restore focus on close.
  const lastSlugRef = useRef<string | null>(null);

  const selected = items.find((b) => b.slug === selectedSlug) ?? null;

  const notesCount = useMemo(
    () =>
      items.reduce(
        (n, b) =>
          n + b.takeaways.length + b.quotes.length + b.noteSections.length,
        0,
      ),
    [items],
  );

  const open = useCallback((slug: string) => {
    lastSlugRef.current = slug;
    setSelectedSlug(slug);
  }, []);

  const close = useCallback(() => {
    setSelectedSlug(null);
    // Return focus to the originating spine once it's back in the DOM flow.
    const slug = lastSlugRef.current;
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-book-slug="${slug}"]`)
        ?.focus();
    });
  }, []);

  // Deep-link / restore the active view from the URL hash (#notes).
  useEffect(() => {
    if (window.location.hash === "#notes") setView("notes");
  }, []);

  const changeView = useCallback((next: View) => {
    setView(next);
    history.replaceState(null, "", next === "notes" ? "#notes" : "#shelf");
  }, []);

  // Lock body scroll while the reader is open.
  useEffect(() => {
    if (!selectedSlug) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedSlug]);

  // Build ordered shelves from the already-sorted items.
  const order: ReadingStatus[] = ["reading", "read"];
  const shelves = order
    .map((status) => ({
      status,
      label: SHELF_LABELS[status],
      books: items.filter((b) => b.status === status),
    }))
    .filter((shelf) => shelf.books.length > 0);

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div
          className="bookshelf-views"
          role="tablist"
          aria-label="Bookshelf views"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "shelf"}
            className="bookshelf-view-tab"
            onClick={() => changeView("shelf")}
          >
            <ShelfIcon />
            Shelf
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "notes"}
            className="bookshelf-view-tab"
            onClick={() => changeView("notes")}
          >
            <NotesIcon />
            Notes
            <span className="bookshelf-view-count">{notesCount}</span>
          </button>
        </div>

        {view === "shelf" ? (
          <div className="bookshelf animate-fade-in">
            {shelves.map((shelf) => (
              <BookshelfSection
                key={shelf.status}
                label={shelf.label}
                books={shelf.books}
                onSelect={open}
              />
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            <NotesFeed items={items} onSelect={open} />
          </div>
        )}

        <AnimatePresence>
          {selected ? (
            <BookReaderModal
              key={selected.slug}
              book={selected}
              onClose={close}
            />
          ) : null}
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
