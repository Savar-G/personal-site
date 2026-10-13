# Bookshelf content

Each book on `/bookshelf` is one `.mdx` file in this folder, parsed by [`lib/books.ts`](../../lib/books.ts).
The page is a 3D wall shelf ([`shelf-engine.js`](../../app/(pages)/bookshelf/_components/shelf-engine.js)): every book is a hardcover, spine out. Click one and it comes off the shelf to show its cover, with a card for the description and takeaways. Full notes live in the Obsidian vault, not here. The page's design rules are in [`.design/bookshelf/DESIGN.md`](../../.design/bookshelf/DESIGN.md).

## Add a book

A book is done when its cover, spine, size, and words are all real: the real jacket, the real spine of that same edition, its real page count and height, and Savar's own takeaways. Never invent any of them. When a real source does not exist, use the fallback the step names and list it in the hand-off (step 9).

The vault is `/Users/savargupta/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Vault` (below: `<vault>`).

1. **Find the vault note.** Run `"<vault>/.claude/scripts/vault-brief" "add <title> to the bookshelf"`, then find the note in `<vault>/40 Sources/Books/`. The filename can carry a subtitle (`Build - An Unorthodox Guide to Making Things Worth Making.md`), so list the folder and match on the title. Read the whole note. Useful frontmatter: `subtitle`, `publisher`, `publishDate`, `isbn13`, `totalPage`, `Reading-Status`, `Date Started`, `Date Completed`.
   - **No note:** ask Savar for the status and dates, and whether he has notes. Do not create a vault note unless he asks. Without his notes, `takeaways: []`.
2. **Check the status.** The shelf holds books he has read or is reading. `Reading-Status: Finished` (or a `Date Completed`) is `status: "read"`; a current read is `status: "reading"`. If the note says `Unread`, `To Read`, or is on a TBR list, stop and ask Savar before you add it. Never default an unclear book to read.
3. **Pick the slug and the edition.**
   - Slug: the short title (no subtitle) in kebab case, keeping a leading "The" when it is part of the title (`the-psychology-of-money`, `build`, `mistborn-the-final-empire`). Check `content/books/` for a clash. The slug names every file below.
   - Edition: the hardcover the note's `isbn13` or `publisher` points to; if that ISBN is a paperback, the same publisher's hardcover of that book; otherwise the first US trade hardcover. If the book was never printed in hardcover, use the edition that exists (the shelf still draws a hardcover). Every later step uses this one edition.
4. **Cover.** Get the front of that edition's dust jacket from the publisher's page, Amazon, or Penguin Random House (WebFetch or Firecrawl), as a flat scan. Never use a 3D mockup, a photo at an angle, or a cover with a sale sticker. The note's `coverUrl` (Open Library) is usually small and may be another edition: use it only when nothing else exists. Save the download in a scratch folder, check its height with `sips -g pixelHeight <file>`, and use the largest real scan you can find (1400 px or more is ideal; `sips -Z` only shrinks). Make two JPEGs from it:
   - `public/books/<slug>.jpg`, at most 1400 px tall. Loads when the book is opened.
   - `public/books/sm/<slug>.jpg`, 420 px tall. Paints the shelf.

   ```sh
   sips -s format jpeg -s formatOptions 80 -Z 1400 <download> --out public/books/<slug>.jpg
   sips -s format jpeg -s formatOptions 76 -Z 420 <download> --out public/books/sm/<slug>.jpg
   ```
