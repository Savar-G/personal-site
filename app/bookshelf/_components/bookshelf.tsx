"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import { BookSpine } from "./book-spine";
import { BookReaderModal } from "./book-reader-modal";

export type ReadingStatus = "reading" | "read";

/** A book as the client needs it: serializable fields + pre-rendered notes. */
export type BookItem = {
  slug: string;
  title: string;
  author: string;
  status: ReadingStatus;
  spineColor: string;
  inkColor?: string;
  category?: string;
  formattedDate?: string;
  rating?: number;
  summary: string;
  takeaways: string[];
  quotes: string[];
  notes: ReactNode; // server-rendered MDX, or null
};

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
            <BookSpine key={book.slug} book={book} onSelect={onSelect} />
          ))}
        </div>
        <div className="shelf-plinth" aria-hidden="true" />
      </div>
    </section>
  );
}

export function Bookshelf({ items }: { items: BookItem[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  // Remember which spine opened the reader so we can restore focus on close.
  const lastSlugRef = useRef<string | null>(null);

  const selected = items.find((b) => b.slug === selectedSlug) ?? null;

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
        .querySelector<HTMLElement>(`[data-spine="${slug}"]`)
        ?.focus();
    });
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
        <div className="bookshelf">
          {shelves.map((shelf) => (
            <BookshelfSection
              key={shelf.status}
              label={shelf.label}
              books={shelf.books}
              onSelect={open}
            />
          ))}
        </div>

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
