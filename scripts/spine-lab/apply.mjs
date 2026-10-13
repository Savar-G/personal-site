// Usage (from scripts/spine-lab): node apply.mjs [slug...]  (default: every specs/*.yaml)
// Writes each spec into content/books/<slug>.mdx as a `spine:` block after
// `spineType:`, replacing an earlier block. Prints the font faces all specs use.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
const LAB = dirname(fileURLToPath(import.meta.url));
process.chdir(LAB);
const BOOKS = resolve(LAB, "../../content/books");
let slugs = process.argv.slice(2);
if (!slugs.length) slugs = readdirSync("specs").filter((f) => f.endsWith(".yaml")).map((f) => f.slice(0, -5));
const faces = new Map();
for (const s of slugs) {
  const spec = yaml.load(readFileSync(`specs/${s}.yaml`, "utf8"));
  for (const t of spec.text ?? []) {
    const m = String(t.font).match(/^(.*?)\s+(\d{3})(\s+italic)?$/);
    const k = m ? `${m[1]}${m[3] ? " italic" : ""}` : t.font;
    if (!faces.has(k)) faces.set(k, new Set());
    faces.get(k).add(m ? m[2] : "400");
  }
  const block = yaml.dump({ spine: spec }, { flowLevel: 3, lineWidth: 1000, quotingType: '"', forceQuotes: false });
  const p = `${BOOKS}/${s}.mdx`;
  let src = readFileSync(p, "utf8");
  src = src.replace(/^spine:\n(?:[ ].*\n)*/m, "");
  if (!/^spineType:.*\n/m.test(src)) throw new Error(`${s}: no spineType line`);
  src = src.replace(/^(spineType:.*\n)/m, `$1${block}`);
  // round-trip check
  const fm = yaml.load(src.split(/^---$/m)[1]);
  if (JSON.stringify(fm.spine) !== JSON.stringify(spec)) throw new Error(`${s}: round trip differs`);
  writeFileSync(p, src);
  console.log("applied", s);
}
console.log("faces:", [...faces].map(([k, v]) => `${k} [${[...v].sort().join(",")}]`).join("; "));
