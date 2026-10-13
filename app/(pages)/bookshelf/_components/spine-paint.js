// Paints a book's spine from the `spine` block in its frontmatter (the schema is
// in content/books/README.md). Shared by shelf-engine.js and the offline spine
// lab, so it takes a 2D context and a font lookup and never touches the DOM.
//
// The canvas is portrait: width S = spine thickness, height L = spine length,
// head at the top, as the spine stands on the shelf. Positions in the spec are
// fractions: `at` runs head (0) to tail (1); `x` runs left (0) to right (1)
// across the upright spine. Sizes are fractions of the spine's width.

const FONT_RE = /^(.*?)\s+(\d{3})(\s+italic)?$/;

/** "Playfair Display 700 italic" -> { family, weight, italic } */
export function parseFont(s) {
  const m = String(s).match(FONT_RE);
  return m ? { family: m[1], weight: m[2], italic: !!m[3] } : { family: String(s), weight: "400", italic: false };
}

/** The image files a spec draws (under /public), so the caller can load them first. */
export function spineImages(spec) {
  return (spec?.images ?? []).map((m) => m.src);
}

/** Every "family weight style" a spec draws, so the caller can load the faces first. */
export function spineFaces(spec) {
  return (spec?.text ?? []).map((t) => parseFont(t.font ?? "Inter 600"));
}

export function paintSpine(x, spec, { L, S, family, images = {} }) {
  x.save();
  const upright = x.getTransform();
  // Landscape frame: u runs head -> tail (0..L), v runs across from the
  // right edge of the upright spine (the front cover's side) to the left.
  x.translate(S, 0);
  x.rotate(Math.PI / 2);
  const vOf = (xc) => (1 - xc) * S;

  x.fillStyle = spec.bg ?? "#777";
  x.fillRect(0, 0, L, S);

  for (const b of spec.bands ?? []) {
    // whole pixels, so touching bands leave no anti-aliased seam between them
    const u0 = Math.round((b.from ?? 0) * L), u1 = Math.round((b.to ?? 1) * L);
    const v0 = Math.round(vOf(b.right ?? 1)), v1 = Math.round(vOf(b.left ?? 0));
    if (b.stops || b.color2) {
      const g = x.createLinearGradient(u0, 0, u1, 0);
      for (const [at, c] of b.stops ?? [[0, b.color], [1, b.color2]]) g.addColorStop(at, c);
      x.fillStyle = g;
    } else x.fillStyle = b.color;
    x.fillRect(u0, v0, u1 - u0, v1 - v0);
  }

  // Art cropped from a photo of the real spine (a portrait, a logo), stored
  // upright. Images are drawn in the portrait frame, which is the upright view.
  x.save();
  x.setTransform(upright);
  for (const m of spec.images ?? []) {
    const img = images[m.src];
    if (!img) continue;
    x.save();
    x.globalAlpha = m.opacity ?? 1;
    if (m.w) {
      // a mark: centred at (x, at), w wide, at its own aspect ratio
      const w = m.w * S, h = (w * img.height) / img.width;
      x.drawImage(img, (m.x ?? 0.5) * S - w / 2, (m.at ?? 0.5) * L - h / 2, w, h);
    } else {
      // a panel: covers the from..to, left..right box, centred
      const bx = (m.left ?? 0) * S, by = (m.from ?? 0) * L, bw = ((m.right ?? 1) - (m.left ?? 0)) * S, bh = ((m.to ?? 1) - (m.from ?? 0)) * L;
      const k = Math.max(bw / img.width, bh / img.height), w = img.width * k, h = img.height * k;
      x.beginPath(); x.rect(bx, by, bw, bh); x.clip();
      x.drawImage(img, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
      if (m.fade) {
        // melt the panel's tail edge into the spine colour
        const g = x.createLinearGradient(0, by + bh * (1 - m.fade), 0, by + bh);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, m.fadeTo ?? spec.bg ?? "#000");
        x.fillStyle = g; x.fillRect(bx, by + bh * (1 - m.fade), bw, bh * m.fade + 1);
      }
    }
    x.restore();
  }
  x.restore();

  for (const m of spec.marks ?? []) {
    const u = (m.at ?? 0.5) * L, v = vOf(m.x ?? 0.5);
    x.fillStyle = x.strokeStyle = m.color ?? "#fff";
    if (m.shape === "rect") {
      const w = (m.w ?? 0.5) * S, h = (m.h ?? 0.5) * S; // w across, h along
      x.fillRect(u - h / 2, v - w / 2, h, w);
    } else {
      const r = ((m.d ?? 0.4) * S) / 2;
      x.beginPath(); x.arc(u, v, m.shape === "ring" ? r - ((m.line ?? 0.06) * S) / 2 : r, 0, Math.PI * 2);
      if (m.shape === "ring") { x.lineWidth = (m.line ?? 0.06) * S; x.stroke(); } else x.fill();
    }
  }

  for (const t of spec.text ?? []) drawText(x, t, L, S, family);
  x.restore();
}

function drawText(x, t, L, S, family) {
  const { family: fam, weight, italic } = parseFont(t.font ?? "Inter 600");
  const lines = String(t.t ?? "").split("\n");
  const across = t.dir === "across";
  const setFont = (px) => { x.font = `${italic ? "italic " : ""}${weight} ${px}px ${family(fam)}`; };

  // Font size from the cap height the spec asks for.
  setFont(100);
  x.letterSpacing = "0px";
  const capPer100 = x.measureText("H").actualBoundingBoxAscent || 70;
  let px = (((t.size ?? 0.3) * S) / capPer100) * 100;
  const lh = t.lh ?? 1.2;
  const room = across ? (t.max ?? 0.86) * S : (t.max ?? 0.8) * L;
  const widest = () => {
    setFont(px);
    x.letterSpacing = `${(t.track ?? 0) * px}px`;
    return Math.max(...lines.map((s) => x.measureText(s).width));
  };
  const w = widest();
  if (w > room) { px *= room / w; widest(); }
  const cap = (capPer100 * px) / 100, step = px * lh;

  x.save();
  x.globalAlpha = t.opacity ?? 1;
  x.fillStyle = t.color ?? "#fff";
  x.textAlign = t.align ?? "center";
  x.textBaseline = "alphabetic";
  x.translate((t.at ?? 0.5) * L, (1 - (t.x ?? 0.5)) * S);
  // letter-spacing also trails the last glyph; shift centred text back by half
  const trail = x.textAlign === "center" ? ((t.track ?? 0) * px) / 2 : 0;
  // Across text reads left to right on the upright spine; along text reads
  // head to tail with the letters' tops toward the front cover.
  if (across) x.rotate(-Math.PI / 2);
  lines.forEach((s, i) => {
    const off = (i - (lines.length - 1) / 2) * step;
    x.fillText(s, trail, off + cap / 2);
  });
  x.restore();
}
