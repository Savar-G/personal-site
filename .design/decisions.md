# Design decisions

Keep history here; keep `DESIGN.md` current.

| ID | Date | Status | Decision | Why | Evidence | Supersedes |
|---|---|---|---|---|---|---|
| D-A | 2026-08-09 | accepted | Own route with a nav slot beside Bookshelf, not a homepage block | User choice at the framing gate. Gives the section room to grow past the launch set and matches the /uses and Cool Tools convention. | User answer, 2026-08-09 | - |
| D-B | 2026-08-09 | accepted | Launch with 4-5 items | User choice. Changes the problem from "catalog density" to "make a small set feel deliberate". | User answer, 2026-08-09 | - |
| D-C | 2026-08-09 | accepted | Official manufacturer product shots, cut out, placed directly on the stone background with a contact shadow. No card frame. | User choice. Objects read as objects. A bordered white card would make a personal page read as a store. | User answer, 2026-08-09; `.design/references.json` T2 | - |
| D-D | 2026-08-09 | accepted | No purchase links of any kind | User choice. Removes affiliate disclosure copy from the page header and keeps the page a recommendation rather than a storefront. | User answer, 2026-08-09 | - |
| D-E | 2026-08-09 | accepted | Physical consumer products only; no software, apps, or services | Keeps the page distinct from the saturated `/uses` genre and from the existing Bookshelf. | `.design/references.json` uses.tech entry | - |
| D-F | 2026-08-09 | rejected | A quality highlight mark, as on patrickcollison.com/bookshelf | At 4-5 items every item is a favourite. A rank across five favourites carries no information and adds visual noise. | `.design/references.json` Collison entry | - |
| D-G | 2026-08-09 | rejected | Categories, filtering, and search | Solves a 40-item problem. This page has 5 items. Revisit only if the set passes roughly 25. | `DESIGN.md` Scope/Out | - |
| D-H | 2026-08-09 | rejected | Reuse the bookshelf cover-to-modal morph as-is | Two pages with the same interaction make the site read as one template used twice. Motion primitives are reused; the reveal model is not. | `.design/references.json` T1 | - |
