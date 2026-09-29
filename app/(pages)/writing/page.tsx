import type { Metadata } from "next";
import { ViewTransition } from "react";
import { EssayList } from "@/app/_components/essay-list";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Writing by Savar Gupta on consumer hardware, AI tools, and what it takes to build things people actually want.",
};

export default function WritingPage() {
  // The desk's notebook opens into this page (view transition).
  return (
    <ViewTransition name="notebook" share="flight">
      <div className="animate-fade-in">
        <header className="pt-2 pb-9 sm:pb-11">
          <h1 className="page-title">Writing</h1>
          <p className="mt-3 max-w-prose text-stone-500">
            Writing on consumer hardware, AI tools, and what it takes to build
            things people actually want.
          </p>
        </header>

        <EssayList />
      </div>
    </ViewTransition>
  );
}
