"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { BookItem } from "./bookshelf";
import { BookCoverFace } from "./book-cover";

type BookReaderModalProps = {
  book: BookItem;
  onClose: () => void;
};

type TabId = "summary" | "takeaways" | "quotes" | "notes";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function BookReaderModal({ book, onClose }: BookReaderModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Which content tabs this book actually has, in reading order.
  const tabs = useMemo(() => {
    const t: { id: TabId; label: string; count?: number }[] = [];
    if (book.summary) t.push({ id: "summary", label: "Summary" });
    if (book.takeaways.length)
      t.push({ id: "takeaways", label: "Takeaways", count: book.takeaways.length });
    if (book.quotes.length)
      t.push({ id: "quotes", label: "Quotes", count: book.quotes.length });
    if (book.notes) t.push({ id: "notes", label: "Notes" });
    return t;
  }, [book]);

  // Lead with the distilled lessons when present, falling back gracefully.
  const defaultTab: TabId = book.takeaways.length
    ? "takeaways"
    : book.quotes.length
      ? "quotes"
      : book.notes
        ? "notes"
        : "summary";
  const [active, setActive] = useState<TabId>(defaultTab);

  // Initial focus + focus trap + Escape, scoped to the dialog.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === first || activeEl === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const metaLine =
    book.status === "reading"
      ? "Currently reading"
      : book.formattedDate
        ? `Read · ${book.formattedDate}`
        : "Read";

  const showTabs = tabs.length > 1;

  return (
    <motion.div
      className="reader-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      onMouseDown={onClose}
    >
      <motion.div
        ref={dialogRef}
        className="reader-spread"
        style={{ "--spine": book.spineColor } as CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        // Don't let clicks inside the spread fall through to the backdrop.
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="reader-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {/* Left pane — the real cover. Shares layoutId with the shelf cover. */}
        <div className="reader-cover-pane">
          <BookCoverFace
            book={book}
            className="reader-cover"
            sizes="(max-width: 640px) 140px, 208px"
          />
        </div>

        {/* Right pane — title, meta, and the tabbed notes. */}
        <motion.div
          className="reader-notes"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.08, duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
        >
          <header className="reader-head">
            {book.category ? (
              <p className="reader-eyebrow">{book.category}</p>
            ) : null}
            <h2 id={titleId} className="reader-title">
              {book.title}
            </h2>
            <p className="reader-byline">{book.author}</p>
            <p className="reader-meta">
              {typeof book.rating === "number" ? (
                <>
                  <span
                    className="reader-rating"
                    aria-label={`Rated ${book.rating} out of 5`}
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className="reader-rating-dot"
                        data-filled={i < book.rating!}
                      />
                    ))}
                  </span>
                  <span className="reader-meta-sep" aria-hidden="true">
                    ·
                  </span>
                </>
              ) : null}
              <span>{metaLine}</span>
            </p>
          </header>

          {tabs.length > 0 ? (
            <>
              {showTabs ? (
                <div className="reader-tabs" role="tablist" aria-label="Notes">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active === t.id}
                      className="reader-tab"
                      onClick={() => setActive(t.id)}
                    >
                      {t.label}
                      {typeof t.count === "number" ? (
                        <span className="reader-tab-count">{t.count}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="reader-panel" role="tabpanel">
                {active === "summary" && book.summary ? (
                  <p className="reader-summary">{book.summary}</p>
                ) : null}

                {active === "takeaways" && book.takeaways.length > 0 ? (
                  <div className="reader-takeaways">
                    {book.takeaways.map((t, i) => (
                      <p key={i} className="reader-takeaway">
                        {t}
                      </p>
                    ))}
                  </div>
                ) : null}

                {active === "quotes" && book.quotes.length > 0 ? (
                  <div>
                    {book.quotes.map((q, i) => (
                      <p key={i} className="reader-quote">
                        {q}
                      </p>
                    ))}
                  </div>
                ) : null}

                {active === "notes" && book.notes ? (
                  <div className="prose-site reader-prose">{book.notes}</div>
                ) : null}
              </div>
            </>
          ) : book.status === "reading" ? (
            <p className="reader-empty">Currently reading — notes to come.</p>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
