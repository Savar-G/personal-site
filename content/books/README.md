# Bookshelf content

Each book on `/bookshelf` is one `.mdx` file in this folder, parsed by [`lib/books.ts`](../../lib/books.ts).
It mirrors how blog posts work in `content/posts/` — frontmatter for structured fields, the body for prose.

## Add a book

Create `content/books/<slug>.mdx`. The filename (minus `.mdx`) becomes the slug. Example:

```mdx
---
title: "The Title"
author: "Author Name"
status: "read"            # "read" | "reading"  (groups it into a shelf; default "read")
category: "Investing"      # optional short topic label
spineColor: "#5a6470"      # the spine + cover color (see palette below)
dateRead: "2026-04-29"     # optional ISO date; used to sort newest-first
rating: 5                  # optional 1–5; only shown when present
summary: "One-line thesis shown at the top of the right page."
takeaways:                 # optional bullet list — the "Key takeaways" section
  - "First takeaway."
  - "Second takeaway."
quotes:                    # optional — the "Favorite quotes" section
  - "“A quote, with curly quotes so the YAML stays clean.”"
---

Everything below the frontmatter is your long-form notes. Plain Markdown —
### headings, lists, and > blockquotes — rendered with the site's `.prose-site` styling.
```

### Field notes

- **status** — `reading` books appear under "Currently reading"; everything else under "Read".
- **spineColor** — drives both the shelf spine and the typographic cover. Keep it muted and mid-dark so the cream title text stays legible (aim for a lightness around 35–48%). A book with no takeaways/quotes/body (e.g. one you've just started) renders a clean "currently reading" state.
- **cover** — optional. Omit it and a typographic cover is generated from `spineColor` + the title. To use a real image, drop it in `/public` and set `cover: "/covers/the-title.jpg"`.
- **quotes** — wrap each in straight double quotes and use curly `“ ” ’` *inside* so the YAML never needs escaping.

### Current spine palette

A muted, stone-friendly set already in use — reuse or extend:

| Tone | Hex | Used for |
|------|-----|----------|
| Ochre / tan | `#6f6244` | Investing |
| Bronze | `#6d5a3a` | Investing |
| Blue-gray | `#5a6470` | Investing |
| Slate | `#54606a` | Business |
| Deep slate | `#46535f` | Tech |
| Teal-green | `#4f635d` | Finance |
| Sage | `#5f6a57` | Habits |
| Olive | `#5c5d44` | Psychology |
| Plum | `#5f5160` | Psychology |
| Clay | `#7e5544` | Communication |
| Oxblood | `#7c473c` | Fiction |
