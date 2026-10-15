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
- "Click my name to learn more about me." Inter 14px, `#A1A1AA`, with a hand icon that points up at the name and taps three times (fingertip ripple), rests, and stops once the name is hovered or focused (or was found earlier in the session). Phone: "Tap my name…". Site only; the prototype still says "Click anything…" (R-87).

## The desk (desktop, 1440×900 stage scaled to fit)

White page. Photographic objects around the greeting. Every object has a level caption under it (Inter 12px, 500, `#52525B`; `#18181B` on hover). Objects can be dragged; a press that moves less than 4px is a click. Each object's open or active footprint lands on empty desk.

| Object | Caption | Opens | Hover |
|---|---|---|---|
| Three CSS polaroids with Savar's photos (sushi, Cappadocia balloons, Indonesian sea cliffs), handwritten japan / turkey / indonesia | Travel | `/travel` | polaroids fan out; the photos catch the light (R-78) |
| Closed black notebook (165×244) | Writing | `/writing`, then `/<essay-slug>` | cover flips open in 3D into empty space; a Muji gel pen (clear frosted barrel, drawn in SVG) lies on the right page. Click the pen to pick it up: it follows the pointer, tip first, and the cursor hides. Press and drag on the right page to write in black gel ink. A press off the page, or Esc, puts it back. The ink stays in the browser; "tidy up" wipes the page (R-75) |
| Blue folder with three glossy photo prints (Embedr board, Unify team in front, Podcast Sync poster) | Projects | `/projects` (HealthOS there is the way to Health) | prints rise, fan out, and float |
| Silver Motorola RAZR V3, own right-hand column | Socials | contacts | lifts, straightens, scales 1.4× (R-89); lock screen wakes to Contacts; ↑/↓ + Enter or click a row (LinkedIn, X, GitHub, Email, Beli, Book a call); hint bottom-right |
| Paper render of the resume | Resume | resume page | lift; click plays the hyperspace zoom |
| Three book covers | Bookshelf | `/bookshelf` | books fan out; the covers catch the light (R-78) |
| Black coffee on a saucer with spoon, three sugar cubes beside it | Coffee chat | cal.com/savar-gupta/coffee-chat | lift; drag a cube into the cup: cartoon splash (outlined drops, splat, "plop!", ripples, cup squash-and-stretch); caption counts sugars; cubes respawn; first cube toasts "I take mine black, but you do you." |
| Ramen | Food | `/food` | steam rises |
| Glass piggy bank full of loonies, right of the greeting under Socials | Investing | `/investing` | a loonie peeks out of the slot; click: the loonie flips up and drops back in, then the page opens (I-11). Desk layout L1 (I-10) also moved Resume and Coffee chat (85%), Food, and Bookshelf; contract: `.design/investing/DESIGN.md` |

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
- **Pages:** in the prototype, Travel, Writing, and Projects open as pages that the object flies into. On the site they are real routes (`/travel`, `/writing`, `/projects`, `/bookshelf`, `/food`, and `/about` from the name): the route opens in the same tab. Where the browser supports view transitions, the object flies into its page (R-66): the three polaroids into their album covers on the phone on `/travel` (R-83), the notebook into `/writing`, the folder's three prints into their own project cards (Unify, Embedr, Podcast Sync), the three books into their covers on `/bookshelf`, the name into the header name on `/about` (R-76); "back to the desk" flies them back (640 ms, slight overshoot; old image fades out in 260 ms, new fades in). Elsewhere the object lifts (1.08×) and the desk fades (240 ms).
- **Projects page (R-90, R-91):** one project at a time on a rail, on a page that does not scroll. The page is exactly one screen tall: the back bar, the name, the title, then the rail fills the rest: the card (36rem tall, shorter when the window is) and the counter row under it sit in the middle of that space, so the gaps above and below are even. The mouse wheel, a trackpad (vertical or sideways), a touch swipe (either direction), the arrow, Page, Home, and End keys, Space, and the previous and next buttons move the row of cards sideways. The cards trail the input by a 0.16 s ease and settle on one card after each gesture; a nudge of more than 0.12 card (one wheel notch, a short swipe) or a flick goes on to the next card, and the rail gives 0.12 card past either end. The middle card is full size; its neighbours sit back (scale 0.92, opacity 0.5, turned 6deg toward the middle) and peek in from the window edges. Under the card: previous and next buttons, a progress line, and "03 / 07". Each card: number and category, name, a one- or two-line blurb (`blurb` in `lib/projects.ts`), role and dates, stats for Unify, a dark "Case study ->" pill whose hit area covers the card (it opens `/projects/<slug>`), and the project's site link. Media keeps its own shape on the right (phones on top): Unify's three looping screen recordings in real phone frames (a thin black bezel, a 1px titanium edge, side buttons), Embedr's YouTube demo (click to play), Podcast Sync's launch video (muted loop with sound and pause buttons), Rocketry's engine CAD; a project with no real media shows its tools under "Built with". Only the middle card plays video, and a video loads only when its card first reaches the middle. A click on a neighbour brings it to the middle; so does Tab. Short windows (800px or less) and phones tighten the header, hide the stats, and clamp the blurb to three lines so the card fits. The desk's three prints fly into the first three cards. Reduced motion: the cards sit in a plain list and the page scrolls. The long "What I did" detail moves to the case study pages. The GitHub graph is not on this page (the component stays for reuse).
- **Food page (F-1, F-3):** `/food` is the ranked list beside a real street map in Airbnb's quiet colours (water `#cae8f2`, land `#f4f2ef`, parks `#dbf2c4`, white roads, small grey labels; a dark version follows the system). Free OpenFreeMap "Liberty" tiles, recoloured in `app/(pages)/food/_components/map-style.ts`; other restaurants, shops, and bus stops are hidden. Each place is a white pill with its Beli score; nearby places group into an "N places" pill that zooms in on click. Chips step Everywhere, country, province, with counts, and the list shows what is in the map view, best first. Hovering a row turns its pin black; clicking a row or pin opens a card (rank of the total, cuisines, name, score, price, area, Google Maps link). Esc closes the card, then steps back. The view is in the URL (`#CAN/CA-BC`, `#@12`). The list renders on the server; the map loads in the browser. The page is full width with no name header, as in the prototype (F-5): the list column is 40% (at least 380px), the map runs to the right edge of the window and stays in view while the list scrolls, and it refits on resize until the visitor pans or zooms. Phones get title, chips, a square map, then the list. No flight from the desk (lift and fade).
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
- Food: `lib/food.ts`, Savar's Beli "Been" list, all 238 places, read from his two screen recordings of 2026-10-13 (Beli has no export; F-6). One place that joined his top 67 between the recordings is missing, so from #67 the site's ranks are one lower than Beli's. Coordinates from Apple Maps and OpenStreetMap searches, each checked against the distance Beli showed; 5 places are approximate (`approx: true`). The desk's Beli contact links still go to his Beli profile.
- Trips (albums on `/travel`, newest first): Bali (Aug–Sep 2026), Joffre Lakes (Aug 2026), Turkey (Mar–Apr 2026), California (Dec 2025), Maui (Dec 2025, with the vlog `public/videos/maui-2025.mp4`), Japan (Aug–Sep 2025), Banff (2025). 146 photos Savar approved, data in `lib/travel.ts`, files in `public/travel/` (R-84).
- `/travel` (R-80): an iPhone 18 Pro Max open on the Photos app, iOS 26/27 design: Albums first (2 columns of covers under Personal / Shared / Activity), album grids (3 columns; pinch for 1 or 5), Library (5 columns), Collections. A photo zooms out of its thumbnail; swipe sideways, swipe down to close, tap to hide the buttons. Frame: Silver (R-81), drawn in CSS; system font stack; icons drawn for the page (Apple's bezels, SF fonts and SF Symbols are not licensed for websites). Phones (≤600 px): no frame, the page is the app. The page has no header name; the phone fills the space under "back to the desk".
- The Maui vlog (R-82) is a full-width tile above the albums that loops silently; a tap turns the phone to landscape and plays it with sound (on phones the video turns sideways). It is also the last item in Maui.
- Projects: Unify (co-founder; landing page, mobile app, web app, each with a GitHub repo), Taskline, Embedr (Product & GTM; embedr.app, studio.embedr.app, YouTube ZQaxrc0SsEA from 0:13), Podcast Sync (solo, Oct 2026; github.com/Savar-G/podcast-sync), Health & Activity Wearable, HealthOS (health.savargupta.com). Facts match the Sep 2026 resume; Podcast Sync facts come from its repo.
- Videos load only on click, behind a poster with a play button. Posters go through the image optimizer, so they are sized to the screen and served from this site (YouTube's too).

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
