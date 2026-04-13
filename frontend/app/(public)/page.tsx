import type { Metadata } from "next";
import { ContinueReading } from "@/app/components/home/ContinueReading";
import { Hero } from "../components/home/Hero";
import { RecommendationRow } from "../components/home/RecommendationRow";
import { CategoryGrid } from "../components/home/CategoryGrid";
import { ShortReads } from "../components/home/ShortReads";

export const metadata: Metadata = {
  title: "Discover books",
  description:
    "Browse curated books, jump back into what you were reading, and explore categories on Boi Pora — your digital reading companion.",
  openGraph: {
    url: "/",
  },
};

export default function HomePage() {
  return (
    <div className="animate-fade-in flex flex-1 flex-col w-full">
      <Hero />
      <ContinueReading />
      <RecommendationRow />
      <CategoryGrid />
      <ShortReads />
    </div>
  );
}
