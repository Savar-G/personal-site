import Link from "next/link";
import type { Metadata } from "next";
// import { BrandLink } from "@/app/_components/brand-link";
// Uncomment the BrandLink import above and use <BrandLink href="..." name="..." logo="/logo.png" />
// inside any paragraph to render an inline brand badge (bold name + logo + ↗ arrow).

export const metadata: Metadata = {
  title: "About — Savar Gupta",
  description: "About Savar Gupta.",
};

export default function AboutPage() {
  return (
    <article className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10 mb-8 sm:mb-10">
        <h1 className="page-title">About</h1>
      </header>

      <div className="prose-site stagger-children">
        {/* TODO: Replace bio paragraphs below with your own. Use <BrandLink /> for company callouts. */}
        <p>
          I&apos;m Savar Gupta. [Opening sentence about who you are and what
          you do — replace this.]
        </p>
        <p>
          [Background paragraph — replace this. Where you started, where
          you&apos;ve been, what you&apos;ve built. This is a good spot for{" "}
          <strong>brand callouts</strong> using the <code>BrandLink</code>{" "}
          component.]
        </p>
        <p>
          [Current chapter — replace this. What you&apos;re working on now and
          what you&apos;re paying attention to.]
        </p>
        <p>
          [Through-line — replace this. The thread that connects it all, or
          what you&apos;re building toward.]
        </p>

        <h2>What I Believe</h2>

        <p>
          <strong>[First belief].</strong> [One sentence explaining what you
          mean by it.]
        </p>
        <p>
          <strong>[Second belief].</strong> [One sentence explaining what you
          mean by it.]
        </p>
        <p>
          <strong>[Third belief].</strong> [One sentence explaining what you
          mean by it.]
        </p>
        <p>
          <strong>[Fourth belief].</strong> [One sentence explaining what you
          mean by it.]
        </p>
      </div>

      <div className="mt-16 border-t border-stone-200 pt-10">
        <Link
          href="/savar-gupta-resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="press group inline-flex items-baseline gap-1.5 text-base text-stone-500 hover:text-stone-700"
        >
          <span>Resume</span>
          <span
            aria-hidden="true"
            className="icon-shift text-[12px] leading-none text-stone-300 group-hover:translate-x-0.5 group-hover:text-stone-500"
          >
            ↗
          </span>
        </Link>
      </div>
    </article>
  );
}
