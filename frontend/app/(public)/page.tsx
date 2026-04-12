import type { Metadata } from "next";
import { ContinueReading } from "@/app/components/home/ContinueReading";

export const metadata: Metadata = {
  title: "Discover books",
  description:
    "Browse curated books, jump back into what you were reading, and explore categories on Boi Pora — your digital reading companion.",
  openGraph: {
    url: "/",
  },
};
import { Hero } from "../components/home/Hero";
import { RecommendationRow } from "../components/home/RecommendationRow";
import { CategoryGrid } from "../components/home/CategoryGrid";
import { ShortReads } from "../components/home/ShortReads";

export default function HomePage() {
    return (
        <div className="animate-fade-in">
            <Hero />
            <ContinueReading />
            <RecommendationRow />
            <CategoryGrid />
            <ShortReads />
        </div>
    );
}
