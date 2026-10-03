#!/usr/bin/env node
// Import Savar's Beli list into content/food/places.json, which /food reads.
//
//   npm run food:import -- <file.csv | file.json> [--list been|want] [--prune] [--dry-run]
//
// Beli has no public API and its terms forbid scraping, so the list comes from
// a file: Beli's own data export, or a spreadsheet saved as CSV. Column names
// are matched loosely (FIELDS below), so either works without editing.
//
// Rows merge into the existing file by name + city. A value in the import
// replaces the stored one; a blank cell keeps it. Photos are never touched:
// they are Savar's own files under public/food, added by hand.
//
//   --list    Which Beli list the file holds, when it has no list column.
//             Without it, a row with a score is "been" and one without is "want".
//   --prune   Drop stored places on the same list that the import leaves out
//             (use with a full export, so places removed on Beli disappear here).
//   --dry-run Print what would change and write nothing.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(process.cwd(), "content", "food", "places.json");

// Column headers each field accepts, compared lowercase with spaces, dashes and
// underscores removed.
const FIELDS = {
  name: ["name", "restaurant", "restaurantname", "business", "businessname", "place", "placename", "title"],
  score: ["score", "rating", "beliscore", "myscore", "myrating"],
  city: ["city", "town", "locationcity"],
  area: ["area", "neighborhood", "neighbourhood", "district"],
  cuisine: ["cuisine", "cuisines", "category", "categories", "type", "tags"],
  price: ["price", "pricerange", "pricelevel", "cost"],
  visited: ["visited", "date", "datevisited", "dateadded", "added", "addedon", "createdat", "created", "ratedon"],
  note: ["note", "notes", "review", "comment", "comments", "description"],
  dishes: ["dishes", "favoritedishes", "favouritedishes", "favorites", "favourites", "whattoorder"],
  list: ["list", "listname", "status", "collection"],
};
const key = (s) => String(s).toLowerCase().replace(/[\s_\-]+/g, "");
const ALIAS = new Map(Object.entries(FIELDS).flatMap(([field, names]) => names.map((n) => [n, field])));

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const input = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--list");
const listOption = option("list");
if (!input || (listOption && !["been", "want"].includes(listOption))) {
  console.error("Usage: npm run food:import -- <file.csv | file.json> [--list been|want] [--prune] [--dry-run]");
  process.exit(1);
}

// ---------- Read the import into plain row objects ----------

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [header = [], ...body] = rows.filter((r) => r.some((c) => c.trim()));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// JSON: an array of rows, or an object whose array values are rows. The key of
// such an array ("been", "want_to_try") hints at the list.
function parseJson(text) {
  const data = JSON.parse(text);
  if (Array.isArray(data)) return data;
  return Object.entries(data).flatMap(([k, v]) =>
    Array.isArray(v) && v.every((r) => r && typeof r === "object") ? v.map((r) => ({ __list: k, ...r })) : [],
  );
}

const text = readFileSync(input, "utf8");
const rows = input.toLowerCase().endsWith(".json") ? parseJson(text) : parseCsv(text);

// ---------- Normalise each row ----------

const slug = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const clean = (v) => (v == null ? "" : String(v).replace(/\s+/g, " ").trim());

