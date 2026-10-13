# /bookshelf design

The design contract for the bookshelf page. How to add a book: [`content/books/README.md`](../../content/books/README.md). The spine tools: [`scripts/spine-lab/README.md`](../../scripts/spine-lab/README.md).

## Principle

**Real books, nothing invented.** Every book is a real hardcover of a real edition: its real front jacket, its real spine, its real page count and height, and Savar's own takeaways. When a real source does not exist, a book is designed from its own cover, never from a template. Realism comes from the objects themselves, not from labels or effects laid over them.

## Page

- Header: the site name, then the title "Books I've read". No intro text.
- Under the header, the shelf runs edge to edge (`100vw`), `clamp(440px, 66vh, 700px)` tall (phones: `clamp(420px, 62svh, 620px)`).
- Below the shelf, a visually hidden ordered list of every book (title, author, date, summary, takeaways) serves screen readers, keyboards, and search engines. It becomes the visible page when WebGL fails.

## The wall: the page itself

- The shelf hangs directly on the page background. There is no wall colour and no stage background, so there is no seam between the page and the shelf, in light or dark mode.
- The wall in the 3D scene is a shadow-only surface (`THREE.ShadowMaterial`, opacity 0.2 light / 0.4 dark): it draws only the shadows the books and bookends throw on it.
- The plank casts no shadow onto the wall: its long shadow would run into the stage's bottom edge and draw a hard line. A short soft shade under the plank grounds it instead (a fading strip, opacity 0.16 light / 0.5 dark).
- Rejected: a beige plaster wall (it read as a separate box on a white page) and a beige page (Savar did not want the whole page beige).

## The shelf

- One wood plank (light oak in light mode, dark walnut in dark mode) with a dark metal bookend at each end.
- Books stand spine out, at small random depths and gaps. From the tenth book on, about every fifteenth place holds three books lying flat in a small stack; a series never goes into a stack and always stands together in order.
- Drag, sideways wheel, or arrow keys pan the shelf when it is wider than the screen. Hovering a standing book tips it out from the top.
- Click a book and it comes off the shelf toward the camera, cover forward, beside the detail card (phones: above the bottom sheet). The other books recede. Drag the open book to turn it. Esc, a click on empty space, or "Esc ✕" puts it back. The URL hash holds the open book's slug.

## Books

- Every book is a hardcover with a dust jacket: boards, page block, jacket front, back, and spine. Width comes from the cover's aspect ratio, height from `heightCm`, thickness from `pages`.
- **Cover:** the real front jacket of the chosen edition, a flat scan. A 420 px copy paints the shelf; the full image loads when the book opens.
- **Spine:** painted from the book's `spine` spec (`spine-paint.js`), copied from a photo of the real spine of the same edition:
  - the same colour blocks and gradients;
  - the title, author, and publisher where they really sit, the way they really run (along the spine, or across it for stacked names), in the real case;
  - lettering in the closest Google Fonts family to the real typeface;
  - pictures on the spine (a portrait, a logo) as crops of the real photo in `public/books/spines/`.
- **No fake logos.** A logo that cannot be cropped cleanly is left out. A plain dot, ring, or box never stands in for a picture. (Simple shapes are fine where the real spine has that shape: a rule, a colour square, a badge.)
- Finish (`gloss`, `matte`, `cloth`) sets the spine material. The spine's `bg` also colours the jacket's back and the board edges.
- Without a `spine` spec (a fallback only), the spine is coloured from the cover's left edge with the title in `spineType`.

## Detail card

- Desktop: a card on the right of the stage (`min(420px, 42%)` wide), sliding in. Phones: a bottom sheet, at most 52% of the screen tall.
- Content: an eyebrow (Read · date · category, or Reading now · since date), the title (Newsreader), the author, the one-line summary, then "My takeaways" (3 to 5 bullets in Savar's voice from his vault notes; the section is hidden when there are none), then Previous / Next.

## Type and colour

- Card: Newsreader 500 for titles, the site's Inter for text, the site's mono for eyebrows. Warm paper colours (`--card-bg #fbf8f2`, ink `#26221d`; dark: `#24201b`, `#efe7da`).
- Spine fonts: latin-subset woff2 files in `app/(pages)/bookshelf/_fonts/`, declared in `spine-fonts.ts` with `preload: false`. The engine loads only the faces the spines draw.

## Light and dark

- Follows the system. Light: a warm sun from the upper left casts the book shadows. Dark: a warm lamp above the shelf, dark wood, stronger shadow opacity. A reading light falls on an open book in both modes.

## Motion

- Pull-out and put-back follow a curved path (about 1 s out, 0.8 s back); the card slides in over 0.65 s. Under `prefers-reduced-motion`, books move without animation, nothing idles, and hover tilt is off.

## Verification

- Agents never start a dev server or open localhost (repo `AGENTS.md`). Spines are checked in the spine lab: `node render.mjs <slug>` renders the same painter to a PNG next to the reference photo, and `node render.mjs all` renders the whole shelf.
- Then `npm run build` and `npm run lint`, and a pushed branch for a Vercel preview that Savar opens.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-13 | The wall is shadow-only; the shelf hangs on the page background | Savar: the beige wall felt disconnected from the white page. Making the wall the page removes the seam in both themes. |
| 2026-10-13 | Plank casts no wall shadow; a short soft shade replaces it | The plank's real shadow filled the wall to the stage's bottom edge and drew a hard line there. |
| 2026-10-13 | Spines copy the real spine of the edition on the site, from photos | Savar: solid-colour spines were not aesthetic; he wanted the real fonts, designs, and title and author placement. He chose recreated spines over photographing his own copies. |
| 2026-10-13 | Stand-in shapes for logos removed; real art is cropped from photos | Flat dots and rings where a logo belongs read as fake. Savar's taste: real media or none. |
| 2026-10-13 | Four spines are designed from their covers | No photo of the spine exists online: How to Win Friends & Influence People, The Fish That Ate the Whale, The Nvidia Way, The Fundamentals of Investing (Kindle only). A phone photo of a real copy would let them be redone. |
