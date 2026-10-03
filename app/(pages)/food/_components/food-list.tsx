"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Place } from "@/lib/food";

type Sort = "top" | "recent";

// Thirds of Beli's 10-point scale, matching its three reactions
// (liked it / it was fine / didn't like it).
function band(score: number) {
  return score >= 6.7 ? "high" : score >= 3.4 ? "mid" : "low";
}

function month(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function mapsUrl(p: Place) {
  const q = [p.name, p.area, p.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** Ranked places, best first, with a city filter, search, and a recent sort. */
export function FoodList({ places }: { places: Place[] }) {
  const [city, setCity] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("top");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Cities with the most places first; the filter hides when there is one.
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of places) if (p.city) counts.set(p.city, (counts.get(p.city) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [places]);
  const hasDates = places.some((p) => p.visited);

  const shown = useMemo(() => {
    // Rank within the chosen city, so "Tokyo" reads 1, 2, 3 rather than 4, 19, 30.
    const inCity = places
      .filter((p) => !city || p.city === city)
      .map((p, i) => ({ place: p, rank: i + 1 }));
    const q = query.trim().toLowerCase();
    const matches = q
      ? inCity.filter(({ place: p }) =>
          [p.name, p.cuisine, p.area, p.city, p.note, ...(p.dishes ?? [])]
            .filter(Boolean)
            .some((s) => s!.toLowerCase().includes(q)),
        )
      : inCity;
    return sort === "recent"
      ? [...matches].sort((a, b) => (b.place.visited ?? "").localeCompare(a.place.visited ?? ""))
      : matches;
  }, [places, city, sort, query]);

  return (
    <div className="food">
      <div className="food-controls">
        {cities.length > 1 ? (
          <div className="food-cities" role="group" aria-label="City">
            <button
              type="button"
              className="food-chip press"
              aria-pressed={city === null}
              onClick={() => setCity(null)}
            >
              All <span className="food-chip-count">{places.length}</span>
            </button>
            {cities.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className="food-chip press"
                aria-pressed={city === name}
                onClick={() => setCity(city === name ? null : name)}
              >
                {name} <span className="food-chip-count">{count}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="food-tools">
          <input
            type="search"
            className="food-search"
            placeholder="Search places, cuisines, dishes"
            aria-label="Search places"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {hasDates ? (
            <div className="food-sort" role="group" aria-label="Sort">
              <button type="button" aria-pressed={sort === "top"} onClick={() => setSort("top")}>
                Top rated
              </button>
              <button type="button" aria-pressed={sort === "recent"} onClick={() => setSort("recent")}>
                Recent
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {shown.length ? (
        <ol className="food-list">
          {shown.map(({ place: p, rank }) => {
            const open = openId === p.id;
            const meta = [p.cuisine, p.area, city ? null : p.city, p.price ? "$".repeat(p.price) : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={p.id} className="food-row" data-open={open}>
                <button
                  type="button"
                  className="food-face"
                  aria-expanded={open}
                  aria-controls={`food-${p.id}`}
                  onClick={() => setOpenId(open ? null : p.id)}
                >
                  <span className="food-rank">{rank}</span>
                  <span className="food-main">
                    <span className="food-name">{p.name}</span>
                    {meta ? <span className="food-meta">{meta}</span> : null}
                  </span>
                  {p.score !== undefined ? (
                    <span className="food-score" data-band={band(p.score)}>
                      <span className="sr-only">Score </span>
                      {p.score.toFixed(1)}
                    </span>
                  ) : null}
                </button>

                {/* Kept in the DOM so it can open smoothly; inert while closed. */}
                <div className="food-detail" id={`food-${p.id}`} inert={!open}>
                  <div className="food-detail-inner">
                    {p.photo ? (
                      <span className="food-photo">
                        <Image src={p.photo} alt={p.name} fill sizes="(max-width: 640px) 100vw, 14rem" />
                      </span>
                    ) : null}
                    <div className="food-body">
                      {p.note ? <p className="food-note">{p.note}</p> : null}
                      {p.dishes?.length ? (
                        <p className="food-dishes">
                          <span className="food-label">Order</span> {p.dishes.join(", ")}
                        </p>
                      ) : null}
                      <p className="food-facts">
                        {p.visited ? <span>Ranked {month(p.visited)}</span> : null}
                        <a href={mapsUrl(p)} target="_blank" rel="noopener">
                          Map ↗
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="food-empty">Nothing matches “{query.trim()}”.</p>
      )}
    </div>
  );
}
