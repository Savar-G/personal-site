# DESIGN.md - share card (Open Graph image)

> History and rejected options: `.design/og/decisions.md`.

## Job

The card shows when someone shares savargupta.com in iMessage, LinkedIn, X, Slack, or WhatsApp. It must make the link look worth a tap, and it must still read at about 300 px wide.

## Current card (O-1, "Scrapbook")

- File: `app/opengraph-image.jpg`, 1200 x 630, JPEG (about 220 KB; keep it under 300 KB for WhatsApp). Alt text: `app/opengraph-image.alt.txt`. Every route uses it.
- Source: `.design/og/card.html`. Render: `.design/og/tools/render.sh` (headless Chrome on the file, no server; needs network for Google Fonts).
- Background `#f4f1ec`. Eight white polaroid frames with soft shadows, tilted -9° to +9°, cut off at the edges: japan, unify, embedr, indonesia, turkey, podcast sync, coffee?, food. Captions in Reenie Beanie.
- Centre: a white note, tilted -2°, held by two strips of yellow tape. "Hi, I'm Savar." Inter 84px 600, "Savar." in `#2F66F0` on a `#E3ECFD` highlight. "hardware, software, and AI" Inter 22px `#52525B`. "savargupta.com" Courier Prime Bold 20px `#A1A1AA`.
- Images are the site's own desk assets in `public/desk/` (real trip photos and project prints). No image of Savar made by AI.
- Tape must not cover a caption.
