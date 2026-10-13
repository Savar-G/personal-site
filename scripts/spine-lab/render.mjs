// Usage (from scripts/spine-lab): node render.mjs <slug>... | all
// Renders each book's spine to out/<slug>.png. The spec comes from
// specs/<slug>.yaml when it exists (a draft), else from the `spine` block in
// content/books/<slug>.mdx. If refs/<slug>.{jpg,png,webp} exists, out/<slug>-vs.png
// puts the reference photo (left) beside the render (right) at the same height.
// `all` also writes out/_sheet.png: every spine side by side, as on the shelf.
import { readFileSync, existsSync, readdirSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
const LAB = dirname(fileURLToPath(import.meta.url));
process.chdir(LAB);
const REPO = resolve(LAB, "../..");
const BOOKS = `${REPO}/content/books`;
const tmpMod = `./.spine-paint-${process.pid}.mjs`;
copyFileSync(`${REPO}/app/(pages)/bookshelf/_components/spine-paint.js`, tmpMod);
const { paintSpine } = await import(tmpMod);
rmSync(tmpMod);
const FAMS = JSON.parse(readFileSync("families.json", "utf8"));
if (existsSync("families.d")) for (const k of readdirSync("families.d")) FAMS[k] = readFileSync(`families.d/${k}`, "utf8").trim();
for (const f of readdirSync("fonts-static")) {
  const kebab = f.replace(/\.ttf$/, "").replace(/(-italic)?(-w?\d{3})?$/, "");
  GlobalFonts.registerFromPath(`fonts-static/${f}`, FAMS[kebab] ?? kebab);
}
const known = new Set(GlobalFonts.families.map((f) => f.family));
mkdirSync("out", { recursive: true });

const PX_PER_CM = 64;
const front = (slug) => {
  const p = `${BOOKS}/${slug}.mdx`;
  if (!existsSync(p)) throw new Error(`${slug}: write content/books/${slug}.mdx (with pages and heightCm) before rendering`);
  const fm = yaml.load(readFileSync(p, "utf8").split(/^---$/m)[1]);
  if (!fm.pages || !fm.heightCm) throw new Error(`${slug}: the .mdx needs pages and heightCm`);
  return fm;
};
const missing = new Set();

async function renderSpine(slug) {
  const fm = front(slug);
  const spec = existsSync(`specs/${slug}.yaml`) ? yaml.load(readFileSync(`specs/${slug}.yaml`, "utf8")) : fm.spine;
  if (!spec) return null;
  const T = Math.max(1.45, fm.pages * 0.0058 + 2 * 0.28);
  const L = Math.round(fm.heightCm * PX_PER_CM), S = Math.max(48, Math.round(T * PX_PER_CM));
  const c = createCanvas(S, L), x = c.getContext("2d");
  const images = {};
  for (const m of spec.images ?? []) {
    const f = existsSync(`imgs/${m.src.split("/").pop()}`) ? `imgs/${m.src.split("/").pop()}` : `${REPO}/public${m.src}`;
    images[m.src] = await loadImage(readFileSync(f));
  }
  paintSpine(x, spec, { L, S, images, family: (name) => { if (!known.has(name)) missing.add(name); return `"${name}"`; } });
  // the engine's fold shading: darker at both folds of the wrapped jacket
  const sh = x.createLinearGradient(S, 0, 0, 0);
  sh.addColorStop(0, "rgba(0,0,0,.30)"); sh.addColorStop(0.1, "rgba(0,0,0,0)");
  sh.addColorStop(0.45, "rgba(255,255,255,.07)"); sh.addColorStop(0.9, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.32)");
  x.fillStyle = sh; x.fillRect(0, 0, S, L);
  writeFileSync(`out/${slug}.png`, c.toBuffer("image/png"));
  return c;
}

async function vs(slug, c) {
  const ref = ["jpg", "jpeg", "png", "webp"].map((e) => `refs/${slug}.${e}`).find(existsSync);
  if (!ref) return;
  const img = await loadImage(ref);
  const H = 1200, rw = Math.round((img.width / img.height) * H), sw = Math.round((c.width / c.height) * H);
  const out = createCanvas(rw + sw + 60, H + 40), x = out.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, out.width, out.height);
  x.drawImage(img, 20, 20, rw, H); x.drawImage(c, rw + 40, 20, sw, H);
  writeFileSync(`out/${slug}-vs.png`, out.toBuffer("image/png"));
}

let slugs = process.argv.slice(2);
const all = slugs[0] === "all";
if (all) slugs = readdirSync(BOOKS).filter((f) => f.endsWith(".mdx")).map((f) => f.slice(0, -4));
const done = [];
for (const s of slugs) {
  const c = await renderSpine(s);
  if (!c) { console.log(`${s}: no spec`); continue; }
  await vs(s, c);
  done.push(c);
  console.log(`${s}: out/${s}.png`);
}
if (all && done.length) {
  const H = 600, ws = done.map((c) => Math.round((c.width / c.height) * H));
  const out = createCanvas(ws.reduce((a, b) => a + b + 6, 20), H + 40), x = out.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, out.width, out.height);
  let X = 10; done.forEach((c, i) => { x.drawImage(c, X, 20, ws[i], H); X += ws[i] + 6; });
  writeFileSync("out/_sheet.png", out.toBuffer("image/png"));
  console.log("out/_sheet.png");
}
if (missing.size) console.log("MISSING FONTS (run: node getfont.mjs \"Family\"):", [...missing].join(", "));
