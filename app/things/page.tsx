import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllThings } from "@/lib/things";
import { ThingsGrid, type ThingItem } from "./_components/things-grid";

export const metadata: Metadata = {
  title: "Things",
  description:
    "Things Savar Gupta owns and would buy again — and why each one earned the space.",
};

export default function ThingsPage() {
  // Render each reason's MDX once on the server, then hand the things (plus the
  // rendered reason) to the client grid, which owns the reveal.
  const items: ThingItem[] = getAllThings().map((thing) => ({
    slug: thing.slug,
    name: thing.name,
    type: thing.type,
    image: thing.image,
    owned: thing.owned,
    reason: thing.reason ? <MDXRemote source={thing.reason} /> : null,
    hasReason: Boolean(thing.reason),
  }));

  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-9 sm:pb-11">
        <h1 className="page-title">Things I love</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          Things I own and would buy again. No links and no affiliates — just
          what they are, and why each one earned the space. Tap one to read why.
        </p>
      </header>

      <ThingsGrid items={items} />
    </div>
  );
}
