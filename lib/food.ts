import { readFileSync } from "node:fs";
import { join } from "node:path";

// Savar's restaurants for /food, from his Beli lists. Beli has no API and its
// terms forbid scraping, so the list arrives as a file (Beli's data export or a
// spreadsheet) and `npm run food:import` writes it to content/food/places.json.
// See content/food/README.md.
const FOOD_FILE = join(process.cwd(), "content", "food", "places.json");

/** Beli's two lists: places Savar has ranked, and places he wants to try. */
export type FoodList = "been" | "want";

export type Place = {
  /** Slug of name + city. Stable across imports, and the photo's file name. */
  id: string;
  name: string;
  list: FoodList;
  /** Beli score, 0–10 with one decimal. Ranked places only. */
  score?: number;
  city?: string;
  /** Neighbourhood, as Beli names it. */
  area?: string;
  cuisine?: string;
  /** 1–4, shown as $ to $$$$. */
  price?: number;
  /** YYYY-MM-DD, the day the place went on the list. */
  visited?: string;
  note?: string;
  dishes?: string[];
  /** Savar's own photo under /public/food (e.g. "/food/<id>.webp"). */
  photo?: string;
};

export type Food = {
  /** YYYY-MM-DD of the last import, or undefined before the first one. */
  updated?: string;
  /** Ranked places, best first. */
  been: Place[];
  /** Want-to-try places, A to Z. */
  want: Place[];
};

export function getFood(): Food {
  let raw: { updated?: string; places?: Place[] } = {};
  try {
    raw = JSON.parse(readFileSync(FOOD_FILE, "utf8"));
  } catch {
    return { been: [], want: [] };
  }
  const places = raw.places ?? [];

  return {
    updated: raw.updated || undefined,
    been: places
      .filter((p) => p.list === "been")
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name)),
    want: places
      .filter((p) => p.list === "want")
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export function formatUpdated(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
