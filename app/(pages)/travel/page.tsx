import type { Metadata } from "next";
import { VideoEmbed } from "@/app/_components/video-embed";
import { trips } from "@/lib/trips";

export const metadata: Metadata = {
  title: "Travel",
  description: "Trips by Savar Gupta: Japan, Turkey, Indonesia, and Hawaii.",
};

export default function TravelPage() {
  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-9 sm:pb-11">
        <h1 className="page-title">Travel</h1>
        <p className="mt-3 max-w-prose text-stone-500">
          Trips, photos, and the occasional video.
        </p>
      </header>

      <div className="stagger-children">
        {trips.map((trip) => (
          <article key={trip.name} className="project">
            <h2 className="project-name">{trip.name}</h2>
            {trip.places && <p className="entry-meta">{trip.places}</p>}

            {trip.video && (
              <VideoEmbed
                kind="video"
                title={trip.video.title}
                poster={trip.video.poster}
                src={trip.video.src}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
