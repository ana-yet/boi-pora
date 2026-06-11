import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreView } from "../_components/ExploreView";

export const metadata: Metadata = {
  title: "New arrivals",
  description: "Fresh titles recently added to Boi Pora.",
  alternates: { canonical: "/explore/new" },
};

export default function NewArrivalsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ExploreView
        title="New Arrivals"
        subtitle="Fresh titles added recently."
        sort="createdAt"
        gridTitle="New Arrivals"
      />
    </Suspense>
  );
}
