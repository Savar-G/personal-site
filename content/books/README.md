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
- **Spine colour** - sampled at runtime from the left edge of the small cover, where a jacket's art wraps onto the spine.
- **spineType** - `"<family> <weight>[ caps]"`. Pick the family closest to the cover lettering. Families: Inter, Oswald, Bebas Neue, Cinzel, Cormorant Garamond, Playfair Display, Libre Baskerville, DM Serif Display ([`spine-fonts.ts`](../../app/(pages)/bookshelf/_components/spine-fonts.ts)). To add a family, add it there with its weights.
- **takeaways** - at most 5 are shown. Wrap each in straight double quotes; use curly quotes inside so the YAML never needs escaping.
- **Body** - anything below the frontmatter is not shown on the site.
