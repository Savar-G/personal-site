# Bookshelf content

Each book on `/bookshelf` is one `.mdx` file in this folder, parsed by [`lib/books.ts`](../../lib/books.ts).
It mirrors how blog posts work in `content/posts/` — frontmatter for structured fields, the body for prose.

## Add a book

Create `content/books/<slug>.mdx`. The filename (minus `.mdx`) becomes the slug. Example:

```mdx
---
title: "The Title"
author: "Author Name"
coverImage: "/books/the-title.jpg"  # real cover in /public/books (see below)
status: "read"            # "read" | "reading"  (groups it into a shelf; default "read")
category: "Investing"      # optional short topic label
spineColor: "#5a6470"      # accent color for the fallback cover + modal details
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

- **coverImage** — the real book cover. Save the image in `/public/books/` (e.g. `the-title.jpg` or `.png`) and point `coverImage` at `/books/the-title.jpg`. It's rendered with `next/image` on the shelf and in the reader, with alt text `Cover of <title> by <author>`. Aim for a portrait image around 300–600px wide (roughly 2:3); larger is fine, `next/image` resizes it.
- **no coverImage** — omit the field and the book shows a clearly-marked stone "No cover" fallback (title + author). Tasteful, but obviously a placeholder — add real art when you have it.
- **status** — `reading` books appear under "Currently reading"; everything else under "Read". A book with no takeaways/quotes/body (e.g. one you've just started) renders a clean "currently reading" state in the reader.
- **spineColor** — no longer paints the cover (the real artwork does). It's the accent for the fallback cover and small reader details (takeaway bullets, the quote rule). Keep it muted and stone-friendly.
- **quotes** — wrap each in straight double quotes and use curly `“ ” ’` *inside* so the YAML never needs escaping.

### Accent palette (`spineColor`)

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
