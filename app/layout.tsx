import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  // Only code blocks in essays use it.
  preload: false,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://savargupta.com"),
  title: {
    default: "Savar Gupta",
    template: "%s — Savar Gupta",
  },
  description:
    "Hardware, software, and the craft of building things people actually want. Writing by Savar Gupta — technical product manager at TELUS, co-founder of Unify.",
  openGraph: {
    title: "Savar Gupta",
    description:
      "Hardware, software, and the craft of building things people actually want.",
    url: "https://savargupta.com",
    siteName: "Savar Gupta",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Savar Gupta",
    description:
      "Hardware, software, and the craft of building things people actually want.",
    creator: "@savar_gupta",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
