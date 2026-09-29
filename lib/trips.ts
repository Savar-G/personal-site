export type Trip = {
  name: string;
  places?: string;
  video?: { src: string; poster: string; title: string };
};

// Photos come later: the desk's trip photos are AI stand-ins and stay off the site.
export const trips: Trip[] = [
  { name: "Japan" },
  { name: "Turkey", places: "Istanbul · Cappadocia · Antalya · 2026" },
  { name: "Indonesia", places: "Bali · Aug 2026" },
  {
    name: "Hawaii",
    places: "Maui · 2025",
    video: {
      src: "/videos/maui-2025.mp4",
      poster: "/videos/maui-2025.webp",
      title: "Hawaii 2025, a Maui vlog",
    },
  },
];
