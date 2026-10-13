import type { Metadata } from "next";
import { getAllBooks } from "@/lib/books";
import { Shelf, type ShelfBook } from "./_components/shelf";

export const metadata: Metadata = {
  title: "Bookshelf",
  description:
    "Books Savar Gupta has read, with a short note on each and his takeaways.",
};

export default function BookshelfPage() {
  const books: ShelfBook[] = getAllBooks().map((b) => ({
    slug: b.slug,
    title: b.title,
    author: b.author,
    status: b.status,
    dateRead: b.dateRead,
    dateStarted: b.dateStarted,
    category: b.category,
    summary: b.summary,
    takeaways: b.takeaways.slice(0, 5),
    coverImage: b.coverImage,
    // Small covers paint the shelf; the full one loads when a book is opened.
    coverSmall: b.coverImage?.replace(/^\/books\//, "/books/sm/"),
    pages: b.pages,
    heightCm: b.heightCm,
    spineType: b.spineType,
    series: b.series,
    seriesOrder: b.seriesOrder,
  }));

  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10">
        <h1 className="page-title">Books I&apos;ve read</h1>
      </header>

      <Shelf books={books} />
    </div>
  );
}
