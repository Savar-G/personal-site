"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import type { BookItem } from "./bookshelf";

type CoverBook = Pick<
  BookItem,
  "slug" | "title" | "author" | "coverImage" | "spineColor" | "inkColor"
>;

/** Inner cover — the element that morphs (layoutId) between shelf and reader. */
export function BookCoverFace({
  book,
  sizes,
  className = "",
}: {
  book: CoverBook;
  sizes: string;
  className?: string;
}) {
  const alt = `Cover of ${book.title} by ${book.author}`;
  return (
    <motion.div
      layoutId={`cover-${book.slug}`}
      className={`book-cover${book.coverImage ? "" : " book-cover--fallback"}${
        className ? ` ${className}` : ""
      }`}
    >
      {book.coverImage ? (
        <Image
          src={book.coverImage}
          alt={alt}
          fill
          sizes={sizes}
          className="book-cover-img"
        />
      ) : (
        // Tasteful, clearly-marked fallback when no real cover art exists.
        <div className="book-cover-fallback" role="img" aria-label={alt}>
          <span className="book-cover-fallback-label">No cover</span>
          <span>
            <span className="book-cover-fallback-title">{book.title}</span>
            <span className="book-cover-fallback-author">{book.author}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

/** Move focus to the previous/next book with Left/Right arrows. */
function onArrowKey(e: KeyboardEvent<HTMLButtonElement>) {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const books = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-book-slug]"),
  );
  const i = books.indexOf(e.currentTarget);
  if (i === -1) return;
  const next = books[i + (e.key === "ArrowRight" ? 1 : -1)];
  if (next) {
    e.preventDefault();
    next.focus();
  }
}

export function BookCover({
  book,
  onSelect,
}: {
  book: CoverBook;
  onSelect: (slug: string) => void;
}) {
  return (
    <motion.button
      type="button"
      data-book-slug={book.slug}
      className="shelf-book"
      style={{ "--spine": book.spineColor } as CSSProperties}
      aria-haspopup="dialog"
      aria-label={`${book.title} by ${book.author}`}
      onClick={() => onSelect(book.slug)}
      onKeyDown={onArrowKey}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      <BookCoverFace book={book} sizes="(max-width: 640px) 88px, 104px" />
    </motion.button>
  );
}
