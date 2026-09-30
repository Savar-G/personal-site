"use client";

import { useState } from "react";

type Props = {
  title: string;
  poster?: string;
  // Optional caption shown on the poster, e.g. "Demo · <title>".
  label?: string;
  // "iframe": a third-party player URL. "video": a file this site hosts.
  kind: "iframe" | "video";
  src: string;
};

// A poster with a play button. The player (or the video file) loads only on
// click, so the page stays fast and sets no video cookies until then.
export function VideoEmbed({ title, poster, label, kind, src }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="video-embed">
      {playing ? (
        kind === "video" ? (
          <video
            src={src}
            poster={poster}
            title={title}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <iframe
            src={src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )
      ) : (
        <button
          type="button"
          className="video-embed-poster"
          onClick={() => setPlaying(true)}
        >
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element -- a remote poster; lazy so it never competes with the page
            <img
              src={poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="video-embed-poster-img"
            />
          )}
          <span className="video-embed-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          </span>
          {label && (
            <span className="video-embed-label" aria-hidden="true">
              {label}
            </span>
          )}
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
