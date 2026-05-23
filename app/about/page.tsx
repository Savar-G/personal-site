import Link from "next/link";
import type { Metadata } from "next";
import { BrandLink } from "@/app/_components/brand-link";

export const metadata: Metadata = {
  title: "About — Savar Gupta",
  description:
    "Savar Gupta — product manager, builder, student at SFU. Currently at TELUS Internet Hardware and co-founder of Unify.",
};

export default function AboutPage() {
  return (
    <article className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10 mb-8 sm:mb-10">
        <h1 className="page-title">About</h1>
      </header>

      <div className="prose-site stagger-children">
        <p>
          I&apos;m Savar Gupta. I study Mechatronic Systems Engineering and
          Business at Simon Fraser University in Vancouver, and right now
          I&apos;m a Technical Product Manager co-op at{" "}
          <BrandLink
            href="https://www.telus.com"
            name="TELUS"
            logo="/telus-logo.png"
          />{" "}
          on the Internet Hardware team — working on how Wi-Fi gateways,
          access points, and the software stack behind them actually serve
          customers.
        </p>

        <p>
          On the side I co-founded{" "}
          <BrandLink
            href="https://unifysocial.ca"
            name="Unify"
            logo="/app-icon.png"
          />, a mobile app that helps newcomers settle in Canada — community,
          settlement guidance, and a RAG-powered AI companion that keeps
          itself current by scraping Government of Canada sources daily. 250+
          users, 16 partnerships, and a few million social impressions in.
        </p>

        <p>
          Before product, I was the hardware kid — PCB design in KiCad,
          embedded firmware in C, a stretch on SFU Rocketry hot-firing a
          LOX/Ethanol engine, and a multi-sensor water testing prototype that
          hit 90%+ accuracy across pH, turbidity, and temperature. That
          part of me hasn&apos;t gone anywhere — it&apos;s just learned to
          share the room with software.
        </p>

        <p>
          What I&apos;m paying attention to now: consumer hardware, AI tools
          (mostly Claude Code), product management as a craft, and personal
          finance. I write about all four occasionally on X as{" "}
          <a
            href="https://x.com/SmartCompounder"
            target="_blank"
            rel="noopener noreferrer"
          >
            @SmartCompounder
          </a>
          . Long term I want to be building hardware that meets software
          where it&apos;s actually going.
        </p>

        <h2>What I Believe</h2>

        <p>
          <strong>Start with the customer and work backwards.</strong>{" "}
          Almost every product question gets easier once you decide whose
          problem you&apos;re actually solving.
        </p>
        <p>
          <strong>Building beats planning.</strong>{" "}
          You learn more in a week of shipping than a month of strategizing —
          usually about whether the plan was right in the first place.
        </p>
        <p>
          <strong>Stop-gaps aren&apos;t fixes.</strong>{" "}
          It&apos;s easy to patch the symptom and move on. The systems work —
          the part that addresses the cause — is the real work.
        </p>
        <p>
          <strong>First principles over precedent.</strong>{" "}
          The way something has always been done isn&apos;t a reason to keep
          doing it. Question whatever assumption you can afford to.
        </p>
      </div>

      <div className="mt-16 border-t border-stone-200 pt-10">
        <Link
          href="/Savar_Gupta_Resume.pdf"
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
