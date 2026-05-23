import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NavMenu } from "@/app/_components/nav-menu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Savar Gupta",
  description: "Personal site of Savar Gupta — writing and projects.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900">
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <div className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center gap-1 bg-stone-50 px-3">
              <NavMenu />
            </div>
            <header className="mx-auto w-full max-w-[44rem] px-5 pt-8 pb-10 sm:px-8 sm:pt-12 sm:pb-14 animate-fade-in">
              <Link
                href="/"
                className="press text-base font-medium tracking-tight text-stone-900 hover:text-stone-600"
              >
                Savar Gupta
              </Link>
            </header>
            <main className="mx-auto w-full max-w-[44rem] flex-1 px-5 pb-20 sm:px-8 sm:pb-28">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
