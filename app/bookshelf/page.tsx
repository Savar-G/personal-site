import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllBooks } from "@/lib/books";
import { Bookshelf, type BookItem } from "./_components/bookshelf";

export const metadata: Metadata = {
  title: "Bookshelf",
  description:
    "Books Savar Gupta has read — with notes, takeaways, and the lines worth keeping.",
};

export default function BookshelfPage() {
  // Server-render each book's MDX notes once, then hand the books (plus the
  // rendered notes) to the client shelf, which owns the animation + modal.
  const items: BookItem[] = getAllBooks().map((book) => ({
    slug: book.slug,
    title: book.title,
    author: book.author,
    status: book.status,
    spineColor: book.spineColor,
    inkColor: book.inkColor,
    category: book.category,
    formattedDate: book.formattedDate,
    rating: book.rating,
    summary: book.summary,
    takeaways: book.takeaways,
    quotes: book.quotes,
    notes: book.content ? <MDXRemote source={book.content} /> : null,
  }));

  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-9 sm:pb-11">
        <h1 className="page-title">Bookshelf</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          Books I&apos;ve read, with the notes and lines worth keeping. Pick a
          spine to open it.
        </p>
      </header>

      <Bookshelf items={items} />
    </div>
  );
}
