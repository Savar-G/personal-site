# Bookshelf content

Each book on `/bookshelf` is one `.mdx` file in this folder, parsed by [`lib/books.ts`](../../lib/books.ts).
The page is a 3D wall shelf ([`shelf-engine.js`](../../app/(pages)/bookshelf/_components/shelf-engine.js)): every book is a hardcover, spine out. Click one and it comes off the shelf to show its cover, with a card for the description and takeaways. Full notes live in the Obsidian vault, not here.

## Add a book

1. Create `content/books/<slug>.mdx`. The filename (minus `.mdx`) becomes the slug:

```mdx
---
title: "The Title"
author: "Author Name"
coverImage: "/books/the-title.jpg"
status: "read"             # "read" | "reading" (reading books stand first on the shelf)
category: "Investing"      # optional short topic label
spineColor: "#5a6470"      # fallback colour when there is no cover
pages: 320                 # page count; sets the book's thickness
heightCm: 23.5             # trim height in cm; sets the book's height
spineType: "Inter 700 caps" # spine lettering, see below
series: "Mistborn"         # optional; books in a series stand together
seriesOrder: 1             # position in the series; printed at the foot of the spine
dateRead: "2026-04-29"     # optional ISO date; read books sort newest first
dateStarted: "2026-10-12"  # optional ISO date; reading books sort newest first
summary: "One or two sentences on what the book is about."
takeaways:                 # 3-5 short bullets in my voice; the card hides the section when empty
  - "First takeaway."
---
```

2. Add two cover files, both JPEG from the same front-cover image (hardcover art if it exists):
   - `public/books/<slug>.jpg`, at most 1400 px tall. Loads when the book is opened.
   - `public/books/sm/<slug>.jpg`, 420 px tall. Paints the shelf and sets the spine colour.

   ```sh
   sips -s format jpeg -s formatOptions 80 -Z 1400 cover.jpg --out public/books/<slug>.jpg
   sips -s format jpeg -s formatOptions 76 -Z 420 cover.jpg --out public/books/sm/<slug>.jpg
   ```

## Field notes

- **Order** - reading books first (newest `dateStarted`), then read books by `dateRead`, newest first. Undated books follow in a fixed shuffle keyed on the slug, so a new undated book lands at a random spot.
- **Series** - books with the same `series` stand together in `seriesOrder`, at the spot where the series' most recent book would stand. A flat stack never splits a series.
- **Spine colour** - sampled at runtime from the left edge of the small cover, where a jacket's art wraps onto the spine.
- **spineType** - `"<family> <weight>[ caps]"`. Pick the family closest to the cover lettering. Families: Inter, Oswald, Bebas Neue, Cinzel, Cormorant Garamond, Playfair Display, Libre Baskerville, DM Serif Display ([`spine-fonts.ts`](../../app/(pages)/bookshelf/_components/spine-fonts.ts)). To add a family, add it there with its weights.
- **spine** - optional; the real spine's design, painted by [`spine-paint.js`](../../app/(pages)/bookshelf/_components/spine-paint.js). When present it replaces the cover-sampled colour and `spineType`. See "Spine spec" below.
- **takeaways** - at most 5 are shown. Wrap each in straight double quotes; use curly quotes inside so the YAML never needs escaping.
- **Body** - anything below the frontmatter is not shown on the site.

## Spine spec

Copy the real spine of the edition whose cover is on the site. Look at the spine standing upright, head at the top. Positions are fractions: `at` runs from the head (0) to the tail (1); `x` runs from the left edge (0) to the right edge (1). Sizes are fractions of the spine's width.

```yaml
spine:
  bg: "#141414"              # base colour
  finish: gloss              # gloss | matte | cloth (default gloss)
  bands:                     # colour blocks, drawn in order over bg
    - { from: 0.9, to: 1, color: "#b31b1b" }                       # full width
    - { from: 0.2, to: 0.205, left: 0.25, right: 0.75, color: "#fff" }  # a short rule
    - { from: 0, to: 0.5, color: "#000", color2: "#333" }           # gradient, head to tail
    - { from: 0, to: 1, stops: [[0, "#a33"], [0.5, "#e93"], [1, "#b43"]] }  # gradient with stops
  images:                    # art cropped from a photo of the real spine, in public/books/spines/
    - { src: "/books/spines/elon-musk-portrait.jpg", from: 0, to: 0.24, fade: 0.3 }  # a panel: fills the box
    - { src: "/books/spines/shoe-dog-swoosh.png", at: 0.47, x: 0.55, w: 0.6 }         # a mark: w wide, own aspect
  marks:                     # simple publisher marks
    - { shape: circle, at: 0.95, x: 0.5, d: 0.45, color: "#fff" }   # d = diameter
    - { shape: ring, at: 0.95, d: 0.45, line: 0.05, color: "#fff" }
    - { shape: rect, at: 0.95, w: 0.5, h: 0.3, color: "#fff" }      # w across, h along
  text:
    - { t: "ELON MUSK", font: "Oswald 600", color: "#fff", at: 0.5, size: 0.5, track: 0.06 }
    - { t: "WALTER\nISAACSON", font: "Inter 600", dir: across, at: 0.07, size: 0.09 }
```

Draw order: bands, images, marks, text. A panel image fills `from`..`to` and `left`..`right` (cropped to cover); `fade` melts its tail end into `fadeTo` (default `bg`). Store images upright, as the spine stands; a PNG with transparency works for a logo. Prefer a cropped real logo to a shape that stands in for one; leave a logo out rather than fake it.

Text fields: `t` (exactly as printed; `\n` breaks lines), `font` (`"<family> <weight>[ italic]"`), `color`, `at` (centre along the spine), `x` (centre across, default 0.5), `size` (height of a capital letter as a fraction of the spine's width, default 0.3), `dir` (`along` reads head to tail, the default; `across` reads left to right, for stacked names and logos), `track` (letter spacing in em), `max` (the longest it may run: along, a fraction of the spine's length, default 0.8; across, a fraction of its width, default 0.86; text shrinks to fit), `lh` (line height, default 1.2), `align` (`center`, `left`, `right` from the `at` point), `opacity`.

Every family a spec uses must be in [`spine-fonts.ts`](../../app/(pages)/bookshelf/_components/spine-fonts.ts), with the weights it uses, as a latin-subset woff2 in `app/(pages)/bookshelf/_fonts/`.
