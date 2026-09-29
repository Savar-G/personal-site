import { Courier_Prime, Pixelify_Sans, Reenie_Beanie } from "next/font/google";
import { Desk } from "@/app/_components/desk/desk";
import { deskMarkup, type DeskEssay } from "@/app/_components/desk/markup";
import { getAllPosts } from "@/lib/posts";

// Small instructional text, the polaroid handwriting, and the RAZR screen.
const courierPrime = Courier_Prime({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-courier-prime",
});
const reenieBeanie = Reenie_Beanie({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-reenie-beanie",
});
const pixelifySans = Pixelify_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-pixelify-sans",
});

// The open notebook shows the first sentence of an essay's first paragraph.
function teaser(content: string) {
  const paragraph =
    content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => /^[A-Za-z"“']/.test(p)) ?? "";
  const plain = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "");
  const sentence = plain.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? plain;
  return sentence.length > 140
    ? `${sentence.slice(0, 137).trimEnd()}…`
    : sentence;
}

export default function Home() {
  const essays: DeskEssay[] = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.formattedDate,
    minutes: parseInt(post.readingTime, 10),
    teaser: teaser(post.content),
  }));

  return (
    <Desk
      markup={deskMarkup(essays)}
      className={`${courierPrime.variable} ${reenieBeanie.variable} ${pixelifySans.variable}`}
    />
  );
}
