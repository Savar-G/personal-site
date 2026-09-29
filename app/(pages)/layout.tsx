import Link from "next/link";

// Every page except the desk. No menu: the way out is back to the desk, and
// the name opens About.
export default function PagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900">
      <div className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center bg-stone-50 px-3">
        <Link href="/" className="desk-back press">
          <span aria-hidden="true">←</span> back to the desk
        </Link>
      </div>
      <header className="mx-auto w-full max-w-[44rem] px-5 pt-8 pb-10 sm:px-8 sm:pt-12 sm:pb-14 animate-fade-in">
        <Link
          href="/about"
          className="press text-base font-medium tracking-tight text-stone-900 hover:text-stone-600"
        >
          Savar Gupta
        </Link>
      </header>
      <main className="mx-auto w-full max-w-[44rem] flex-1 px-5 pb-20 sm:px-8 sm:pb-28">
        {children}
      </main>
    </div>
  );
}
