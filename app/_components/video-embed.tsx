"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  title: string;
  poster?: string;
  // Optional caption shown on the poster, e.g. "Demo · <title>".
  label?: string;
  // "iframe": a third-party player URL. "video": a file this site hosts.
  kind: "iframe" | "video";
  src: string;
  // The poster's rendered width, so a phone fetches a smaller copy.
  sizes?: string;
};

// Starts the video as it mounts, still inside the click, so iOS lets it play
// with sound. A stable function, so React calls it once.
function playOnMount(video: HTMLVideoElement | null) {
  video?.play().catch(() => {});
}

// A poster with a play button. The player (or the video file) loads only on
// click, so the page stays fast and sets no video cookies until then. The
// poster goes through the image optimizer: it is sized to the screen and
// served from this site, even for a YouTube video.
export function VideoEmbed({
  title,
  poster,
  label,
  kind,
  src,
  sizes = "100vw",
}: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="video-embed">
      {playing ? (
        kind === "video" ? (
          <video
            ref={playOnMount}
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
            <Image
              src={poster}
              alt=""
              fill
              sizes={sizes}
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
