import type { Metadata } from "next";
import { getAllBooks } from "@/lib/books";
import { Shelf, type ShelfBook } from "./_components/shelf";

export const metadata: Metadata = {
  title: "Bookshelf",
  description:
    "Books Savar Gupta has read, with a short note on each and his takeaways.",
};

const NUMBERS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

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
  }));
  const reading = books.filter((b) => b.status === "reading").length;

  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10">
        <h1 className="page-title">Bookshelf</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          {books.length} books. {NUMBERS[reading] ?? reading} on the nightstand.
          Pull one off the shelf to see what stuck.
        </p>
      </header>

      <Shelf books={books} />
    </div>
  );
}
