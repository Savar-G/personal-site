import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const THINGS_DIR = join(process.cwd(), "content", "things");

export type Thing = {
  slug: string;
  name: string;
  /** Short category label, shown under the name when it is not self-evident. */
  type?: string;
  /** Cutout PNG under /public/things (e.g. "/things/kindle-paperwhite.png"). */
  image?: string;
  /** Optional "Since 2021"-style line. Only rendered when present. */
  owned?: string;
  /** The reason, as raw MDX. Empty until it is written. */
  reason: string;
};

/** Explicit display order. Anything not listed falls to the end, alphabetically. */
const ORDER = [
  "kindle-paperwhite",
  "airpods-pro-3",
  "mx-master-3s",
  "iphone-16-pro-max",
  "halos-sleep-mask",
];

export function getAllThings(): Thing[] {
  let files: string[] = [];
  try {
    files = readdirSync(THINGS_DIR).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }

  return files
    .map((filename): Thing => {
      const slug = filename.replace(/\.mdx$/, "");
      const { data, content } = matter(readFileSync(join(THINGS_DIR, filename), "utf8"));

      return {
        slug,
        name: String(data.name ?? slug),
        type: data.type ? String(data.type) : undefined,
        image: data.image ? String(data.image) : undefined,
        owned: data.owned ? String(data.owned) : undefined,
        reason: content.trim(),
      };
    })
    .sort((a, b) => {
      const ia = ORDER.indexOf(a.slug);
      const ib = ORDER.indexOf(b.slug);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
}
