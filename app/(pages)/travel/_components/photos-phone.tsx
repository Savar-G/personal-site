"use client";

import { Fragment, useLayoutEffect, useRef, ViewTransition } from "react";
import type { TravelAlbum } from "@/lib/travel";
import { mountPhotos } from "./photos-engine";
import "./photos.css";

// /travel: an iPhone 18 Pro Max open on the Photos app (R-80). React renders
// the phone and its first screen, Albums, so the desk's polaroids can fly into
// their album covers (<ViewTransition>, R-83). photos-engine.js does the rest:
// the other screens, the viewer, and the vlog. It mounts in a layout effect so
// the phone is scaled before the browser takes the view transition's "new"
// snapshot.

// Before the first paint on a full page load, scale the phone to the stage.
// (React does not run this on a client-side navigation; the engine does it.)
const PREPAINT = `(function(){var s=document.currentScript&&document.currentScript.parentElement;if(!s||matchMedia("(max-width: 600px)").matches)return;var d=s.querySelector(".device");if(d)d.style.setProperty("--s",String(Math.min(1,(s.clientWidth-32)/471,(s.clientHeight-32)/987)))})();`;

export function PhotosPhone({ albums }: { albums: TravelAlbum[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    return mountPhotos(ref.current, albums);
  }, [albums]);

  const items = albums.flatMap((a) => a.items);
  const photoCount = items.filter((i) => i.type === "photo").length;
  const vlog = items.find((i) => i.type === "video");

  return (
    <div ref={ref} className="photos-stage">
      <h1 className="sr">Travel</h1>
      <p className="stage-cap">
        <b>Travel</b>
        {albums.length} trips, {photoCount} photos and a Maui vlog, all shot on
        iPhone.
      </p>
      <Icons />

      <div className="device enter">
        <div className="bezel">
          <span className="btn-hw l" style={{ top: 178, height: 36 }} />
          <span className="btn-hw l" style={{ top: 246, height: 62 }} />
          <span className="btn-hw l" style={{ top: 322, height: 62 }} />
          <span className="btn-hw r" style={{ top: 290, height: 98 }} />
          <span
            className="btn-hw r"
            style={{ top: 592, height: 52, width: 4, right: -2.5 }}
          />
          <div className="screen">
            <div className="views">
              <section className="view" data-kind="albums">
                <div className="scroll">
                  <div style={{ paddingTop: "calc(var(--st) + 56px)" }}>
                    <div className="seg glass" role="group" aria-label="Album type">
                      <button aria-pressed="true">Personal</button>
                      <button aria-pressed="false" data-inert="Shared albums">
                        Shared
                      </button>
                      <button aria-pressed="false" data-inert="Activity">
                        Activity
                      </button>
                    </div>
                    {vlog && (
                      <button
                        className="hero"
                        data-open-video
                        aria-label="Play the Maui vlog"
                      >
                        <video
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                          poster={vlog.thumb}
                          src={vlog.src}
                        />
                        <span className="meta">
                          <small>Vlog · {vlog.duration}</small>
                          <b>Maui 2025</b>
                        </span>
                        <span className="pbtn">
                          <Icon id="play" fill size={20} />
                        </span>
                      </button>
                    )}
                    <div className="covers">
                      {albums.map((a, i) => {
                        const cover = a.coverImage ?? a.items[a.cover].thumb;
                        const button = (
                          <button
                            className="cover"
                            data-album={i}
                            aria-label={`${a.title}, ${a.items.length} items`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized webp, the engine animates it */}
                            <img src={cover} alt="" />
                            <span>{a.title}</span>
                          </button>
                        );
                        return a.polaroid ? (
                          <ViewTransition key={a.id} name={a.polaroid} share="flight">
                            {button}
                          </ViewTransition>
                        ) : (
                          <Fragment key={a.id}>{button}</Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="edge" />
                <div className="dim" />
                <div className="navbar">
                  <button className="gbtn glass" data-back aria-label="Back">
                    <Icon id="chev-l" />
                  </button>
                  <h2>Albums</h2>
                  <div className="gcap glass r">
                    <button data-inert="New album" aria-label="New album">
                      <Icon id="plus" />
                    </button>
                    <button data-inert="Sort and filter" aria-label="More">
                      <Icon id="more" />
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <nav className="tabbar" aria-label="Photos">
              <div className="tabs glass" role="tablist">
                <button role="tab" data-tab="library" aria-selected="false">
                  <Icon id="lib" />
                  Library
                </button>
                <button role="tab" data-tab="collections" aria-selected="true">
                  <Icon id="coll" />
                  Collections
                </button>
              </div>
              <button className="searchb glass" data-inert="Search" aria-label="Search">
                <Icon id="search" size={24} />
              </button>
            </nav>

            <div className="status" aria-hidden="true">
              <div className="time">9:41</div>
              <div className="icons">
                <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
                  <rect x="0" y="8" width="3.2" height="4" rx="1" />
                  <rect x="5" y="5.5" width="3.2" height="6.5" rx="1" />
                  <rect x="10" y="3" width="3.2" height="9" rx="1" />
                  <rect x="15" y="0" width="3.2" height="12" rx="1" />
                </svg>
                <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                  <path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.6 10.6 0 0 0 8.5.5 10.6 10.6 0 0 0 1 3.5l1.2 1.3a9 9 0 0 1 6.3-2.5Zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3A7.1 7.1 0 0 0 8.5 4.1 7.1 7.1 0 0 0 3.6 6l1.2 1.3c1-.9 2.3-1.4 3.7-1.4Zm0 3.6c.5 0 1 .2 1.3.5L8.5 11.5 7.2 10c.3-.3.8-.5 1.3-.5Z" />
                </svg>
                <svg width="28" height="13" viewBox="0 0 28 13">
                  <rect x=".5" y=".5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4" />
                  <rect x="2.2" y="2.2" width="17" height="8.6" rx="2.4" fill="currentColor" />
                  <path d="M26 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity=".45" />
                </svg>
              </div>
            </div>
            <div className="island" aria-hidden="true" />
            <div className="home-ind" aria-hidden="true" />
            <div className="toast glass" role="status" aria-live="polite" />
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
    </div>
  );
}

function Icon({ id, fill, size }: { id: string; fill?: boolean; size?: number }) {
  return (
    <svg
      className={fill ? "i fill" : "i"}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <use href={`#ph-${id}`} />
    </svg>
  );
}

// Icons drawn for this page in the spirit of SF Symbols (SF Symbols may not be
// used on the web). The engine uses them as <use href="#ph-...">.
function Icons() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="ph-chev-l" viewBox="0 0 24 24"><path d="M15 4.5 7.5 12l7.5 7.5" /></symbol>
      <symbol id="ph-chev-r" viewBox="0 0 24 24"><path d="M9 4.5 16.5 12 9 19.5" /></symbol>
      <symbol id="ph-chev-d" viewBox="0 0 24 24"><path d="M5 9l7 7 7-7" /></symbol>
      <symbol id="ph-more" viewBox="0 0 24 24">
        <circle cx="5.5" cy="12" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
        <circle cx="18.5" cy="12" r="1.7" fill="currentColor" stroke="none" />
      </symbol>
      <symbol id="ph-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
      <symbol id="ph-heart" viewBox="0 0 24 24"><path d="M12 20.2S4.2 15.6 4.2 9.6A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.8 2.2c0 6-7.8 10.6-7.8 10.6Z" /></symbol>
      <symbol id="ph-info" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6" />
        <circle cx="12" cy="7.6" r="1.1" fill="currentColor" stroke="none" />
      </symbol>
      <symbol id="ph-sliders" viewBox="0 0 24 24">
        <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
        <circle cx="15" cy="7" r="2.2" />
        <circle cx="9" cy="17" r="2.2" />
      </symbol>
      <symbol id="ph-trash" viewBox="0 0 24 24"><path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13M10 10.5v6M14 10.5v6" /></symbol>
      <symbol id="ph-share" viewBox="0 0 24 24"><path d="M12 3.5v11M8 7.5l4-4 4 4M8.5 10.5H6.5v9.5h11v-9.5h-2" /></symbol>
      <symbol id="ph-search" viewBox="0 0 24 24">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.6 15.6 4.4 4.4" />
      </symbol>
      <symbol id="ph-lib" viewBox="0 0 24 24">
        <rect x="3" y="7" width="14" height="13" rx="2.5" />
        <path d="M7 4h11.5A2.5 2.5 0 0 1 21 6.5V16" />
        <path d="m6 17 3.2-3.6 2.6 2.6 1.6-1.6 2.6 2.6" />
      </symbol>
      <symbol id="ph-coll" viewBox="0 0 24 24">
        <rect x="3.5" y="9" width="17" height="11.5" rx="2.5" />
        <path d="M5.5 6h13M7.5 3h9" />
      </symbol>
      <symbol id="ph-play" viewBox="0 0 24 24"><path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8Z" fill="currentColor" stroke="none" /></symbol>
      <symbol id="ph-pause" viewBox="0 0 24 24">
        <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
        <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none" />
      </symbol>
      <symbol id="ph-spk" viewBox="0 0 24 24">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
      </symbol>
      <symbol id="ph-spk-off" viewBox="0 0 24 24">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        <path d="m16 9.5 5 5m0-5-5 5" />
      </symbol>
      <symbol id="ph-xmark" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11m0-11-11 11" /></symbol>
      <symbol id="ph-filter" viewBox="0 0 24 24"><path d="M5 8h14M7.5 12h9M10 16h4" /></symbol>
      <symbol id="ph-star" viewBox="0 0 24 24"><path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z" /></symbol>
      <symbol id="ph-video" viewBox="0 0 24 24">
        <rect x="3" y="6.5" width="13" height="11" rx="2.5" />
        <path d="m16 10.5 5-3v9l-5-3" />
      </symbol>
      <symbol id="ph-photo" viewBox="0 0 24 24">
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5 17 4.5-4.5 3 3 2.5-2.5 4 4" />
      </symbol>
    </svg>
  );
}
