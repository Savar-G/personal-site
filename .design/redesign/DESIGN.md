# DESIGN.md - savargupta.com redesign

> Status: direction B (desk of objects) chosen. The desktop desk is built in Next.js (`app/_components/desk/`, R-59). Phones and short screens get the pocket desk (M3, R-63).
> Scope: homepage first. Inner pages are the current site pages with a new style (R-48); `/writing`, `/projects`, and `/travel` are new.
> Canvas: Brilliant project "Personal Website", canvas `main`. Desktop: "B3" frame (behind the prototype; resync pending). Phone: "M3" + "M3 · Tap Socials → contact sheet".
> Prototype (desktop, source of truth for motion): `mockups/desk-prototype/index.html` (gitignored; open the file directly, no server). The site port is `app/_components/desk/` (`markup.ts`, `engine.js`, `desk.css`); keep the two in sync.
> History and rejected options: `.design/redesign/decisions.md`.

## Job

**User:** Recruiters, founders, PMs, and friends who arrive from LinkedIn, X, or a link in bio. They give the homepage 10-30 seconds.

**Job to be done:** Make Savar memorable in one screen, and let a visitor reach any part of his life (work, writing, travel, food, a coffee chat) in one click.

**Accepted cost:** The first screen carries only a short bio. The resume and projects are one click away.

## Greeting (centre of the desk)

- "Hi, I'm Savar." Inter 64px, 600, tracking -2.4px, `#18181B`; "Savar." in `#2F66F0` on a `#E3ECFD` highlight (12px radius).
- On the first visit of a session the headline types itself (55-105 ms per letter, longer after "," and spaces; letters hold their final place; a caret leads and blinks at the end), then a highlighter sweeps in behind "Savar." (380 ms). Site only; the prototype is unchanged (R-68).
- "Savar." beckons every 5.5 s (lifts 4px, tilts -3deg, settles, and a sheen crosses the highlight) until the visitor hovers or focuses it once per session (R-68).
- "Savar." is a link to `/about`. Hover and focus: the highlight darkens to `#D3E1FC` and the name lifts 2px and turns -2°. Where the browser has view transitions, the name flies into the "Savar Gupta" name in the page header on `/about`, and "back to the desk" flies it back (R-76).
- "Studying Mechatronics Engineering and Business @ SFU. Building at the intersection of hardware, software, and AI." Inter 17px, `#52525B`, max 500px.
- "Click anything to learn more about me." Inter 14px, `#A1A1AA`, with a hand icon that taps three times (fingertip ripple), rests, and stops after the first object hover. Phone: "Tap anything…".

## The desk (desktop, 1440×900 stage scaled to fit)

White page. Photographic objects around the greeting. Every object has a level caption under it (Inter 12px, 500, `#52525B`; `#18181B` on hover). Objects can be dragged; a press that moves less than 4px is a click. Each object's open or active footprint lands on empty desk.

| Object | Caption | Opens | Hover |
|---|---|---|---|
| Three CSS polaroids with Savar's photos (sushi, Cappadocia balloons, Indonesian sea cliffs), handwritten japan / turkey / indonesia | Travel | `/travel` | polaroids fan out; the photos catch the light (R-78) |
| Closed black notebook (165×244) | Writing | `/writing`, then `/<essay-slug>` | cover flips open in 3D into empty space; a Muji gel pen (clear frosted barrel, drawn in SVG) lies on the right page. Click the pen to pick it up: it follows the pointer, tip first, and the cursor hides. Press and drag on the right page to write in black gel ink. A press off the page, or Esc, puts it back. The ink stays in the browser; "tidy up" wipes the page (R-75) |
| Blue folder with three blank papers | Projects | `/projects` (HealthOS there is the way to Health) | papers rise, fan out, and float |
| Silver Motorola RAZR V3, own right-hand column | Socials | contacts | lifts, straightens, scales 1.5×; lock screen wakes to Contacts; ↑/↓ + Enter or click a row (LinkedIn, X, GitHub, Email, Beli, Book a call); hint bottom-right |
| Paper render of the resume | Resume | resume page | lift; click plays the hyperspace zoom |
| Three book covers | Bookshelf | `/bookshelf` | books fan out; the covers catch the light (R-78) |
| Black coffee on a saucer with spoon, three sugar cubes beside it | Coffee chat | cal.com/savar-gupta/coffee-chat | lift; drag a cube into the cup: cartoon splash (outlined drops, splat, "plop!", ripples, cup squash-and-stretch); caption counts sugars; cubes respawn; first cube toasts "I take mine black, but you do you." |
| Ramen | Food | `/food`, Savar's Beli list (R-86) | steam rises |

