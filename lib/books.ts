import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const BOOKS_DIR = join(process.cwd(), "content", "books");

export type ReadingStatus = "reading" | "read";

export type Book = {
  slug: string;
  title: string;
  author: string;
  status: ReadingStatus;
  /** Muted spine/cover color, any CSS color. Drives the spine and the typographic cover. */
  spineColor: string;
  /** Optional override for ink color on the spine/cover (defaults to a warm cream). */
  inkColor?: string;
  /** Optional cover image path under /public. When absent, a typographic cover is generated. */
  cover?: string;
  /** Optional short topic label, e.g. "Investing". */
  category?: string;
  dateRead?: string; // ISO YYYY-MM-DD
  formattedDate?: string; // "April 29, 2026"
  rating?: number; // 1–5, optional — only rendered when present
  summary: string; // one-line thesis
  takeaways: string[];
  quotes: string[];
  content: string; // raw MDX body (the long-form notes), no frontmatter
};

/** Shelf grouping: "Currently reading" first, then "Read". */
const STATUS_ORDER: Record<ReadingStatus, number> = { reading: 0, read: 1 };

export const SHELF_LABELS: Record<ReadingStatus, string> = {
  reading: "Currently reading",
  read: "Read",
};

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  return [];
}

function normalizeStatus(value: unknown): ReadingStatus {
  return value === "reading" ? "reading" : "read";
}

export function getAllBooks(): Book[] {
  let files: string[] = [];
  try {
    files = readdirSync(BOOKS_DIR).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }

  return files
    .map((filename): Book => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = readFileSync(join(BOOKS_DIR, filename), "utf8");
      const { data, content } = matter(raw);

      const dateRead = data.dateRead ? String(data.dateRead) : undefined;
      const ratingNum =
        typeof data.rating === "number" ? data.rating : undefined;

      return {
        slug,
        title: String(data.title ?? slug),
        author: String(data.author ?? ""),
        status: normalizeStatus(data.status),
        spineColor: String(data.spineColor ?? "#5f5b54"),
        inkColor: data.inkColor ? String(data.inkColor) : undefined,
        cover: data.cover ? String(data.cover) : undefined,
        category: data.category ? String(data.category) : undefined,
        dateRead,
        formattedDate: dateRead ? formatDate(dateRead) : undefined,
        rating: ratingNum,
        summary: String(data.summary ?? ""),
        takeaways: toStringArray(data.takeaways),
        quotes: toStringArray(data.quotes),
        content: content.trim(),
      };
    })
    .sort((a, b) => {
      // Group order first (reading before read)…
      const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (byStatus !== 0) return byStatus;
      // …then most-recently-read first (dated books ahead of undated)…
      if (a.dateRead && b.dateRead) return b.dateRead.localeCompare(a.dateRead);
      if (a.dateRead) return -1;
      if (b.dateRead) return 1;
      // …then alphabetical as a stable fallback.
      return a.title.localeCompare(b.title);
    });
}

export type Shelf = { status: ReadingStatus; label: string; books: Book[] };

/** Books grouped into ordered shelves, preserving the getAllBooks() ordering. */
export function getShelves(): Shelf[] {
  const order: ReadingStatus[] = ["reading", "read"];
  const all = getAllBooks();
  return order
    .map((status) => ({
      status,
      label: SHELF_LABELS[status],
      books: all.filter((b) => b.status === status),
    }))
    .filter((shelf) => shelf.books.length > 0);
}
