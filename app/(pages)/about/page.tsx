import type { Metadata } from "next";
import Link from "next/link";
import { BrandLink } from "@/app/_components/brand-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Savar Gupta studies Mechatronic Systems Engineering and Business at SFU. Co-founder of Unify and Unica Learning.",
};

export default function AboutPage() {
  return (
    <article className="animate-fade-in">
      <header className="pt-2 pb-8 sm:pb-10">
        <h1 className="page-title">About</h1>
      </header>

      <div className="prose-site stagger-children">
        <p>
          Hey! I&apos;m Savar, I study Mechatronic Systems Engineering and
          Business at Simon Fraser University in Vancouver. I&apos;m a
          creator. I like to find problems and build solutions, and I push
          the limits of AI to do it. Most of what I build is consumer
          products, things people use every day.
        </p>

        <p>
          I co-founded{" "}
          <BrandLink
            href="https://unifysocial.ca"
            name="Unify"
            logo="/app-icon.png"
          />, a registered non-profit, after I saw how hard it was for many
          newcomers to adjust to Canada. Newcomers take two to three times
          longer than Canadians to find a job, and they earn less than
          Canadians with the same credentials. So we built an iOS, Android,
          and web app to help them settle in faster, better informed, and
          with a community around them. With a team of 25+, we&apos;ve grown
          to 650+ users, 18 partnerships, $4,000+ in grants, and a few
          million social impressions.
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

        <h2>Hobbies and Interests</h2>

        <p>
          I read a mix of fiction and nonfiction. My current favorites are{" "}
          <Link href="/bookshelf">
            <em>Red Rising</em>
          </Link>{" "}
          by Pierce Brown and{" "}
          <Link href="/bookshelf">
            <em>The Everything Store</em>
          </Link>{" "}
          by Brad Stone. I also love sports. I played competitive ice hockey
          for over 10 years growing up and basketball all through high
          school, and now I play competitive tennis in local leagues and
          tournaments. Outside of that, I love to{" "}
          <Link href="/travel">travel</Link> and try new food.
        </p>

        <p>
          I&apos;m also a long-time investor. I started in 2020, before I was
          old enough to open my own account, and reading Buffett, Munger, and
          every Berkshire letter turned into an obsession with great businesses
          and their moats. You can see{" "}
          <Link href="/investing">what I hold and how I got started</Link>.
        </p>
      </div>
    </article>
  );
}