**Default hover:** translateY -6px, rotate +2°, scale 1.03, 180 ms `cubic-bezier(0.2, 0.8, 0.2, 1)`.

**Resume hyperspace:** a black iris closes on the paper (650 ms); the page pulls back 8%, then flies to the centre through star streaks and lands at reading size (1250 ms, overshoot to 105%); a black page with "back to desk" and "download pdf". Back and Esc reverse it (900 ms).

## Behaviour extras (desktop)

- **Load:** greeting fades up; objects land one after another with a small bounce; sugar cubes last. On the site the landing is CSS (class `landing` on the stage), started before the first paint by the pre-paint script; it plays once per browser session, and a return to the desk has no fade.
- **First visit:** polaroids develop from blank white to colour (stored, so it plays once).
- **Coffee:** steams for 60 s, then goes cold; hover then shows "gone cold · grab a fresh one with me →".
- **Drag:** the object lifts (−10px, 1.06×, soft shadow) and settles with a bounce on drop; a "tidy up" button (top right) returns every moved object.
- **Throw (Travel only, R-77):** the polaroids swing around the grip as they are dragged, so their centre trails the pointer the way paper does. Let go while moving and they slide on, slow down, and bump softly off the edges of the desk. "Tidy up" also turns them back to their resting angle.
- **Gloss (R-78):** under the pointer, each polaroid photo and book cover tips up to 4° toward it and a soft highlight follows it across the photo or cover. The white polaroid frames stay matte. Desk only (not the pocket desk).
- **Plain list:** "prefer a list? →" (top left) opens a text page: bio, work, projects, writing, resume, About, bookshelf, Things, travel, food, contact (with Beli and Book a call).
- **Phone:** after 20 s without input it rings ("INCOMING CALL · Savar", caption "Savar is calling… click to answer"); a click anywhere on the phone, or Answer, = coffee chat (opens the booking page, R-69); Ignore; unanswered = "1 MISSED CALL".
- **Ghost:** catches persist and each one shows a fun fact (true facts only); sugar count persists.
- **Pages:** in the prototype, Travel, Writing, and Projects open as pages that the object flies into. On the site they are real routes (`/travel`, `/writing`, `/projects`, `/bookshelf`, `/food`, and `/about` from the name): the route opens in the same tab. Where the browser supports view transitions, the object flies into its page (R-66): the three polaroids into their album covers on the phone on `/travel` (R-83), the notebook into `/writing`, the folder's three papers into the first three projects, the three books into their covers on `/bookshelf`, the name into the header name on `/about` (R-76); "back to the desk" flies them back (640 ms, slight overshoot; old image fades out in 260 ms, new fades in). Elsewhere the object lifts (1.08×) and the desk fades (240 ms).
- **Projects page (R-70):** media-led case cards in a 70rem column (the shell widens via `.page-wide`). Unify is a full-width card: its landing page in a browser frame, three phone screens (the AI Companion one loops a screen recording while on screen), then intro + stats (from `lib/projects.ts`; they count up from 0 once, when they are fully on screen, R-79) beside "What I did". The rest sit in two columns, each with category chip, role · dates, summary, bullets, tools, links; Embedr is also full width (video on the tray, Product | Go-to-market side by side); Podcast Sync follows Embedr, also full width (a strip of the YouTube player with its message on the tray, max 46rem; the summary leads with why Savar built it, R-85); Rocketry is a tall card left of three compact text cards (Wearable, Taskline, HealthOS). Missing photos show a marked placeholder until Savar sends them. The GitHub graph closes the page; it fills in week by week, left to right, on its first scroll into view (R-79).
- **Inner pages (site):** no menu. "← back to the desk" sits top left on every inner page and under each essay. The name in the page header links to `/about`. On `/bookshelf` the covers catch the light under the pointer, like the books on the desk (R-78). Light and dark follow the system, with the desk's tokens.
- **Theme:** light and dark follow the system setting.
- **Mid-size screens:** captions, bio, and hint grow up to 1.3× when the desk is scaled down.
- **Assets:** WebP, about 0.9 MB total; the full resume loads on first approach to the paper.

## Phone (M3 pocket desk, 390×844)

- Built on the site (R-63) for screens under 768 px wide or under 520 px tall. The stage is 390 × 844, scaled to the screen width (max 1.25×), and scrolls. Object centres, rotations, and scales come from the Brilliant frame; they live in the `POCKET` table in `engine.js`. The prototype stays desktop-only.
- Below the objects: a pill, "This desk is more fun on a desktop." with a desktop icon (R-64, R-65), then "Vancouver, BC · <live time>".
- Phones do not drag objects (the page scrolls); sugar cubes still drag, and a missed cube slides back. No ghost, no ringing phone, no tidy button.

