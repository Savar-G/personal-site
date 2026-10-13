# Site icon - decisions

## I-1 (2026-10-12): "Plop" replaces the "SG" tile

- **Chosen:** A2 "Plop" as first drawn (r2 option P1): a cartoon sugar cube dropping into black coffee, two drops flying out, no backing tile. It ties to the coffee-chat object and the sugar-cube splash on the desk.
- **Why the old icon went:** white "SG" on a black tile was a standard monogram with no link to the site.
- **Rejected in round 1:** desk objects A1 (top-down coffee) and A3 (polaroid with a trip photo); signature type B1-B3 ("S." highlight, gel-pen "s.", sticker); pixel art C1-C3 (RAZR screen, ramen, coffee); hidden marks D1-D3 (desk from above, coffee ring, stirred S). Each round-1 card listed its risk; see `r1/manifest.json`.
- **Rejected in round 2:** P2 (bold lines), P3 (highlight tile), P4 (brand-blue tile, the agent's recommendation for legibility at 16 px and in dark tab bars). Savar kept the original drawing.
- **Accepted cost:** with no tile, the icon has no edge of its own in a dark tab bar, and at 16 px the motion lines and drops blur.

## Files

- `app/icon.svg` - the vector, served to browsers that take SVG icons.
- `app/favicon.ico` - 16, 32, and 48 px for browsers that do not.
- `app/apple-icon.png` - 180 px on white at 80% scale, because iOS fills transparent areas with black.
- Regenerate: `/tmp/fvenv/bin/python .design/icon/tools/gen.py` and `gen_r2.py` (needs fonttools, brotli, pillow; renders with `rsvg-convert`; reads fonts from `.next/static/media`, so run `npm run build` first).
