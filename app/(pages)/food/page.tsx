import type { Metadata } from "next";
import { places } from "@/lib/food";
import { FoodGuide } from "./_components/food-guide";

export const metadata: Metadata = {
  title: "Food",
  description:
    "Every place Savar Gupta has ranked on Beli, best first, on a map: Vancouver, Japan, Hawaii, California, Bali, and Türkiye.",
};

// The desk's ramen opens this page (F-1). The list is rendered on the server; the map
// loads in the browser (F-3).
export default function FoodPage() {
  return <FoodGuide places={places} />;
}
