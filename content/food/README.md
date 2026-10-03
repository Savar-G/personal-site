# Food

`/food` shows Savar's Beli list: every restaurant he has ranked, best first,
plus the places he wants to try. The data is one file, `places.json`, read by
[`lib/food.ts`](../../lib/food.ts).

Beli has no public API, and its terms of service forbid scraping its pages, so
the site does not pull from Beli. The list comes in as a file instead.

## Update the list

1. Get the list as a file:
   - **Beli's export.** Beli sends a machine-readable copy of your data when
     you ask at support@beliapp.com.
   - **A spreadsheet.** One row per restaurant, saved as CSV. Use the columns
     below.
2. Run the import:

   ```sh
   npm run food:import -- ~/Downloads/beli.csv
   ```

3. Read the summary it prints, check `git diff content/food`, and commit.

The import merges by name and city. A value in the file replaces the stored one.
A blank cell keeps the stored value, so notes or dishes typed here are not
wiped by an export that lacks them. Photos are never touched.

| Flag | Use it when |
|---|---|
| `--list been` or `--list want` | The file holds one list and has no list column. Without it, a row with a score counts as ranked and a row without a score counts as want-to-try. |
| `--prune` | The file is a full export. Places on the same list that the file leaves out are removed. |
| `--dry-run` | You only want the summary. Nothing is written. |

## Columns

Header names are matched loosely: case, spaces and underscores don't matter,
and common names from other apps work too (`Restaurant Name`, `Neighbourhood`,
`Date Added`).

| Field | Accepted headers | Notes |
|---|---|---|
| name | name, restaurant, business, place | Required. |
| score | score, rating | 0–10, Beli's score. |
| city | city | Used for the city filter. |
| area | area, neighborhood, neighbourhood | |
| cuisine | cuisine, cuisines, category | |
| price | price, price range | `$$` or `2`. |
| visited | visited, date, date added | `2026-08-01`, `08/01/2026` or `Aug 1, 2026`. |
| note | note, notes, review | Your words. |
| dishes | dishes, favorite dishes | Separate with `;`. |
| list | list, status | Anything with "want" or "try" goes to want-to-try. |

## Photos

Savar's own photos only. To add one, save it as
`public/food/<id>.webp`, about 1200 px on the long edge, with location data
stripped. Then set `"photo": "/food/<id>.webp"` on the place in `places.json`.
The `id` is in the file. A row shows its photo when it is opened.
