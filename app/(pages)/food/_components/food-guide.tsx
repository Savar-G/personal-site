"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./food.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GeoJSONSource, LngLatBoundsLike, Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { COUNTRY_NAMES, googleMapsUrl, photoSrc, photoThumb, priceLabel, type CountryCode, type Place } from "@/lib/food";
import { BASE_STYLE_URL, buildStyle } from "./map-style";

// /food (decisions F-1, F-3): a real street map in Airbnb's quiet colours with a white
// score pill on each place, beside the ranked list. Chips step from everywhere to a
// country to a province; the list shows what is in the map view.

type Scope = { country: CountryCode | null; region: string | null };

// Crosses the date line on purpose: the Pacific sits in the middle, Türkiye on the left,
// Hawaii and Vancouver on the right.
const WORLD: LngLatBoundsLike = [[24, -14], [238, 56]];
// Room for the pills at the edges; narrow (phone) maps get less, so the world still fits.
const worldPad = (w: number) => (w < 600 ? { top: 30, bottom: 30, left: 58, right: 66 } : { top: 40, bottom: 40, left: 70, right: 90 });
const FIT_PAD = { top: 70, bottom: 50, left: 50, right: 50 };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
const score = (p: Place) => p.score.toFixed(1);

// Up to 4 photos; with more, the 4th says "+N" and opens the viewer there.
function stripHTML(p: Place) {
  const ph = p.photos ?? [];
  if (!ph.length) return "";
  const cells = ph.slice(0, 4).map((x, i) => {
    const more = i === 3 && ph.length > 4 ? ph.length - 3 : 0;
    const label = more ? `${more} more photos` : `Photo ${i + 1} of ${ph.length}`;
    return `<button type="button" class="food-strip-cell" data-photo="${i}" aria-label="${label}"><img src="${photoThumb(x)}" alt="" loading="lazy" decoding="async">${more ? `<b>+${more}</b>` : ""}</button>`;
  });
  return `<div class="food-strip">${cells.join("")}</div>`;
}

function cardHTML(p: Place, total: number) {
  const price = priceLabel(p);
  return `<div class="food-card">
    <p class="food-card-kicker">#${p.rank} of ${total}${p.cuisines.length ? " · " + esc(p.cuisines.join(", ")) : ""}</p>
    <h2>${esc(p.name)}</h2>
    <div class="food-card-line"><span class="food-pill food-pill-on">${score(p)}</span>${price ? `<span>${price}</span>` : ""}</div>
    <p class="food-card-area">${esc(p.area)}</p>
    ${stripHTML(p)}
    <a href="${googleMapsUrl(p)}" target="_blank" rel="noopener">Open in Google Maps</a>
    <button class="food-card-x" type="button" aria-label="Close">×</button>
  </div>`;
}

