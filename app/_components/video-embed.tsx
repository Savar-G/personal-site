"use client";

import { useState } from "react";

type Props = {
  title: string;
  poster?: string;
  // "iframe": a third-party player URL. "video": a file this site hosts.
  kind: "iframe" | "video";
  src: string;
};

// A poster with a play button. The player (or the video file) loads only on
// click, so the page stays fast and sets no video cookies until then.
export function VideoEmbed({ title, poster, kind, src }: Props) {
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
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
          onClick={() => setPlaying(true)}
        >
          <span className="video-embed-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          </span>
          <span className="sr-only">Play video: {title}</span>
        </button>
      )}
    </div>
  );
}
