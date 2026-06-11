import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreView } from "../_components/ExploreView";

export const metadata: Metadata = {
  title: "Trending books",
  description: "Most popular books on Boi Pora right now.",
  alternates: { canonical: "/explore/trending" },
};

export default function TrendingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExploreView
        title="Trending"
        subtitle="Most popular books this week."
        sort="rating"
        gridTitle="Trending books"
      />
    </Suspense>
  );
}
