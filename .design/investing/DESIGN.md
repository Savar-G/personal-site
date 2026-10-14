# DESIGN.md - /investing and the piggy bank

> Status: built in `worktree-investing`; waiting for Savar's check on a Vercel preview (ship gate).
> Scope: a piggy bank on the desk, the desk layout around it, and the page `/investing`.
> Parent contract: `.design/redesign/DESIGN.md` (desk, inner pages, type, colour, accessibility). Everything there applies here unless this file says otherwise.
> History and rejected options: `.design/investing/decisions.md` (I-1 to I-14).

## Job

**User:** The same visitors as the desk (recruiters, founders, PMs, friends), plus people who share Savar's interest in investing.

**Job to be done:** Show that investing is a real, long-running part of Savar's life: how he started, what he learned, and what he holds now. The page explains where his love of great businesses and great products comes from.

**Success evidence:**
- Without hover, a visitor can say which account holds which positions, and the largest position in each.
- Hover or focus on a slice or a row gives that holding's return for the selected period.
- No dollar amount, share count, or cost basis is on the page, in the page source, or in the public repo.
- The page states the date of the data and how the returns are calculated.

## Desk (I-9, I-10, I-11)

- **Object:** a clear glass piggy bank full of loonies (`public/desk/piggy.webp`, cut-out; the glass keeps a white inside, so the page does not show through it in dark mode). Caption "Investing". Opens `/investing` with the normal lift and fade (no flight).
- **Place (desk, L1):** 170x183 at (1170, 515), -4deg, on the right under Socials. Around it: Resume and Coffee chat at 85% (`--ms:.85`), Resume at (72, 388) and Coffee at (181, 610) in layout px; the sugar cubes at (430, 718), (461, 741), (434, 763) and the hint at (424, 813); Food at (560, 568); Bookshelf at (900, 630).
- **Place (pocket desk):** third row with Coffee chat and Food, in `desk/pocket.js`: Coffee (80, 652.5) at .56, Food (232, 647.5) at .5, Investing (328, 652) at .54; cubes at (160, 638), (170, 657), (158, 675).
- **Hover:** the default lift, and a loonie's edge peeks out of the slot (`public/desk/loonie.webp`). Slot centre in the object: (92, 15).
- **Click (pop and flip):** the loonie rises out of the slot about 100 px with three turns, hangs, drops back in; the piggy dips on the catch (160 ms); then the page opens. About 0.9 s before the fade. Reduced motion: no flip, the page opens at once.
- `--ms` now scales an object on the desk too: hover, drag, and press multiply it, and captions divide their font size by it, so they stay 12 px.

## Page (I-12)

1. Header name, "Investing", and Savar's story (approved 2026-10-14) in the 44rem reading column.
2. "What I hold": one period toggle (1M, YTD, 1Y, All time; default All time) for both accounts.
3. For each account, a donut card beside a table card (stacked under 820 px). The donut shows weights; its centre shows the account's return for the period. The table lists Holding (colour bar, ticker, name), Return (arrow and sign), and Allocation. Accounts with three holdings or fewer get a 180 px donut and a one-line description for each fund.
4. Hover or focus a slice or a row: both highlight, other slices fade to 28%, and the centre shows that holding (ticker, return, and "since bought"/"since listing" or the period). Its name and weight ("13.2% of TFSA") show under the donut, in two lines kept free so the card does not jump (I-15).
5. The note: holdings date, prices date, no dollar amounts, and how each return is calculated.
- The page uses `page-wide` (70rem), like /projects. It revalidates once a day.

## Colour (I-13)

- Every holding has its own colour, by slot: 13 OKLCH hues from teal to magenta, alternating light and dark so neighbouring slices differ, starting on blue. Values in `app/(pages)/investing/_components/investing.css` (light and dark sets). Neighbouring pairs pass `validate_palette.js` in both modes.
- A holding keeps its slot (its order in the export, by weight then) until the next export; slices and rows use slot order.
- Gains are green with "▲", losses red with "▼"; never colour alone.

## Data

- **TFSA:** Snowball Analytics CSV export. **RRSP:** VFV and CASV, weights, average cost per unit, and first buy, in a private JSON. Both go through `scripts/investing-import.mjs` into `lib/investing-data.json`. The inputs never enter the repo (the repo is public, I-5).
- **Committed fields:** per holding, `weight`, `investedShare`, `valueRatio`, `allTime` (%), optional `firstBuy` and `about`. Ratios and percentages only.
- **Currency rule:** each holding's returns are in its own currency. Account totals are in CAD.
- **All time:** Snowball's total profit % (price, dividends, sold gains, over all money ever invested), rolled forward daily with the price (I-7). RRSP: from average cost.
- **1M, YTD, 1Y:** the return of today's holdings over the period, from daily adjusted closes. A period that starts before a holding's first buy shows the gain since bought instead (I-14). A period that starts before listing runs from the first trade ("since listing").
- **Prices:** Yahoo Finance chart endpoint (unofficial, no key), fetched by `lib/investing.ts` at build and on each daily revalidation. If a revalidation fails, the last good page stays; if the build cannot fetch, the page shows snapshot weights and All time only.
- **Code:** `lib/investing-math.ts` (pure math; tests: `node --experimental-strip-types --test scripts/investing-math.test.mjs`).

## Accessibility

- The piggy bank follows the parent object rules (focus, Enter opens, caption).
- Table rows take focus and drive the same highlight as hover. The donut is decorative (`aria-hidden`); the table has a caption and carries every value. The centre is a polite live region.
- Reduced motion: no flip, no slice lift, no transitions.

## Exclusions

- No dollar values, share counts, cost basis, or account sizes, in the UI or in committed files.
- No stock names in the COVID part of the story. No investment advice.

## Acceptance

- `npm run build` and `npm run lint` pass; the math tests pass; `desk-port.mjs` prints `no runtime errors` with and without `POCKET=1` (and with a piggy click, it navigates to `/investing`).
- A scan of every committed file and both prerendered pages finds none of the CSV's share counts, costs, or values, nor the RRSP average costs.
- On the Vercel preview: both donuts render, the toggle changes every value, hover links slice and row, the flip plays, and Savar approves the desk and the page.
