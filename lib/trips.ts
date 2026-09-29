export type Trip = {
  name: string;
  places?: string;
  // The same photo as the polaroid on the desk; it flies here from there.
  polaroid?: { src: string; caption: string; tilt: number };
  video?: { src: string; poster: string; title: string };
};

export const trips: Trip[] = [
  {
    name: "Japan",
    polaroid: { src: "/desk/trip_japan.webp", caption: "japan", tilt: -4 },
  },
  {
    name: "Turkey",
    places: "Istanbul · Cappadocia · Antalya · 2026",
    polaroid: { src: "/desk/trip_cappadocia.webp", caption: "turkey", tilt: 2 },
  },
  {
    name: "Indonesia",
    places: "Bali · Aug 2026",
    polaroid: { src: "/desk/trip_bali.webp", caption: "indonesia", tilt: -3 },
  },
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
