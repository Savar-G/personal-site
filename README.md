# savargupta.com

Personal site of Savar Gupta. Minimalist writing-forward blog built on Next.js, Tailwind v4, and Geist. Posts live as MDX files in `content/posts/`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Add a new post

1. Create a file in `content/posts/`, e.g. `content/posts/your-slug.mdx`:

   ```markdown
   ---
   title: "Your post title"
   date: "2026-06-15"
   ---

   Body in MDX. Headings, **bold**, *italics*, lists, blockquotes, `code`, and
   images all work.
   ```

2. Commit and push. The post appears on the homepage, grouped by the year of `date`. Reading time is auto-computed.

## Project structure

```
app/
  _components/    Reusable UI (BrandLink, NavMenu)
  about/          /about page
  [slug]/         Blog post route — renders MDX from content/posts/
  icon.png        SG monogram favicon (auto-served by Next)
  layout.tsx      Sticky header, fonts, sitewide chrome
  page.tsx        Homepage (bio + post list grouped by year)
  globals.css     Tailwind + custom prose, animations, nav overlay
  opengraph-image.tsx  Auto-generated OG image at /opengraph-image
  robots.ts       /robots.txt
  sitemap.ts      /sitemap.xml
content/posts/    MDX source for posts
lib/posts.ts      MDX reader, frontmatter parsing, reading-time
public/           Static assets (resume, brand logos)
```

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Geist Sans + Geist Mono via `next/font`
- MDX via `next-mdx-remote` + `gray-matter`

## Deploy

Auto-deploys on push to `main` via Vercel.
