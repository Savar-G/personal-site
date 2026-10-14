# Share card - decisions

## O-1 (2026-10-14): "Scrapbook" replaces the "SG" card

- **Chosen:** D "Scrapbook" from round 1 (`r1/manifest.json`): real trip photos and project prints taped down around a "Hi, I'm Savar." note.
- **Why the old card went:** it used the retired "SG" monogram (replaced by the "Plop" icon, I-1) and was plain text on grey.
- **Rejected:** A "The desk" (a crop of the homepage desk; busy, objects tiny at chat size), B "Plop" (brand-blue card with the sugar-cube icon; the agent's pick for legibility was C, B was the safe pick), C "Incoming call" (RAZR ringing in the dark; the agent's recommendation; risk of reading as a spam call).
- **Accepted cost:** the busiest of the four; at about 300 px the photos read as texture and the note carries the name.
- **Build:** a static JPEG rendered from HTML with headless Chrome, not `next/og`. It keeps the CSS (shadows, tape, handwriting font) exact and costs nothing at request time.