- All objects on one screen in a loose 2-3 column scatter under a compact greeting (32px headline, 14px bio). Captions 11px, aligned per row.
- One tap opens the page. No hover effects; a tap gives a short press state.
- Socials opens a contact sheet: the RAZR large with its Contacts screen, plus six 44px buttons (LinkedIn, X, GitHub, Email, Beli, Book a call) and a close button.
- Resume keeps the hyperspace zoom.
- Sugar cubes still drag into the coffee.
- Desktop-only: fan-outs, notebook flip, the pen, floating papers, steam, phone zoom, keyboard hint.

## Type and colour

- Inter for all UI text. Courier Prime Bold for small instructional text (phone hint, "plop!", resume viewer buttons). Reenie Beanie only for the handwriting on polaroids. Pixelify Sans only on the RAZR screen.
- Page `#FFFFFF`; ink `#18181B`; body `#52525B`; muted `#A1A1AA`. RAZR screen `#0A1B3D`, header `#2F6BD8`, selection `#F59E0B`.

## Content facts

- Resume: `public/Savar_Gupta_Resume.pdf` is the Sep 18, 2026 version (same file as `~/Documents/Savar_Gupta_Resume.pdf`).
- Socials: linkedin.com/in/savar-gupta, x.com/savar_gupta, github.com/Savar-G, savar.gupta1922@gmail.com, beliapp.co/app/savargupta.
- Coffee chat: cal.com/savar-gupta/coffee-chat.
- Things (`/things`) has no desk object; it is in the plain list only.
- Food (`/food`, R-86): every restaurant Savar has ranked on Beli, best first (rank, name, cuisine · area · city · price, score ring green/amber/red by thirds of the 10-point scale). A row opens in place to show his note, what to order, the month he ranked it, a Google Maps link, and his photo when there is one. City chips (by count), search, and Top rated / Recent; ranks count within the chosen city. "Next on my list" holds the want-to-try places. The data is `content/food/places.json`, filled by `npm run food:import` from a Beli data export or a CSV (`content/food/README.md`). Beli has no API and its terms forbid scraping, so there is no live sync. Beli itself runs only on phones, and its links send desktop visitors to the App Store; the RAZR and contact sheet still link to Beli for following Savar there.
- Trips (albums on `/travel`, newest first): Bali (Aug–Sep 2026), Joffre Lakes (Aug 2026), Turkey (Mar–Apr 2026), California (Dec 2025), Maui (Dec 2025, with the vlog `public/videos/maui-2025.mp4`), Japan (Aug–Sep 2025), Banff (2025). 146 photos Savar approved, data in `lib/travel.ts`, files in `public/travel/` (R-84).
- `/travel` (R-80): an iPhone 18 Pro Max open on the Photos app, iOS 26/27 design: Albums first (2 columns of covers under Personal / Shared / Activity), album grids (3 columns; pinch for 1 or 5), Library (5 columns), Collections. A photo zooms out of its thumbnail; swipe sideways, swipe down to close, tap to hide the buttons. Frame: Silver (R-81), drawn in CSS; system font stack; icons drawn for the page (Apple's bezels, SF fonts and SF Symbols are not licensed for websites). Phones (≤600 px): no frame, the page is the app. The page has no header name; the phone fills the space under "back to the desk".
- The Maui vlog (R-82) is a full-width tile above the albums that loops silently; a tap turns the phone to landscape and plays it with sound (on phones the video turns sideways). It is also the last item in Maui.
- Projects: Unify (co-founder; landing page, mobile app, web app, each with a GitHub repo), Taskline, Embedr (Product & GTM; embedr.app, studio.embedr.app, YouTube ZQaxrc0SsEA from 0:13), Podcast Sync (solo, Oct 2026; github.com/Savar-G/podcast-sync), Health & Activity Wearable, HealthOS (health.savargupta.com). Facts match the Sep 2026 resume; Podcast Sync facts come from its repo.
- Videos load only on click, behind a poster with a play button.

## Accessibility

- Every object is focusable; Enter opens it; focus shows the hover state.
- The phone takes focus; arrow keys move, Enter opens.
- Reduced motion: no lift, flip, fan-out, flight, throw, gloss, count-up, graph fill, splash, or steam. Captions stay. The resume opens with a fade.

## Open

- Object photos are AI stand-ins. (Trip photos are Savar's own since R-58.)
- Desktop canvas frame is behind the prototype; resync before build.

## Exclusions

- No invented metrics, roles, or testimonials.
- No AI-generated image of Savar.
