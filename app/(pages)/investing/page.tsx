import type { Metadata } from "next";
import Link from "next/link";
import { getInvesting } from "@/lib/investing";
import { Holdings } from "./_components/holdings";

export const metadata: Metadata = {
  title: "Investing",
  description:
    "How Savar Gupta started investing in 2020, what he learned from Graham, Buffett, and Munger, and what he holds today.",
};

// Prices refresh once a day (I-4). The desk's piggy bank opens this page (I-1, I-11).
export const revalidate = 86400;

const date = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function InvestingPage() {
  const { accounts, pricesAsOf } = await getInvesting();
  const holdingsAsOf = accounts[0].holdingsAsOf;

  return (
    <div className="page-wide animate-fade-in">
      <div className="max-w-[44rem]">
        <header className="pt-2 pb-9 sm:pb-11">
          <h1 className="page-title">Investing</h1>
        </header>

        {/* Savar's story, approved 2026-10-14 (.design/investing/story-draft.md). */}
        <div className="inv-story space-y-4 leading-relaxed text-stone-600">
          <p>
            I bought my first stocks in early 2020. I wasn&apos;t old enough to open an investment
            account, so I used my parents&apos;. The money was everything I&apos;d saved from a
            minimum wage job.
          </p>
          <p>Then COVID hit. In a matter of months, I watched about 90% of it disappear.</p>
          <p>
            {/* The links open each book on the bookshelf (its #slug selects it). */}
            That loss sent me to learn from the greats. I read{" "}
            <Link href="/bookshelf#the-intelligent-investor">
              <cite>The Intelligent Investor</cite>
            </Link>{" "}
            by Benjamin Graham and{" "}
            <Link href="/bookshelf#the-snowball">
              <cite>The Snowball</cite>
            </Link>
            , and I went through everything Warren
            Buffett and Charlie Munger taught, including every Berkshire Hathaway letter to
            shareholders. I read every Amazon letter too, and that is where my obsession with
            consumer products and building great ones started.
          </p>
          <p>
            Along the way I fell in love with great businesses like Visa, Mastercard, Amazon, and
            Google. I wanted to understand their moats, and how they built products people use
            every day.
          </p>
          <p>
            For a while I planned to go into equity analysis. It came naturally to me. I decided
            against it, because I believe AI is the most revolutionary technology in human history.
            A lot of what equity analysts and investment bankers do today is repetitive work that
            AI will take over.
          </p>
          <p>
            I&apos;d rather be building with AI than competing against it. Product is where I get
            to do that: start with the customer, work backwards, and build the kind of products I
            spent years admiring in those businesses.
          </p>
          <p>
            Today I&apos;m a long-term growth investor. I look for companies with strong moats,
            great products, great management, and fast growth. My TFSA holds about a dozen of
            them, all picked myself. My RRSP holds two ETFs: the S&amp;P 500, and a global small
            cap value fund.
          </p>
        </div>

        <section className="inv-phil" aria-labelledby="inv-phil">
          <h2 id="inv-phil">My investing philosophy</h2>
          <ol className="leading-relaxed text-stone-600">
            <li>
              Great opportunities rarely come, so take them when they do. When there is blood in
              the market, that is usually the best time to buy.
            </li>
            <li>
              Lump sum beats dollar-cost averaging. Dollar-cost averaging works too, but studies
              have found that investing a lump sum gives higher returns.
            </li>
            <li>Companies with a monopoly.</li>
            <li>Pricing power.</li>
            <li>Operating leverage.</li>
            <li>Capital light.</li>
            <li>Embedded into society.</li>
            <li>A long, durable growth runway.</li>
          </ol>
          <p className="leading-relaxed text-stone-600">
            Not every company in my portfolio meets every one of these. My largest positions
            usually meet most of them, if not all. Every other company meets several.
          </p>
        </section>
      </div>

      <Holdings accounts={accounts} />

      <p className="mt-6 max-w-[44rem] text-sm text-stone-400">
        Holdings as of {date(holdingsAsOf)}.{" "}
        {pricesAsOf
          ? `Prices as of ${date(pricesAsOf)}, updated daily.`
          : "Daily prices are unavailable right now, so only all-time returns are shown."}{" "}
        No dollar amounts. The TFSA&apos;s totals come from my broker: the dollar gain over
        the cash I put in, moved daily with prices. Other returns are the return of
        today&apos;s holdings over that period, or since I bought, if that is later.
        All time includes dividends and gains from shares I sold. Each holding&apos;s return is
        in its own currency; account totals are in Canadian dollars.
      </p>
    </div>
  );
}
