// Usage (from scripts/spine-lab): node getfont.mjs "Family Name"
// Downloads the Google Fonts latin subset (all weights, upright + italic) into
// fonts-src/, then writes static weight instances into fonts-static/ for Skia.
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
process.chdir(dirname(fileURLToPath(import.meta.url)));
const fam = process.argv[2];
if (!fam) { console.error("usage: node getfont.mjs \"Family Name\""); process.exit(1); }
const kebab = fam.toLowerCase().replace(/\s+/g, "-");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const q = fam.replace(/ /g, "+");
const tries = [
  `${q}:ital,wght@0,100..900;1,100..900`, `${q}:wght@100..900`,
  `${q}:ital,wght@0,400;0,700;1,400;1,700`, `${q}:wght@400;700`, `${q}:ital@0;1`, q,
];
let css = null;
for (const t of tries) {
  const r = await fetch(`https://fonts.googleapis.com/css2?family=${t}&display=swap`, { headers: { "User-Agent": UA } });
  if (r.ok) { css = await r.text(); break; }
}
if (!css) {
  // the range may be narrower than 100..900: ask for each weight separately
  const ws = [];
  for (let w = 100; w <= 900; w += 100) {
    const r = await fetch(`https://fonts.googleapis.com/css2?family=${q}:wght@${w}`, { headers: { "User-Agent": UA } });
    if (r.ok) ws.push(await r.text());
  }
  css = ws.join("\n") || null;
}
if (!css) { console.error("not found on Google Fonts:", fam); process.exit(2); }
mkdirSync("fonts-src", { recursive: true });
mkdirSync("families.d", { recursive: true }); writeFileSync(`families.d/${kebab}`, fam);
const blocks = css.split("/* ").filter((b) => b.startsWith("latin */"));
const seen = new Set();
for (const b of blocks) {
  const url = b.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  const style = b.match(/font-style:\s*(\w+)/)?.[1];
  const weight = b.match(/font-weight:\s*([\d ]+)/)?.[1].trim().replace(" ", "_");
  if (!url || seen.has(url)) continue; seen.add(url);
  const name = `${kebab}${style === "italic" ? "-italic" : ""}${weight.includes("_") ? "" : "-w" + weight}`;
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(`fonts-src/${name}.woff2`, buf);
  const out = execFileSync(".venv/bin/python", ["instance.py", `fonts-src/${name}.woff2`, "fonts-static", name]).toString().trim();
  console.log(`${name}.woff2 (${weight}, ${style}) -> ${out}`);
}
