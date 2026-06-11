import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreView } from "./_components/ExploreView";

export const metadata: Metadata = {
  title: "Explore books",
  description:
    "Explore the Boi Pora catalog — browse by category and find your next read.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExploreView withCategoryFilter withComingSoonBanner />
    </Suspense>
  );
}
