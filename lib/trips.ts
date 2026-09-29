export type Trip = {
  name: string;
  places?: string;
  vlog?: { tiktokId: string; title: string; href: string };
};

// Photos come later: the desk's trip photos are AI stand-ins and stay off the site.
export const trips: Trip[] = [
  { name: "Japan" },
  { name: "Turkey", places: "Istanbul · Cappadocia · Antalya · 2026" },
  { name: "Indonesia", places: "Bali · Aug 2026" },
  {
    name: "Hawaii",
    places: "Maui",
    vlog: {
      tiktokId: "7653625122300906772",
      title: "Maui vlog",
      href: "https://www.tiktok.com/@savargupta03/video/7653625122300906772",
    },
  },
];
