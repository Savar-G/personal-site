# DESIGN.md - Things I Love

> Status: contract pending approval
> Last updated: 2026-08-09
> Scope: one new surface on savargupta.com. Site-wide system facts are cited, not redefined.

## Job

**User:** A person who already reads Savar's writing on consumer hardware, AI tools, and product taste. They arrive curious about the author, not shopping.

**Situation:** They have read an essay or the About page and want to know what Savar actually owns and rates. They give the page well under a minute.

**Job to be done:** Show a small set of physical products Savar owns and loves, and give the specific reason he loves each one, in his own voice.

**Success evidence:**

- A visitor can name one product and one specific reason after a single pass.
- The page reads as deliberate at 5 items, not as an unfinished grid.
- Adding item six costs one MDX file and one image. No layout edit.

## Scope

**In**

- A new route with a nav slot beside Bookshelf.
- 4-5 product items at launch.
- Per item: product image, product name, and the reason Savar loves it.
- Content model at `content/things/*.mdx`, read by a `lib/things.ts` module.
- Product images under `public/things/`.
- All states: at rest, hover, focus, open, keyboard, reduced motion, mobile.

**Out**

- Purchase links, affiliate links, prices, and disclosure copy. The user chose no links.
- Star ratings or a quality highlight mark. At 4-5 items every item is a favourite, so a rank carries no information.
- Categories, filtering, and search. Those solve a 40-item problem this page does not have.
- Negative reviews and comparisons. This page only holds things he loves.
- Software and services. Physical consumer products only, which keeps it distinct from a `/uses` page.

## Source constraints

| Constraint | Source |
|---|---|
| Tailwind v4, `stone` palette, `--color-stone-50` page background, `--color-stone-900` ink | `app/globals.css:12-16` |
| Geist Sans and Geist Mono, mono reserved for counts and metadata | `app/globals.css:7-10`, `.notes-meta` |
| Single easing token `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` | `app/globals.css:3-5` |
| Type roles: `.page-title`, `.section-label`, `.entry-title`, `.entry-meta`, `.prose-site` | `app/globals.css:20-61, 267-378` |
| Press and hover primitives: `.press`, `.essay-link`, `.icon-shift` | `app/globals.css:63-89` |
| Entrance motion: `.animate-fade-in`, `.stagger-children` | `app/globals.css:178-236` |
| Reduced-motion rules already exist and must be extended, not bypassed | `app/globals.css:238-263, 771-776` |
| `motion` v12 with `LayoutGroup` / `layoutId` shared-element morphs | `package.json`, `app/bookshelf/_components/bookshelf.tsx` |
| Focus ring: `2px solid color-mix(in oklab, var(--color-stone-900) 55%, transparent)`, offset 2-4px | `app/globals.css:466-470, 733-736` |
| Touch targets grow to >=44px on phones | `app/globals.css:762-768` |
| Nav is a fullscreen overlay driven by a `LINKS` array | `app/_components/nav-menu.tsx:7-12` |
| Content is MDX with `gray-matter` frontmatter, parsed server-side | `lib/books.ts` |

## Current decisions

- **D-A** The surface is its own route with a nav slot, not a homepage block.
- **D-B** Launch at 4-5 items.
- **D-C** Imagery is official manufacturer product shots, cut out and placed directly on the stone background. No card frame, no white tile. Objects read as objects.
- **D-D** No purchase links of any kind.
- **D-E** Physical products only. This is the boundary that stops the page becoming a `/uses` clone.

## Content and hierarchy

1. **The object.** The product image is the primary identifier. A Kindle is recognised faster than the word "Kindle".
2. **The name.** Product name, and a short type label where the name alone is unclear ("Paperlike - iPad screen protector").
3. **The reason.** 2-4 sentences, specific and first-person. This is the payload of the page.
4. **Optional supporting facts.** How long he has owned it, and what it replaced. Both are strong trust signals and cost one frontmatter line each.

Per item, the MDX shape is:

