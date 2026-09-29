import type { Metadata } from "next";
import Image from "next/image";
import { Reenie_Beanie } from "next/font/google";
import { ViewTransition } from "react";
import { VideoEmbed } from "@/app/_components/video-embed";
import { trips } from "@/lib/trips";

const reenieBeanie = Reenie_Beanie({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-reenie-beanie",
});

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

      {/* The desk's polaroids fly into these (view transitions). */}
      <div className={`polaroids ${reenieBeanie.variable}`}>
        {trips.flatMap(({ polaroid }) =>
          polaroid
            ? [
                <ViewTransition
                  key={polaroid.caption}
                  name={`polaroid-${polaroid.caption}`}
                  share="flight"
                >
                  <figure
                    className="polaroid"
                    style={{ rotate: `${polaroid.tilt}deg` }}
                  >
                    <Image
                      src={polaroid.src}
                      alt={`${polaroid.caption}, trip photo`}
                      width={520}
                      height={520}
                      sizes="(max-width: 640px) 30vw, 176px"
                    />
                    <figcaption>{polaroid.caption}</figcaption>
                  </figure>
                </ViewTransition>,
              ]
            : [],
        )}
      </div>

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