5. **Size.** `pages` is the chosen edition's page count from the publisher or Amazon ("Print length"); the note's `totalPage` is only a hint and loses when they differ. `heightCm` is the edition's trim height in cm (Amazon "Dimensions"; the largest dimension of a hardcover is its height). Thickness comes from `pages`.
6. **Words.**
   - `summary`: one plain sentence on what the book is about or argues. Sources: the note (its `subtitle`, any callout or summary Savar wrote), then the publisher's description. Facts only, no praise.
   - `takeaways`: 3 to 5 bullets in Savar's voice (load the `write-as-me` skill), first person, one idea each. Take them only from what Savar wrote: `## Notes & Teachings` in most notes; older notes use `## Summary / Notes`, `## Best Ideas`, or `## Reflection`. Kindle highlights are the author's words, not his takeaways; use one only where his own notes point to it. Never take takeaways from the internet or from memory of the book. If he wrote nothing, `takeaways: []` (the card hides the section).
   - `category`: a short topic label ("Investing", "Biography"); reuse a label other books use.
   - `quotes: []`: keep the field; the shelf does not show it.
7. **Dates and series.** `dateRead` from `Date Completed`, or `dateStarted` from `Date Started` for a book being read. Leave a date out rather than guess it (an undated read book takes a fixed random place on the shelf). Books in a series get `series` and `seriesOrder`. Write `content/books/<slug>.mdx` now, with the frontmatter below; the spine lab needs the file and its `pages` and `heightCm`.
8. **Spine.** Copy the real spine of the same edition into the `spine:` block with the spine lab: follow [`scripts/spine-lab/README.md`](../../scripts/spine-lab/README.md) (photo search, render-and-compare loop, no fake logos, confidence in `scripts/spine-lab/notes/<slug>.md`). `apply.mjs` writes the block; copy any cropped art to `public/books/spines/` yourself. A new font family must also be added to the site (the lab README says how).
9. **Check and hand off.**
   - In the lab: `node render.mjs <slug>` (now rendering from the `.mdx`) must match the reference, and `node render.mjs all` must show the book sitting among the others with nothing odd (wrong height, unreadable text, a colour that is not on the real book). Delete `specs/<slug>.yaml` after applying so `all` renders the real frontmatter.
   - Run `npm run build` and `npm run lint`. Commit on a branch (not `main`), push, and wait for the Vercel preview.
   - Tell Savar: the preview URL, the edition used, the cover source, the spine's confidence and photo source, and every fallback (no vault note, no notes so empty takeaways, a missing date, a spine designed from the cover, a new font family).

```mdx
---
title: "The Title"
author: "Author Name"
coverImage: "/books/the-title.jpg"
status: "read"             # "read" | "reading" (reading books stand first on the shelf)
category: "Investing"      # short topic label
spineColor: "#5a6470"      # fallback colour, used only if the cover fails to load
pages: 320                 # page count of the edition; sets the book's thickness
heightCm: 23.5             # trim height in cm; sets the book's height
spineType: "Inter 700 caps" # fallback lettering, used only without a spine block
spine:                     # the real spine, see "Spine spec" below
  bg: "#141414"
  text:
    - {t: THE TITLE, font: Oswald 600, color: "#fff", at: 0.5, size: 0.5}
series: "Mistborn"         # optional; books in a series stand together
seriesOrder: 1             # position in the series
dateRead: "2026-04-29"     # ISO date; read books sort newest first
dateStarted: "2026-10-12"  # ISO date; reading books sort newest first
summary: "One sentence on what the book is about."
takeaways:                 # 3-5 bullets in Savar's voice, from his vault notes; [] when there are none
  - "First takeaway."
quotes: []
---
```

## Field notes

- **Order** - reading books first (newest `dateStarted`), then read books by `dateRead`, newest first. Undated books follow in a fixed shuffle keyed on the slug, so a new undated book lands at a random spot.
- **Series** - books with the same `series` stand together in `seriesOrder`, at the spot where the series' most recent book would stand. A flat stack never splits a series.
- **spine** - the real spine's design, painted by [`spine-paint.js`](../../app/(pages)/bookshelf/_components/spine-paint.js). Every book should have one. Its `bg` also colours the jacket's back and the board edges.
- **spineColor, spineType** - fallbacks only. Without a `spine` block the shelf paints a plain spine: colours sampled from the cover's left edge and the title in `spineType` (`"<family> <weight>[ caps]"`).
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
