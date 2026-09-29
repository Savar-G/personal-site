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

            {trip.vlog && (
              <>
                <VideoEmbed
                  shape="tall"
                  title={trip.vlog.title}
                  src={`https://www.tiktok.com/player/v1/${trip.vlog.tiktokId}?autoplay=1&rel=0`}
                />
                <a
                  href={trip.vlog.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press group mt-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
                >
                  Watch on TikTok
                  <span
                    aria-hidden="true"
                    className="icon-shift text-[12px] leading-none group-hover:translate-x-0.5"
                  >
                    ↗
                  </span>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
