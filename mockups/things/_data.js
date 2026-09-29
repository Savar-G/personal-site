/* The five products, with cutouts generated from official retail shots.
 *
 * `ratio` is the true aspect ratio of each cutout (w/h). It runs from 0.60 to
 * 2.44, which is the whole layout problem: these objects will never share a box.
 * `h` is a hand-tuned display height in rem so a row of them reads as a set of
 * real objects at plausible relative scale, not as five equal thumbnails.
 *
 * Every `why` below is PLACEHOLDER. Savar writes the real ones. Lengths vary on
 * purpose so each layout is tested against a one-liner and a four-sentence entry.
 */
window.THINGS = [
  {
    slug: "kindle-paperwhite",
    name: "Kindle Paperwhite",
    type: "E-reader",
    img: "img/kindle-paperwhite.png",
    ratio: 0.88,
    h: 10.3,
    owned: "Since 2021",
    placeholder: true,
    why: "Your reason goes here. Two to four sentences, first person, specific — what it replaced, what changed, the one detail nobody mentions in reviews. This placeholder runs to a realistic length so the layout is honest about how much room the real copy needs.",
  },
  {
    slug: "airpods-pro-3",
    name: "AirPods Pro 3",
    type: "Earbuds",
    img: "img/airpods-pro-3.png",
    ratio: 0.6,
    h: 10.9,
    owned: "Since 2025",
    placeholder: true,
    why: "A deliberately short entry — one sentence, to prove the layout survives an uneven set.",
  },
  {
    slug: "mx-master-3s",
    name: "Logitech MX Master 3S",
    type: "Mouse",
    img: "img/mx-master-3s.png",
    ratio: 1.74,
    h: 6.4,
    owned: "Since 2022",
    placeholder: true,
    why: "Your reason goes here. This one runs long on purpose — four sentences — because the horizontal scroll wheel and the per-app button mapping are the kind of thing that takes a paragraph to justify. If the longest entry breaks a layout, it breaks here. Everything above this line is placeholder text.",
  },
  {
    slug: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    type: "Phone",
    img: "img/iphone-16-pro-max.png",
    ratio: 0.8,
    h: 10.9,
    owned: "Since 2024",
    placeholder: true,
    // Savar's own words are the seed; the rest is placeholder.
    why: "I vlog using this. — the rest of the reason goes here, in your voice, two or three more sentences about why this camera in this pocket beat carrying a real one.",
  },
  {
    slug: "halos-sleep-mask",
    name: "MyHalos Blackout Sleep Mask",
    type: "Sleep mask",
    img: "img/halos-sleep-mask.png",
    ratio: 2.44,
    h: 5.1,
    owned: "Since 2024",
    placeholder: true,
    why: "Your reason goes here. The widest object in the set and the cheapest — a good test of whether a small everyday thing can sit beside a phone without looking like an afterthought.",
  },
];