```yaml
---
name: Kindle Paperwhite
type: E-reader              # optional, shown when the name is not self-explanatory
image: /things/kindle.png   # cutout PNG, transparent background
owned: "Since 2021"         # optional
replaced: "A shelf of paperbacks" # optional
summary: One line that works as the teaser.
accent: "#6b7280"           # muted accent, same role as spineColor on books
---

The longer reason, in prose.
```

## Visual language

**Direction:** A small, quiet table of objects. The stone page is the surface the products sit on. Restraint is the point: five objects with room around them read as chosen, while five objects in a tight card grid read as a thin store.

**Typography:** `.page-title` for the page heading. `.entry-title` for product names. `.prose-site` for the reason. Mono only if a count or a date appears.

**Color:** Existing stone scale, unchanged. Each item may carry one muted `accent` used the way `spineColor` is used on books: small marks only, never a fill.

**Spacing and density:** Deliberately low density. Each object gets real space. The layout must hold 4 items without a visible hole and grow to 10 without a rebuild.

**Imagery:** Transparent-background PNG cutouts. A soft contact shadow grounds each object on the stone so it does not float. Products vary in aspect ratio, so items align on a shared baseline, not a shared box. Every image needs an `alt` describing the product.

**Motion:** Reuse `--ease-out` and the existing `.stagger-children` entrance. Any open or expand transition reuses the `motion` `layoutId` technique already proven in the bookshelf. Under `prefers-reduced-motion`, transforms are removed and only opacity changes, matching `app/globals.css:238-263`.

## Behavior and states

- **At rest:** all items visible without scrolling on desktop.
- **Hover:** the object lifts or the shadow deepens. No color wash.
- **Focus:** visible ring on the same element that takes the click. Tab order follows reading order.
- **Open:** the reason becomes readable. *The mechanism is the open decision.*
- **Close:** Escape closes, focus returns to the item that was activated.
- **Empty and error:** a missing image falls back to a labelled stone placeholder, matching `.book-cover--fallback`. The page never ships a broken image icon.

## Responsive and accessibility

- Viewports: 360, 640, 900, 1280.
- Touch targets >=44px on phones.
- Contrast: body text at `stone-700` or darker on `stone-50`; `stone-500` is used only for secondary metadata, as elsewhere on the site.
- The reveal must work with keyboard alone and must announce itself to a screen reader. If it is a dialog it needs `role="dialog"`, `aria-modal`, a label, and focus trapping, as `nav-menu.tsx` already does.
- Images carry descriptive `alt`. Decorative shadows are `aria-hidden`.

## Tokens and components

Source of truth is `app/globals.css`. Reuse before inventing:

- `.press` for any pressable element
- `.prose-site` for MDX prose
- `.animate-fade-in` and `.stagger-children` for entrance
- The `.book-cover--fallback` pattern for missing imagery
- The `BookReaderModal` focus and Escape handling, if the chosen direction is a modal

## What this is not

- Not a second bookshelf. The bookshelf is already image-grid-to-modal. Repeating that interaction exactly makes the site feel like one template used twice.
- Not a storefront. No prices, no buy buttons, no urgency.
- Not a `/uses` page. No apps, no editor config, no desk software.
- Not a review site. No scores, no downsides, no alternatives considered.

## Acceptance criteria

- [ ] A visitor names one product and one reason after one pass, without scrolling twice on a 1280 viewport.
- [ ] The page looks composed at exactly 4 items and at exactly 10 items.
- [ ] Every state renders and is captured: rest, hover, focus, open, close, missing image, 360px, 1280px, reduced motion.
- [ ] The whole page is operable with the keyboard alone, and focus returns correctly on close.
- [ ] Adding an item is one MDX file plus one image, with no component change.
- [ ] Type, color, easing, and focus rings match `app/globals.css`. No new palette.

## Open decisions

- **D1 - How is the reason revealed, and how much of it is visible at rest?** This is the axis exploration answers. It decides whether the page feels like a shelf, a set of cards, or a short illustrated essay. Constraint: it must not be a visual copy of the bookshelf cover-to-modal morph.
- **D2 - Route and nav label.** `/things` with label "Things" is the current proposal. Alternatives: `/loves`, `/gear`, `/kit`. Owner: user. Low cost to change now, higher after links exist.
