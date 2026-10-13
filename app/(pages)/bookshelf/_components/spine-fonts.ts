import localFont from "next/font/local";

// Spine lettering for the 3D shelf. Each book's `spineType` names one of these
// families; shelf-engine.js reads the --font-spine-* variable to paint the
// spine canvas. The files are the Google Fonts latin subsets, kept in ../_fonts
// so the build never fetches fonts (next/font/google failed intermittently on
// eight families). preload: false - the engine loads only the faces it draws.
// (next/font needs literal options in every call.)
const bebas = localFont({ src: "../_fonts/bebas-neue.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-bebas-neue" });
const cinzel = localFont({ src: "../_fonts/cinzel.woff2", weight: "500 600", display: "swap", preload: false, variable: "--font-spine-cinzel" });
const cormorant = localFont({ src: "../_fonts/cormorant-garamond.woff2", weight: "500 700", display: "swap", preload: false, variable: "--font-spine-cormorant-garamond" });
const dmSerif = localFont({ src: "../_fonts/dm-serif-display.woff2", weight: "400", display: "swap", preload: false, variable: "--font-spine-dm-serif-display" });
const baskerville = localFont({ src: "../_fonts/libre-baskerville.woff2", weight: "700", display: "swap", preload: false, variable: "--font-spine-libre-baskerville" });
const oswald = localFont({ src: "../_fonts/oswald.woff2", weight: "500 600", display: "swap", preload: false, variable: "--font-spine-oswald" });
const playfair = localFont({ src: "../_fonts/playfair-display.woff2", weight: "600 700", display: "swap", preload: false, variable: "--font-spine-playfair-display" });
// The detail card's serif.
const newsreader = localFont({ src: "../_fonts/newsreader.woff2", weight: "500", display: "swap", preload: false, variable: "--font-newsreader" });

export const spineFontVars = [bebas, cinzel, cormorant, dmSerif, baskerville, oswald, playfair, newsreader]
  .map((f) => f.variable)
  .join(" ");
