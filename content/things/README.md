# Things I love

Each object on `/things` is one `.mdx` file in this folder, parsed by [`lib/things.ts`](../../lib/things.ts).
Same shape as `content/books/` — frontmatter for structured fields, the body for prose.

## Add a thing

Create `content/things/<slug>.mdx`. The filename (minus `.mdx`) becomes the slug.

```mdx
---
name: "Kindle Paperwhite"
type: "E-reader"                    # optional; shown under the name
image: "/things/kindle-paperwhite.png"
owned: "Since 2021"                 # optional; only rendered when present
---

The reason you love it, in your own words.
```

Nothing else is needed. Adding an object is one file plus one image.

### Field notes

- **name** — the product name, as you would say it out loud.
- **type** — a short category label. Use it when the name alone does not say what the thing is ("Paperlike" needs one, "Kindle Paperwhite" barely does).
- **image** — a cutout PNG in `/public/things/`, transparent background. See below.
- **owned** — optional. Only write it if it is true; do not guess a date.
- **body** — the reason. It renders as Markdown with the site's `.prose-site` styling. A tile with no body shows a muted "Reason not written yet." line.

### Order

Display order is the `ORDER` array in `lib/things.ts`. Anything not listed there
falls to the end, sorted alphabetically. Add new slugs to that array to place them.

### Length

Aim for **2 to 3 sentences**. The tile fits about four before it starts to
scroll. This is a recommendation page, not a review — say what changed for you
and stop.

## Images

Product shots are cutouts on a transparent background. The page draws its own
contact shadow with `drop-shadow`, which follows the cutout's alpha, so any
shape works and no ellipse has to be faked.

To make one from a normal white-background retail shot:

1. Find an official product image on a white studio backdrop. Best Buy's CDN
   works well: `https://www.bestbuy.ca/api/v2/json/search?query=<product>` returns
   a `thumbnailImage` URL; swap the `150x150` path segment for `1500x1500`.
2. Remove the backdrop. Flood-fill the near-white region **from the image border
   inwards**, so interior white survives — otherwise a white product such as
   AirPods dissolves along with its background.
3. Trim to the object's bounding box, then save as PNG.

Aim for roughly 1000–1400px on the long edge. `next/image` resizes from there.

Objects sit on a shared baseline inside their tile (`object-position: bottom`),
so wildly different aspect ratios still line up. The current set runs from 0.60
(AirPods, tall) to 2.44 (sleep mask, wide).