function toList(v) {
  const s = key(v);
  if (!s) return undefined;
  return /want|try|bookmark|save|wishlist/.test(s) ? "want" : "been";
}
function toScore(v) {
  const n = parseFloat(clean(v));
  return Number.isFinite(n) ? Math.round(Math.min(10, Math.max(0, n)) * 10) / 10 : undefined;
}
function toPrice(v) {
  const s = clean(v);
  if (/^\$+$/.test(s)) return Math.min(4, s.length);
  const n = parseInt(s, 10);
  return n >= 1 && n <= 4 ? n : undefined;
}
function toDate(v) {
  const s = clean(v);
  if (!s) return undefined;
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // US order, as Beli is a US app
  if (m) return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  const d = new Date(s); // "Sep 3, 2026" and the like, read as a local date
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// A list of dishes: an array, or one cell split on ; | • or new lines, and on
// commas when there is nothing else to split on.
function toDishes(v) {
  if (Array.isArray(v)) return v.map(clean).filter(Boolean);
  const s = v == null ? "" : String(v);
  const parts = s.split(/[;|•\n]/).length > 1 ? s.split(/[;|•\n]/) : s.split(",");
  const dishes = parts.map(clean).filter(Boolean);
  return dishes.length ? dishes : undefined;
}

const problems = [];
const imported = rows.flatMap((row, i) => {
  const f = {};
  for (const [header, value] of Object.entries(row)) {
    const field = header === "__list" ? "list" : ALIAS.get(key(header));
    if (field && f[field] === undefined && clean(value) !== "") f[field] = value;
  }
  const name = clean(f.name);
  if (!name) {
    problems.push(`row ${i + 2}: no name, skipped`);
    return [];
  }
  const score = toScore(f.score);
  const city = clean(f.city) || undefined;
  const place = {
    id: slug(city ? `${name} ${city}` : name),
    name,
    list: listOption ?? toList(f.list) ?? (score === undefined ? "want" : "been"),
    score,
    city,
    area: clean(f.area) || undefined,
    cuisine: clean(f.cuisine) || undefined,
    price: toPrice(f.price),
    visited: toDate(f.visited),
    note: clean(f.note) || undefined,
    dishes: toDishes(f.dishes),
  };
  if (place.list === "been" && place.score === undefined) problems.push(`${name}: ranked but has no score`);
  if (f.visited && !place.visited) problems.push(`${name}: could not read the date "${clean(f.visited)}"`);
  return [place];
});

// ---------- Merge into the stored list ----------

let stored = { updated: null, places: [] };
try {
  stored = JSON.parse(readFileSync(FILE, "utf8"));
} catch {}
const byId = new Map(stored.places.map((p) => [p.id, p]));
const seen = new Set();
let added = 0, changed = 0;

for (const next of imported) {
  if (seen.has(next.id)) {
    problems.push(`${next.name}: listed twice in the import, kept the first`);
    continue;
  }
  seen.add(next.id);
  const prev = byId.get(next.id);
  const merged = { ...prev };
  for (const [k, v] of Object.entries(next)) if (v !== undefined && !(Array.isArray(v) && !v.length)) merged[k] = v;
  if (!prev) added++;
  else if (JSON.stringify(prev) !== JSON.stringify(merged)) changed++;
  byId.set(next.id, merged);
}

const lists = new Set(imported.map((p) => p.list));
const missing = [...byId.values()].filter((p) => lists.has(p.list) && !seen.has(p.id));
if (flag("prune")) missing.forEach((p) => byId.delete(p.id));

// Stable field order and sort, so a re-import of the same file is a no-op diff.
const ORDER = ["id", "name", "list", "score", "city", "area", "cuisine", "price", "visited", "note", "dishes", "photo"];
const places = [...byId.values()]
  .map((p) => Object.fromEntries([...ORDER, ...Object.keys(p).filter((k) => !ORDER.includes(k))].filter((k) => p[k] !== undefined).map((k) => [k, p[k]])))
  .sort((a, b) => (a.list === b.list ? 0 : a.list === "been" ? -1 : 1) || (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name));

const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
const out = JSON.stringify({ updated: today, places }, null, 2) + "\n";

const n = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
console.log(`${input}: ${n(rows.length, "row")} → ${n(seen.size, "place")} (${added} new, ${changed} changed)`);
const count = (l) => places.filter((p) => p.list === l).length;
console.log(`content/food/places.json: ${count("been")} ranked, ${count("want")} want to try`);
if (missing.length) {
  console.log(`${missing.length} stored places are not in this import${flag("prune") ? " and were removed" : " (kept; --prune removes them)"}:`);
  missing.forEach((p) => console.log(`  - ${p.name}${p.city ? `, ${p.city}` : ""}`));
}
if (problems.length) {
  console.log("Check these:");
  problems.forEach((p) => console.log(`  - ${p}`));
}
if (flag("dry-run")) console.log("Dry run: nothing written.");
else writeFileSync(FILE, out);
