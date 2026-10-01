import type { Metadata } from "next";
import { albums } from "@/lib/travel";
import { PhotosPhone } from "./_components/photos-phone";

export const metadata: Metadata = {
  title: "Travel",
  description:
    "Trips by Savar Gupta, shot on iPhone: Bali, Joffre Lakes, Turkey, California, Maui, Japan, and Banff.",
};

// The page is an iPhone open on the Photos app, one album per trip (R-80).
export default function TravelPage() {
  return <PhotosPhone albums={albums} />;
}
