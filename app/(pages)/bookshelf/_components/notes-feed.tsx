"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { BookItem } from "./bookshelf";

type NoteKind = "takeaway" | "quote" | "note";

type Entry = {
  key: string;
  kind: NoteKind;
  book: BookItem;
  heading?: string;
  text: string;
};

const TYPE_FILTERS: { id: NoteKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "takeaway", label: "Takeaways" },
  { id: "quote", label: "Quotes" },
  { id: "note", label: "Notes" },
];

const KIND_LABEL: Record<NoteKind, string> = {
  takeaway: "Takeaway",
  quote: "Quote",
  note: "Note",
};

function flatten(items: BookItem[]): Entry[] {
  const out: Entry[] = [];
  for (const book of items) {
    book.takeaways.forEach((t, i) =>
      out.push({ key: `${book.slug}-t${i}`, kind: "takeaway", book, text: t }),
    );
    book.quotes.forEach((q, i) =>
      out.push({ key: `${book.slug}-q${i}`, kind: "quote", book, text: q }),
    );
    book.noteSections.forEach((n, i) =>
      out.push({
        key: `${book.slug}-n${i}`,
        kind: "note",
        book,
        heading: n.heading || undefined,
        text: n.text,
      }),
    );
  }
  return out;
}

function Highlight({ text, q }: { text: string; q: string }): ReactNode {
  const query = q.trim();
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  const ql = query.toLowerCase();
  return (
    <>
      {text
        .split(re)
        .filter((p) => p !== "")
        .map((p, i) =>
          p.toLowerCase() === ql ? (
            <mark key={i} className="notes-hit">
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
    </>
  );
}

export function NotesFeed({
  items,
  onSelect,
}: {
  items: BookItem[];
  onSelect: (slug: string) => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<NoteKind | "all">("all");
  const [cat, setCat] = useState<string>("all");

  const all = useMemo(() => flatten(items), [items]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(items.map((b) => b.category).filter((c): c is string => !!c)),
      ).sort(),
    [items],
  );

  const typeCounts = useMemo(() => {
    const c = { takeaway: 0, quote: 0, note: 0 };
    for (const e of all) c[e.kind] += 1;
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((e) => {
      if (type !== "all" && e.kind !== type) return false;
      if (cat !== "all" && e.book.category !== cat) return false;
      if (needle) {
        const hay = `${e.text} ${e.heading ?? ""} ${e.book.title} ${e.book.author}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, q, type, cat]);

  const bookCount = useMemo(
    () => new Set(filtered.map((e) => e.book.slug)).size,
    [filtered],
  );

  return (
    <div className="notes">
      <div className="notes-controls">
        <div className="notes-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search every note, quote, and book…"
            aria-label="Search notes"
          />
          {q ? (
            <button
              type="button"
              className="notes-search-clear"
              aria-label="Clear search"
              onClick={() => setQ("")}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="notes-chips" role="group" aria-label="Filter by type">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="notes-chip"
              aria-pressed={type === t.id}
              onClick={() => setType(t.id)}
            >
              {t.label}
              <span className="notes-chip-count">
                {t.id === "all"
                  ? all.length
                  : typeCounts[t.id as NoteKind]}
              </span>
            </button>
          ))}
        </div>

        {categories.length > 0 ? (
          <div className="notes-chips" role="group" aria-label="Filter by topic">
            <button
              type="button"
              className="notes-chip"
              aria-pressed={cat === "all"}
              onClick={() => setCat("all")}
            >
              All topics
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="notes-chip"
                aria-pressed={cat === c}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="notes-meta">
        {filtered.length > 0
          ? `${filtered.length} note${filtered.length > 1 ? "s" : ""} · ${bookCount} book${bookCount > 1 ? "s" : ""}`
          : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="notes-feed">
          {filtered.map((e) => (
            <button
              key={e.key}
              type="button"
              className={`note-card note-card--${e.kind}`}
              style={{ "--accent": e.book.spineColor } as CSSProperties}
              onClick={() => onSelect(e.book.slug)}
              aria-label={`${KIND_LABEL[e.kind]} from ${e.book.title} by ${e.book.author}`}
            >
              <span className={`notes-badge notes-badge--${e.kind}`}>
                {KIND_LABEL[e.kind]}
              </span>
              {e.kind === "note" && e.heading ? (
                <h3 className="note-card-heading">
                  <Highlight text={e.heading} q={q} />
                </h3>
              ) : null}
              <p className="note-card-text">
                <Highlight text={e.text} q={q} />
              </p>
              <span className="note-card-foot">
                {e.book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.book.coverImage} alt="" aria-hidden="true" />
                ) : (
                  <span className="note-card-foot-nocover" aria-hidden="true" />
                )}
                <span>
                  <span className="note-card-book">
                    <Highlight text={e.book.title} q={q} />
                  </span>
                  <span className="note-card-author">
                    <Highlight text={e.book.author} q={q} />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="notes-empty">
          <strong>Nothing matches that yet.</strong>
          Try a different word, or clear the filters.
        </div>
      )}
    </div>
  );
}
