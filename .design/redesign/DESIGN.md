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
- "Savar." is a link to `/about`. Hover and focus: the highlight darkens to `#D3E1FC` and the name lifts 2px and turns -2°.
- "Studying Mechatronics Engineering and Business @ SFU. Building at the intersection of hardware, software, and AI." Inter 17px, `#52525B`, max 500px.
- "Click anything to learn more about me." Inter 14px, `#A1A1AA`, with a hand icon that taps three times (fingertip ripple), rests, and stops after the first object hover. Phone: "Tap anything…".

## The desk (desktop, 1440×900 stage scaled to fit)

White page. Photographic objects around the greeting. Every object has a level caption under it (Inter 12px, 500, `#52525B`; `#18181B` on hover). Objects can be dragged; a press that moves less than 4px is a click. Each object's open or active footprint lands on empty desk.

| Object | Caption | Opens | Hover |
|---|---|---|---|
| Three CSS polaroids with Savar's photos (sushi, Cappadocia balloons, Indonesian sea cliffs), handwritten japan / turkey / indonesia | Travel | `/travel` | polaroids fan out |
| Closed black notebook (165×244) | Writing | `/writing`, then `/<essay-slug>` | cover flips open in 3D into empty space; pen on the page |
| Blue folder with three blank papers | Projects | `/projects` (HealthOS there is the way to Health) | papers rise, fan out, and float |
| Silver Motorola RAZR V3, own right-hand column | Socials | contacts | lifts, straightens, scales 1.5×; lock screen wakes to Contacts; ↑/↓ + Enter or click a row (LinkedIn, X, GitHub, Email, Beli, Book a call); hint bottom-right |
| Paper render of the resume | Resume | resume page | lift; click plays the hyperspace zoom |
| Three book covers | Bookshelf | `/bookshelf` | books fan out |
| Black coffee on a saucer with spoon, three sugar cubes beside it | Coffee chat | cal.com/savar-gupta/embedr | lift; drag a cube into the cup: cartoon splash (outlined drops, splat, "plop!", ripples, cup squash-and-stretch); caption counts sugars; cubes respawn; first cube toasts "I take mine black, but you do you." |
| Ramen | Food | beliapp.co/app/savargupta | steam rises |

**Default hover:** translateY -6px, rotate +2°, scale 1.03, 180 ms `cubic-bezier(0.2, 0.8, 0.2, 1)`.

**Resume hyperspace:** a black iris closes on the paper (650 ms); the page pulls back 8%, then flies to the centre through star streaks and lands at reading size (1250 ms, overshoot to 105%); a black page with "back to desk" and "download pdf". Back and Esc reverse it (900 ms).

## Behaviour extras (desktop)

- **Load:** greeting fades up; objects land one after another with a small bounce; sugar cubes last. On the site this plays once per browser session; a return to the desk fades in (240 ms).
- **First visit:** polaroids develop from blank white to colour (stored, so it plays once).
- **Coffee:** steams for 60 s, then goes cold; hover then shows "gone cold · grab a fresh one with me →".
- **Drag:** the object lifts (−10px, 1.06×, soft shadow) and settles with a bounce on drop; a "tidy up" button (top right) returns every moved object.
- **Plain list:** "prefer a list? →" (top left) opens a text page: bio, work, projects, writing, resume, About, bookshelf, Things, travel, contact (with Beli and Book a call).
- **Phone:** after 20 s without input it rings ("INCOMING CALL · Savar", caption "Savar is calling…"); Answer = coffee chat, Ignore; unanswered = "1 MISSED CALL".
- **Ghost:** catches persist and each one shows a fun fact (true facts only); sugar count persists.
- **Pages:** in the prototype, Travel, Writing, and Projects open as pages that the object flies into. On the site they are real routes (`/travel`, `/writing`, `/projects`, `/bookshelf`, and `/about` from the name): the route opens in the same tab. Where the browser supports view transitions, the object flies into its page (R-66): the three polaroids into the polaroid strip on `/travel`, the notebook into `/writing`, the folder's three papers into the first three projects, the three books into their covers on `/bookshelf`; "back to the desk" flies them back (640 ms, slight overshoot; old image fades out in 260 ms, new fades in). Elsewhere the object lifts (1.08×) and the desk fades (240 ms).
- **Inner pages (site):** no menu. "← back to the desk" sits top left on every inner page and under each essay. The name in the page header links to `/about`. Light and dark follow the system, with the desk's tokens.
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
- Desktop-only: fan-outs, notebook flip, floating papers, steam, phone zoom, keyboard hint.

## Type and colour

- Inter for all UI text. Courier Prime Bold for small instructional text (phone hint, "plop!", resume viewer buttons). Reenie Beanie only for the handwriting on polaroids. Pixelify Sans only on the RAZR screen.
- Page `#FFFFFF`; ink `#18181B`; body `#52525B`; muted `#A1A1AA`. RAZR screen `#0A1B3D`, header `#2F6BD8`, selection `#F59E0B`.

## Content facts

- Resume: `public/Savar_Gupta_Resume.pdf` is the Sep 18, 2026 version (same file as `~/Documents/Savar_Gupta_Resume.pdf`).
- Socials: linkedin.com/in/savar-gupta, x.com/savar_gupta, github.com/Savar-G, savar.gupta1922@gmail.com, beliapp.co/app/savargupta.
- Coffee chat: cal.com/savar-gupta/embedr?user=savar-gupta&overlayCalendar=true.
- Things (`/things`) has no desk object; it is in the plain list only.
- Trips: Japan; Turkey 2026 (Istanbul, Cappadocia, Antalya); Indonesia (Bali, Aug 2026); Hawaii (Maui, 2025; self-hosted vlog `public/videos/maui-2025.mp4`, poster `maui-2025.webp`). Hawaii is on the Travel page only.
- Projects: Unify (co-founder; landing page, mobile app, web app, each with a GitHub repo), Taskline, Embedr (Product & GTM; embedr.app, studio.embedr.app, YouTube ZQaxrc0SsEA from 0:13), Health & Activity Wearable, HealthOS (health.savargupta.com). Facts match the Sep 2026 resume.
- Videos load only on click, behind a poster with a play button.

## Accessibility

- Every object is focusable; Enter opens it; focus shows the hover state.
- The phone takes focus; arrow keys move, Enter opens.
- Reduced motion: no lift, flip, fan-out, flight, splash, or steam. Captions stay. The resume opens with a fade.

## Open

- Object photos are AI stand-ins. (Trip photos are Savar's own since R-58.)
- Desktop canvas frame is behind the prototype; resync before build.

## Exclusions

- No invented metrics, roles, or testimonials.
- No AI-generated image of Savar.
