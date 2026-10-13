import localFont from "next/font/local";

// Spine lettering for the 3D shelf. A book's `spine` spec (or, without one, its
// `spineType`) names these families; shelf-engine.js reads the --font-spine-*
// variable to paint the spine canvas. The files are the Google Fonts latin
// subsets, kept in ../_fonts so the build never fetches fonts (next/font/google
// failed intermittently on eight families). Most are variable fonts, so the
// weight is a range. preload: false - the engine loads only the faces it draws.
// (next/font needs literal options in every call.)
const alfaSlab = localFont({ src: "../_fonts/alfa-slab-one.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-alfa-slab-one" });
const almendra = localFont({ src: "../_fonts/almendra.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-almendra" });
const amatic = localFont({ src: "../_fonts/amatic-sc-700.woff2", weight: "700", display: "swap", preload: false, variable: "--font-spine-amatic-sc" });
const barlow = localFont({ src: "../_fonts/barlow-700.woff2", weight: "700", display: "swap", preload: false, variable: "--font-spine-barlow" });
const bebas = localFont({ src: "../_fonts/bebas-neue.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-bebas-neue" });
const bitter = localFont({
  src: [
    { path: "../_fonts/bitter.woff2", weight: "100 900", style: "normal" },
    { path: "../_fonts/bitter-italic.woff2", weight: "100 900", style: "italic" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-spine-bitter",
});
const cinzel = localFont({ src: "../_fonts/cinzel.woff2", weight: "400 900", display: "swap", preload: false, variable: "--font-spine-cinzel" });
const cormorant = localFont({
  src: [
    { path: "../_fonts/cormorant-garamond.woff2", weight: "300 700", style: "normal" },
    { path: "../_fonts/cormorant-garamond-italic.woff2", weight: "300 700", style: "italic" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-spine-cormorant-garamond",
});
const dmSerif = localFont({ src: "../_fonts/dm-serif-display.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-dm-serif-display" });
const baskerville = localFont({
  src: [
    { path: "../_fonts/libre-baskerville-400.woff2", weight: "400", style: "normal" },
    { path: "../_fonts/libre-baskerville.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-spine-libre-baskerville",
});
const michroma = localFont({ src: "../_fonts/michroma.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-michroma" });
const montserrat = localFont({ src: "../_fonts/montserrat.woff2", weight: "100 900", display: "swap", preload: false, variable: "--font-spine-montserrat" });
const oswald = localFont({ src: "../_fonts/oswald.woff2", weight: "400 700", display: "swap", preload: false, variable: "--font-spine-oswald" });
const playfair = localFont({
  src: [
    { path: "../_fonts/playfair-display.woff2", weight: "400 900", style: "normal" },
    { path: "../_fonts/playfair-display-italic.woff2", weight: "400 900", style: "italic" },
  ],
  display: "swap",
  preload: false,
  variable: "--font-spine-playfair-display",
});
const saira = localFont({ src: "../_fonts/saira.woff2", weight: "100 900", display: "swap", preload: false, variable: "--font-spine-saira" });
const sourceSerif = localFont({ src: "../_fonts/source-serif-4.woff2", weight: "200 900", display: "swap", preload: false, variable: "--font-spine-source-serif-4" });
// The detail card's serif.
const newsreader = localFont({ src: "../_fonts/newsreader.woff2", weight: "500", display: "swap", preload: false, variable: "--font-newsreader" });

export const spineFontVars = [
  alfaSlab, almendra, amatic, barlow, bebas, bitter, cinzel, cormorant, dmSerif,
  baskerville, michroma, montserrat, oswald, playfair, saira, sourceSerif, newsreader,
]
  .map((f) => f.variable)
  .join(" ");