export function FoodGuide({ places }: { places: Place[] }) {
  const byRank = useMemo(() => new Map(places.map((p) => [p.rank, p])), [places]);
  const [scope, setScope] = useState<Scope>({ country: null, region: null });
  const [inView, setInView] = useState<Set<number> | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  // The photo viewer: which place and which photo.
  const [viewer, setViewer] = useState<{ rank: number; i: number } | null>(null);
  const viewerRef = useRef(viewer);
  useEffect(() => {
    viewerRef.current = viewer;
  }, [viewer]);

  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const popupRef = useRef<Popup | null>(null);
  // True once the visitor pans or zooms; until then a window resize refits the current scope.
  const userMovedRef = useRef(false);
  const markers = useRef(new Map<string, { marker: Marker; el: HTMLElement; rank?: number }>());
  const selectedRef = useRef<number | null>(null);
  // The marker click handlers are made inside sync, before open exists; they call it through here.
  const openRef = useRef<(rank: number, fly: boolean) => void>(() => {});
  // Event handlers outside React (map, keys) read the scope from here; every setScope updates it.
  const scopeRef = useRef(scope);

  const inScope = useCallback((p: Place, s: Scope) => (!s.country || p.country === s.country) && (!s.region || p.region === s.region), []);
  const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const writeHash = useCallback(() => {
    const s = scopeRef.current;
    const parts = [s.country, s.region].filter(Boolean) as string[];
    if (selectedRef.current) parts.push("@" + selectedRef.current);
    history.replaceState(history.state, "", parts.length ? "#" + parts.join("/") : location.pathname);
  }, []);

  // ---- markers: one white pill per visible group or place ---------------------------
  const sync = useCallback(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!map || !lib || !map.getSource("places")) return;
    const src = map.getSource("places") as GeoJSONSource;
    const seen = new Set<string>();
    // Only what is drawn at this zoom: the source cache also holds tiles from other zooms,
    // whose groups would leave stale pills behind.
    for (const f of map.queryRenderedFeatures({ layers: ["places-hit"] })) {
      const props = f.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; rank?: number };
      const key = props.cluster ? "c" + props.cluster_id : "p" + props.rank;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!props.cluster && props.rank === selectedRef.current) continue;
      if (markers.current.has(key)) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.className = "food-marker";
      const entry = { marker: null as unknown as Marker, el };
      if (props.cluster) {
        el.innerHTML = `<span class="food-pill food-pill-group">${props.point_count}<span>places</span></span>`;
        el.setAttribute("aria-label", `${props.point_count} places, zoom in`);
        src.getClusterLeaves(props.cluster_id!, 500, 0).then((leaves) => {
          el.dataset.ranks = `,${leaves.map((l) => (l.properties as { rank: number }).rank).join(",")},`;
        });
        el.addEventListener("click", async (e) => {
          e.stopPropagation();
          userMovedRef.current = true;
          const leaves = await src.getClusterLeaves(props.cluster_id!, 500, 0);
          const b = new lib.LngLatBounds();
          leaves.forEach((l) => b.extend((l.geometry as GeoJSON.Point).coordinates as [number, number]));
          map.fitBounds(b, { padding: FIT_PAD, maxZoom: 15.5, duration: still() ? 0 : 900 });
        });
      } else {
        const p = byRank.get(props.rank!)!;
        el.innerHTML = `<span class="food-pill">${score(p)}</span>`;
        el.setAttribute("aria-label", `#${p.rank} ${p.name}, ${score(p)}`);
        el.title = `#${p.rank} ${p.name}`;
        el.dataset.ranks = `,${p.rank},`;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          openRef.current(p.rank, false);
        });
      }
      entry.marker = new lib.Marker({ element: el, anchor: "center" }).setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number]).addTo(map);
      el.style.zIndex = props.cluster ? "2" : "1";
      markers.current.set(key, entry);
    }
    // The open place always has its own black pill.
    const sel = selectedRef.current ? byRank.get(selectedRef.current) : null;
    if (sel) {
      seen.add("sel");
      const cur = markers.current.get("sel");
      if (!cur || cur.rank !== sel.rank) {
        cur?.marker.remove();
        const el = document.createElement("span");
        el.className = "food-marker is-on";
        el.innerHTML = `<span class="food-pill">${score(sel)}</span>`;
        el.style.zIndex = "6";
        el.dataset.ranks = `,${sel.rank},`;
        markers.current.set("sel", { el, rank: sel.rank, marker: new lib.Marker({ element: el, anchor: "center" }).setLngLat([sel.lng, sel.lat]).addTo(map) });
      }
    }
    for (const [key, m] of markers.current) {
      if (!seen.has(key)) {
        m.marker.remove();
        markers.current.delete(key);
      }
    }
  }, [byRank]);

  const open = useCallback(
    (rank: number, fly: boolean) => {
      const map = mapRef.current;
      const lib = libRef.current;
      const p = byRank.get(rank);
      if (!map || !lib || !p) return;
      popupRef.current?.remove();
      selectedRef.current = rank;
      setSelected(rank);
      const popup = new lib.Popup({ className: "food-popup", closeButton: false, closeOnClick: true, offset: 22, maxWidth: "320px", focusAfterOpen: false })
        .setLngLat([p.lng, p.lat])
        .setHTML(cardHTML(p, places.length))
        .addTo(map);
      popup.getElement().querySelector(".food-card-x")?.addEventListener("click", () => popup.remove());
      popup.getElement().querySelectorAll<HTMLElement>("[data-photo]").forEach((el) =>
        el.addEventListener("click", () => setViewer({ rank, i: Number(el.dataset.photo) })),
      );
      popup.on("close", () => {
        if (selectedRef.current !== rank) return;
        selectedRef.current = null;
        setSelected(null);
        sync();
        writeHash();
      });
      popupRef.current = popup;
      if (fly) map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 14.5), offset: [0, 110], duration: still() ? 0 : 1100 });
      sync();
      writeHash();
    },
    [byRank, places.length, sync, writeHash],
  );

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const fitScope = useCallback(
    (s: Scope, instant = false) => {
      const map = mapRef.current;
      const lib = libRef.current;
      if (!map || !lib) return;
      const duration = instant || still() ? 0 : 1000;
      if (!s.country) return map.fitBounds(WORLD, { padding: worldPad(map.getContainer().clientWidth), duration });
      const b = new lib.LngLatBounds();
      places.filter((p) => inScope(p, s)).forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: FIT_PAD, maxZoom: s.region ? 13 : 9, duration });
    },
    [places, inScope],
  );

  const choose = useCallback(
    (s: Scope) => {
      popupRef.current?.remove();
      userMovedRef.current = false;
      scopeRef.current = s;
      setScope(s);
      fitScope(s);
      writeHash();
    },
    [fitScope, writeHash],
  );

  // ---- the map: loaded in the browser only ------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const live = markers.current;
    let base: import("maplibre-gl").StyleSpecification | null = null;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => base && mapRef.current?.setStyle(buildStyle(base, dark.matches));

    (async () => {
      const [lib, res] = await Promise.all([import("maplibre-gl"), fetch(BASE_STYLE_URL)]);
      base = await res.json();
      if (cancelled || !box.current || !base) return;
      libRef.current = lib;

      // Start from the link's view if it has one (#CAN, #CAN/CA-BC, #@12).
      const parts = decodeURIComponent(location.hash.slice(1)).split("/").filter(Boolean);
      const at = Number(parts.find((x) => x.startsWith("@"))?.slice(1));
      const [country, region] = parts.filter((x) => !x.startsWith("@")) as [CountryCode?, string?];
      const first = byRank.get(at);
      const start: Scope = first ? { country: first.country, region: first.region } : { country: country && COUNTRY_NAMES[country] ? country : null, region: region ?? null };
      scopeRef.current = start;
      setScope(start);

      const map = new lib.Map({
        container: box.current,
        style: buildStyle(base, dark.matches),
        bounds: WORLD,
        fitBoundsOptions: { padding: worldPad(box.current.clientWidth) },
        minZoom: -1, // a phone-width map zooms out past 0 to show Türkiye to Vancouver
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        cooperativeGestures: false,
      });
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();
      map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");

      // Our source and its hidden layer go back in after every style change (dark mode).
      map.on("style.load", () => {
        if (map.getSource("places")) return;
        map.addSource("places", {
          type: "geojson",
          cluster: true,
          // 56, not 46: with 238 places a "6 places" pill covered the "76 places" one over Vancouver.
          clusterRadius: 56,
          clusterMaxZoom: 15,
          data: {
            type: "FeatureCollection",
            features: places.map((p) => ({ type: "Feature", properties: { rank: p.rank }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } })),
          },
        });
        map.addLayer({ id: "places-hit", type: "circle", source: "places", paint: { "circle-radius": 1, "circle-opacity": 0 } });
      });
      map.on("move", sync);
      map.on("movestart", (e) => {
        if ((e as { originalEvent?: Event }).originalEvent) userMovedRef.current = true;
      });
      map.on("resize", () => {
        if (!userMovedRef.current && !selectedRef.current) fitScope(scopeRef.current, true);
      });
      map.on("sourcedata", (e) => {
        if (e.sourceId === "places" && e.isSourceLoaded) sync();
      });
      map.on("moveend", () => {
        sync();
        if (map.getZoom() <= 3) return setInView(null);
        const b = map.getBounds();
        const has = (lng: number, lat: number) => b.contains([lng, lat]) || b.contains([lng + 360, lat]) || b.contains([lng - 360, lat]);
        setInView(new Set(places.filter((p) => has(p.lng, p.lat)).map((p) => p.rank)));
      });
      // Tiles from the old zoom can still be drawn during a move; resync once the map settles.
      map.on("idle", () => {
        sync();
        box.current?.setAttribute("data-ready", "");
      });
      map.once("load", () => {
        box.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
        if (first) {
          map.jumpTo({ center: [first.lng, first.lat], zoom: 14.2 });
          map.once("idle", () => open(first.rank, false));
        } else if (start.country) fitScope(start, true);
      });
      dark.addEventListener("change", onScheme);
    })();

    return () => {
      cancelled = true;
      // map.remove() closes an open card; its close handler must not sync the removed map
      // or write the food hash into the next page's URL.
      selectedRef.current = null;
      popupRef.current = null;
      dark.removeEventListener("change", onScheme);
      live.forEach((m) => m.marker.remove());
      live.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc closes the card, then steps back: province, country, everywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || viewerRef.current) return;
      if (popupRef.current?.isOpen()) return popupRef.current.remove();
      const s = scopeRef.current;
      if (s.region) choose({ country: s.country, region: null });
      else if (s.country) choose({ country: null, region: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose]);

  // A row lights up the pin or group that holds its place (pins list their places in data-ranks).
  const hot = (rank: number, on: boolean) => {
    box.current?.querySelectorAll<HTMLElement>(`.food-marker[data-ranks*=",${rank},"]`).forEach((el) => el.classList.toggle("is-hot", on));
  };

  // ---- chips and list ----------------------------------------------------------------------
  const chips = useMemo(() => {
    const count = (f: (p: Place) => boolean) => places.filter(f).length;
    if (!scope.country) {
      const countries = (Object.keys(COUNTRY_NAMES) as CountryCode[])
        .map((c) => ({ label: COUNTRY_NAMES[c], n: count((p) => p.country === c), to: { country: c, region: null } as Scope, on: false }))
        .filter((c) => c.n > 0)
        .sort((a, b) => b.n - a.n);
      return [{ label: "Everywhere", n: places.length, to: { country: null, region: null } as Scope, on: true }, ...countries];
    }
    const regions = [...new Set(places.filter((p) => p.country === scope.country).map((p) => p.region))]
      .map((r) => {
        const ps = places.filter((p) => p.region === r);
        return { label: ps[0].regionName, n: ps.length, to: { country: scope.country, region: r } as Scope, on: scope.region === r };
      })
      .sort((a, b) => b.n - a.n)
      // Hong Kong is its own only region; a second "Hong Kong" chip says nothing new.
      .filter((r) => r.label !== COUNTRY_NAMES[scope.country!]);
    return [
      { label: "← Everywhere", n: 0, to: { country: null, region: null } as Scope, on: false, back: true },
      { label: COUNTRY_NAMES[scope.country], n: count((p) => p.country === scope.country), to: { country: scope.country, region: null } as Scope, on: !scope.region },
      ...regions,
    ];
  }, [places, scope]);

  const shown = places.filter((p) => inScope(p, scope) && (!inView || inView.has(p.rank)));
  const countLabel = inView ? `${shown.length} ${shown.length === 1 ? "place" : "places"} in this area` : `${shown.length} places`;

  return (
    <div className="food-page animate-fade-in">
      <header className="food-head">
        <h1 className="page-title">Food</h1>
        <p className="mt-2 text-stone-500">
          {`${places.length} places I've ranked on Beli, best first.`}
        </p>
      </header>

      <nav className="food-chips" aria-label="Places by country and province">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            className={`food-chip${c.on ? " is-on" : ""}${"back" in c ? " is-back" : ""}`}
            aria-pressed={c.on}
            onClick={() => choose(c.to)}
          >
            {c.label}
            {c.n > 0 && <span className="food-chip-n">{c.n}</span>}
          </button>
        ))}
      </nav>

      <div className="food-mapwrap">
        <div ref={box} className="food-map" role="region" aria-label="Map of the places" />
      </div>

      <p className="food-count" aria-live="polite">
        {countLabel}
      </p>
      <ol className="food-list">
        {shown.map((p) => (
          <li key={p.rank}>
            <button
              type="button"
              className={`food-row${selected === p.rank ? " is-on" : ""}`}
              onMouseEnter={() => hot(p.rank, true)}
              onMouseLeave={() => hot(p.rank, false)}
              onFocus={() => hot(p.rank, true)}
              onBlur={() => hot(p.rank, false)}
              onClick={() => open(p.rank, true)}
            >
              <span className="food-row-rank">{p.rank}</span>
              {p.photos?.length ? (
                // eslint-disable-next-line @next/next/no-img-element -- pre-sized webp thumbnail
                <img className="food-row-photo" src={photoThumb(p.photos[0])} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="food-row-photo is-empty" />
              )}
              <span className="food-row-main">
                <span className="food-row-name">{p.name}</span>
                <span className="food-row-sub">{[p.cuisines.slice(0, 2).join(", "), priceLabel(p)].filter(Boolean).join(" · ")}</span>
                <span className="food-row-sub">{p.area}</span>
              </span>
              <span className="food-pill">{score(p)}</span>
            </button>
          </li>
        ))}
      </ol>

      {viewer && byRank.get(viewer.rank)?.photos && (
        <PhotoViewer place={byRank.get(viewer.rank)!} index={viewer.i} onIndex={(i) => setViewer({ rank: viewer.rank, i })} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}

// Full-size photos of one place. Arrows step, Esc or a click outside the photo closes.
function PhotoViewer({ place, index, onIndex, onClose }: { place: Place; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photos = place.photos!;
  const n = photos.length;
  const ph = photos[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => back?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && n > 1) onIndex((index + 1) % n);
      else if (e.key === "ArrowLeft" && n > 1) onIndex((index + n - 1) % n);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onIndex, onClose]);

  return (
    <div className="food-viewer" role="dialog" aria-modal="true" aria-label={`Photos of ${place.name}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized webp */}
        <img key={ph.id} src={photoSrc(ph)} width={ph.w} height={ph.h} alt={`Photo ${index + 1} of ${n} at ${place.name}`} />
        <figcaption>
          <span>{place.name}</span>
          {n > 1 && <span className="food-viewer-n">{`${index + 1} / ${n}`}</span>}
        </figcaption>
      </figure>
      {n > 1 && (
        <>
          <button type="button" className="food-viewer-step is-prev" aria-label="Previous photo" onClick={() => onIndex((index + n - 1) % n)}>‹</button>
          <button type="button" className="food-viewer-step is-next" aria-label="Next photo" onClick={() => onIndex((index + 1) % n)}>›</button>
        </>
      )}
      <button ref={closeRef} type="button" className="food-viewer-x" aria-label="Close" onClick={onClose}>×</button>
    </div>
  );
}
