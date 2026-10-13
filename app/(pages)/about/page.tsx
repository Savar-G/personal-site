import type { Metadata } from "next";
import { BrandLink } from "@/app/_components/brand-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Savar Gupta studies Mechatronic Systems Engineering and Business at SFU. Co-founder of Unify and Unica Learning.",
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
          Business at Simon Fraser University in Vancouver.
        </p>

        <p>
          I co-founded{" "}
          <BrandLink
            href="https://unifysocial.ca"
            name="Unify"
            logo="/app-icon.png"
          />, an iOS, Android, and web app that helps newcomers settle in
          Canada. With a team of 25+, we&apos;ve grown to 500+ users, 18
          partnerships, $4,000+ in grants, and a few million social
          impressions.
        </p>

        <p>
          Now I&apos;m building in education, exploring how AI will change
          the way we learn. I went through Kumon and later worked as a tutor,
          and from both sides I saw the same problem: learning is too
          standardized. Everyone gets put in the same box, and if you fall
          behind, good luck. AI makes personalization possible, so learning
          can adapt to how each student learns and what they enjoy.
          That&apos;s why I recently co-founded{" "}
          <BrandLink
            href="https://unicalearning.com"
            name="Unica Learning"
            logo="/unica-logo.svg"
          />.
        </p>

        <h2>My Product Philosophies</h2>

        <p>
          <strong>Start with the customer and work backwards.</strong>{" "}
          Almost every product question gets easier once you decide whose
          problem you&apos;re actually solving.
        </p>
        <p>
          <strong>Building beats planning.</strong>{" "}
          You learn more in a week of shipping than a month of strategizing,
          usually about whether the plan was right in the first place.
        </p>
        <p>
          <strong>Stop-gaps aren&apos;t fixes.</strong>{" "}
          It&apos;s easy to patch the symptom and move on. The real work is
          the systems work that addresses the cause.
        </p>
        <p>
          <strong>First principles over precedent.</strong>{" "}
          The way something has always been done isn&apos;t a reason to keep
          doing it. Question whatever assumption you can afford to.
        </p>
      </div>
    </article>
  );
}
