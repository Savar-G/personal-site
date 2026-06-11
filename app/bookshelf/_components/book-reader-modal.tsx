"use client";

import { useEffect, useId, useRef } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import type { BookItem } from "./bookshelf";
import { BookCoverFace } from "./book-cover";

type BookReaderModalProps = {
  book: BookItem;
  onClose: () => void;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function BookReaderModal({ book, onClose }: BookReaderModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

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
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
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

  const hasBody =
    book.takeaways.length > 0 || book.quotes.length > 0 || Boolean(book.notes);

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

        {/* Right pane — title, meta, notes, takeaways, quotes. */}
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

          {book.summary ? (
            <p className="reader-summary">{book.summary}</p>
          ) : null}

          {book.takeaways.length > 0 ? (
            <section className="reader-section">
              <h3 className="section-label">Key takeaways</h3>
              <div className="reader-takeaways">
                {book.takeaways.map((t, i) => (
                  <p key={i} className="reader-takeaway">
                    {t}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {book.quotes.length > 0 ? (
            <section className="reader-section">
              <h3 className="section-label">Favorite quotes</h3>
              {book.quotes.map((q, i) => (
                <p key={i} className="reader-quote">
                  {q}
                </p>
              ))}
            </section>
          ) : null}

          {book.notes ? (
            <section className="reader-section">
              <h3 className="section-label">Notes</h3>
              <div className="prose-site reader-prose">{book.notes}</div>
            </section>
          ) : null}

          {!hasBody ? (
            <p className="reader-empty">Currently reading — notes to come.</p>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
