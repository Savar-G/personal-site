# Spine lab

Offline tools for writing a book's `spine` spec (schema: [`content/books/README.md`](../../content/books/README.md#spine-spec)). The lab renders a spec to a PNG with the same painter the site uses ([`spine-paint.js`](../../app/(pages)/bookshelf/_components/spine-paint.js)), next to a photo of the real spine, so you can match them without a browser or a dev server.

Run every command from this folder (`cd scripts/spine-lab`). Working files (`specs/`, `refs/`, `refs-raw/`, `imgs/`, `out/`, fonts, `node_modules/`, `.venv/`) are gitignored. `notes/` is committed: one provenance note per book.

## Setup (once per checkout)

```sh
./setup.sh
```

It needs `node`, `uv`, and network access. It installs `@napi-rs/canvas` and `js-yaml` here (not in the site's `package.json`), a Python venv with fonttools, brotli, and pillow, and static weight instances of every font in `app/(pages)/bookshelf/_fonts/`.

## Tools

| Command | Does |
|---|---|
| `node render.mjs <slug>...` or `all` | Renders `out/<slug>.png`. The spec comes from `specs/<slug>.yaml` (a draft) if it exists, else from the book's frontmatter. With `refs/<slug>.jpg`, also writes `out/<slug>-vs.png`: the photo (left) and the render (right) at the same height. `all` also writes `out/_sheet.png`, the whole shelf. Prints `MISSING FONTS` when a spec names a family the lab does not have. |
| `node getfont.mjs "Family"` | Fetches a Google Fonts family (latin subset, every weight and italic) into `fonts-src/` and makes static instances for the lab. |
| `.venv/bin/python ebay.py <slug> "<title> <author> hardcover"` | Finds 3 eBay listings with Firecrawl and downloads every seller photo, then writes a numbered contact sheet `refs-raw/<slug>-ebay-sheet.jpg`. Photo `L-P` is `refs-raw/<slug>-eL-P.jpg`. About 1 Firecrawl credit per search and per listing. |
| `.venv/bin/python crop.py IN OUT [--rotate DEG] [--box X0 Y0 X1 Y1] [--size]` | Rotates (counter-clockwise, canvas grows), then crops. `--size` prints the size. |
| `.venv/bin/python vsheet.py OUT slug...` | Puts several `-vs.png` (or plain) renders side by side for review. |
| `node apply.mjs [slug...]` | Writes `specs/<slug>.yaml` into `content/books/<slug>.mdx` as the `spine:` block (after `spineType:`), checks the round trip, and lists every font face the applied specs use. |

## Finding a photo of the real spine

Most sites show only front covers, and plain `curl` to image search and eBay is blocked. What works:

1. Firecrawl image search (it is Google Images): `firecrawl search "<query>" --sources images --limit 15 --json | jq -r '.data.images[]? | "\(.imageUrl) | \(.title[0:70]) | \(.imageWidth)x\(.imageHeight)"'`. Queries that surface spines: `"<title>" book spine`, `"<title>" hardcover side view`, `"<title>" <author> book stack`, `"<title>" bookshelf`, `"<title>" deluxe edition hardcover`.
2. `ebay.py`. Sellers often photograph the spine. Try a second query (add "dust jacket" or "first edition") if the first sheet shows none.
3. Amazon galleries: a wide `m.media-amazon.com` image (for example 1000x504) is often the book lying flat with its spine showing. Reddit photos (`i.redd.it`) are real copies; download them with curl directly. WebFetch and WebSearch refuse reddit.com.

Download candidates with `curl -sL -A "Mozilla/5.0" -o refs-raw/<slug>-<n>.jpg "<url>"` and look at them with the Read tool. Firecrawl credits are shared: run `firecrawl credit-usage` first (it also shows whether you are signed in), and stay under 12 Firecrawl calls per book.

## Matching a spine

The book's `.mdx` must exist first, with `pages` and `heightCm` (the render sizes the spine from them).

1. Read the site's cover (`public/books/<slug>.jpg`). It fixes the edition; the spine must be from that edition, or another printing with the same jacket design.
2. Crop the best photo to the spine alone, upright, head at the top: `refs/<slug>.jpg`.
3. Write `specs/<slug>.yaml` (the value of `spine:`, without the key). Measure from the photo: where each block of text starts and ends along the spine, its cap height against the spine's width, its direction, its colour (`.venv/bin/python -c "from PIL import Image; im=Image.open('refs/<slug>.jpg').convert('RGB'); print('#%02x%02x%02x' % im.getpixel((X, Y)))"`).
4. Fonts: name the real typeface, then pick the closest Google Fonts family by class first (condensed sans, geometric sans, didone, slab, script), then weight and width. Reuse a family the shelf already has when the match is as good: each new family is another download.
5. `node render.mjs <slug>`, Read `out/<slug>-vs.png`, fix, repeat (3 to 6 rounds is normal) until text sits in the same places, at the same sizes, in the same case and direction, over the same colour blocks.
6. Pictures on the spine (a portrait, a swoosh, a planet) can be real: crop them from the photo into `imgs/` (a PNG with transparency for a logo on a coloured ground), reference them as `/books/spines/<file>`, and copy the file to `public/books/spines/` yourself (`apply.mjs` does not). Leave out a logo you cannot crop cleanly. Never stand a plain dot, ring, or box in for a logo.
7. Write `notes/<slug>.md`: the edition matched, the photo URL(s), confidence (high: a clear straight photo of this edition; medium: angled, partial, or another printing of the same design; low: no photo, designed from the cover), the real typeface and its substitute, and what the painter could not draw.
8. `node apply.mjs <slug>`, then `node render.mjs <slug>` again (now from the frontmatter) to confirm.

If no photo exists after a real search (at least 6 different queries across these sources, within the 12-call Firecrawl budget), design the spine from the cover's own lettering and colours, the way the publisher's designer would, and mark it low confidence. Self-published and Kindle-only books have no print spine; design those from the cover too.

## Adding a font to the site

The lab can render any Google font, but the site only has the families in [`spine-fonts.ts`](../../app/(pages)/bookshelf/_components/spine-fonts.ts). For a new family: copy its file from `fonts-src/` to `app/(pages)/bookshelf/_fonts/` (a variable file covers every weight; a static one covers one weight), add a `localFont` entry with the weights and styles the specs use, add it to `spineFontVars`, and add its kebab name to `families.json`. Then rerun `./setup.sh` so the lab instances it.
