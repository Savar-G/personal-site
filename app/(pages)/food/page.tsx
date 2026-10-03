import type { Metadata } from "next";
import { formatUpdated, getFood } from "@/lib/food";
import { FoodList } from "./_components/food-list";

export const metadata: Metadata = {
  title: "Food",
  description:
    "Every restaurant Savar Gupta has ranked on Beli, best first, with his notes and what to order.",
};

const BELI = "https://beliapp.co/app/savargupta";

export default function FoodPage() {
  // Savar's Beli list, brought over by `npm run food:import` (lib/food.ts).
  // Beli itself only runs on phones, so the list lives here for everyone else.
  const { updated, been, want } = getFood();
  const cities = new Set(been.map((p) => p.city).filter(Boolean)).size;

  return (
    <div className="animate-fade-in">
      <header className="pt-2 pb-9 sm:pb-11">
        <h1 className="page-title">Food</h1>
        {been.length ? (
          <p className="mt-3 max-w-prose text-stone-500">
            Every restaurant I&apos;ve ranked on Beli, best first:{" "}
            {been.length} {been.length === 1 ? "place" : "places"}
            {cities > 1 ? ` in ${cities} cities` : ""}. Open one for my notes
            and what to order.
          </p>
        ) : (
          <p className="mt-3 max-w-prose text-stone-500">
            My restaurant rankings are on their way over from Beli. Until then,
            they live in the app.
          </p>
        )}
        <p className="food-source">
          Scores out of 10 from{" "}
          <a href={BELI} target="_blank" rel="noopener">
            my Beli
          </a>
          {updated ? `, last synced ${formatUpdated(updated)}` : ""}
        </p>
      </header>

      {been.length ? <FoodList places={been} /> : null}

      {want.length ? (
        <section className="food-want" aria-labelledby="food-want-title">
          <h2 id="food-want-title" className="food-want-title">
            Next on my list
          </h2>
          <ul className="food-want-list">
            {want.map((p) => (
              <li key={p.id}>
                {p.name}
                {p.area || p.city ? <span> · {p.area ?? p.city}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
