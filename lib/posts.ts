import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const POSTS_DIR = join(process.cwd(), "content", "posts");

export type Post = {
  slug: string;
  title: string;
  date: string; // ISO YYYY-MM-DD
  formattedDate: string; // "May 9, 2026"
  readingTime: string; // "3 minutes read"
  content: string; // raw MDX body (no frontmatter)
};

const WORDS_PER_MINUTE = 220;

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function calcReadingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} minute${minutes === 1 ? "" : "s"} read`;
}

export function getAllPosts(): Post[] {
  let files: string[] = [];
  try {
    files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }

  return files
    .map((filename): Post => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = readFileSync(join(POSTS_DIR, filename), "utf8");
      const { data, content } = matter(raw);
      const date = String(data.date ?? "");
      return {
        slug,
        title: String(data.title ?? slug),
        date,
        formattedDate: date ? formatDate(date) : "",
        readingTime: calcReadingTime(content),
        content,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type YearGroup = { year: number; posts: Post[] };

export function getAllPostsByYear(): YearGroup[] {
  const grouped = new Map<number, Post[]>();
  for (const post of getAllPosts()) {
    if (!post.date) continue;
    const year = new Date(`${post.date}T00:00:00Z`).getUTCFullYear();
    const list = grouped.get(year) ?? [];
    list.push(post);
    grouped.set(year, list);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, posts]) => ({ year, posts }));
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
