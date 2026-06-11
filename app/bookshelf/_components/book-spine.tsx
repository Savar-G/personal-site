"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { motion } from "motion/react";
import type { BookItem } from "./bookshelf";

type BookSpineProps = {
  book: Pick<
    BookItem,
    "slug" | "title" | "author" | "spineColor" | "inkColor"
  >;
  onSelect: (slug: string) => void;
};

/** Move focus to the previous/next spine with Left/Right arrows. */
function onArrowKey(e: KeyboardEvent<HTMLButtonElement>) {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const spines = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-spine]"),
  );
  const i = spines.indexOf(e.currentTarget);
  if (i === -1) return;
  const next = spines[i + (e.key === "ArrowRight" ? 1 : -1)];
  if (next) {
    e.preventDefault();
    next.focus();
  }
}

export function BookSpine({ book, onSelect }: BookSpineProps) {
  const style = {
    "--spine": book.spineColor,
    ...(book.inkColor ? { "--spine-ink": book.inkColor } : {}),
  } as CSSProperties;

  return (
    <motion.button
      type="button"
      data-spine={book.slug}
      className="shelf-spine"
      style={style}
      aria-haspopup="dialog"
      aria-label={`${book.title} by ${book.author}`}
      onClick={() => onSelect(book.slug)}
      onKeyDown={onArrowKey}
      whileHover={{ y: -8, rotate: -1.5 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      <motion.span
        layoutId={`cover-${book.slug}`}
        className="shelf-spine-face"
        style={{ "--spine": book.spineColor } as CSSProperties}
      >
        <span className="shelf-spine-text" aria-hidden="true">
          <span className="shelf-spine-title">{book.title}</span>
          <span className="shelf-spine-author">{book.author}</span>
        </span>
      </motion.span>
    </motion.button>
  );
}
