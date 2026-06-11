"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { MoodFilter } from "./MoodFilter";
import { BookGrid } from "./BookGrid";
import { ComingSoonBanner } from "./ComingSoonBanner";
import type { ViewMode } from "./ViewToggle";

const CATEGORY_LABELS: Record<string, string> = {
  fiction: "Fiction",
  academic: "Academic",
  "sci-fi": "Sci-Fi",
  "self-help": "Self Help",
  history: "History",
  business: "Business",
};

interface ExploreViewProps {
  /** Fixed heading; when omitted, derived from the active category. */
  title?: string;
  subtitle?: string;
  sort?: string;
  gridTitle?: string;
  /** Category filtering via ?category= and the mood pills (main explore page only). */
  withCategoryFilter?: boolean;
  withComingSoonBanner?: boolean;
}

export function ExploreView({
  title,
  subtitle,
  sort,
  gridTitle,
  withCategoryFilter = false,
  withComingSoonBanner = false,
}: ExploreViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = withCategoryFilter
    ? searchParams.get("category") || undefined
    : undefined;
  const categoryLabel = category
    ? CATEGORY_LABELS[category] || category
    : undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleMoodChange = (mood: string | undefined) => {
    const params = new URLSearchParams();
    if (mood) params.set("category", mood);
    const qs = params.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  };

  const heading = title ?? (categoryLabel || "Find your next journey");
  const sub =
    subtitle ??
    (categoryLabel
      ? `Browsing ${categoryLabel} books`
      : "Explore over 10,000+ titles curated for focus and flow.");

  return (
    <>
      <header className="flex-shrink-0 px-8 pt-8 pb-4 bg-background-light dark:bg-background-dark z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white tracking-tight mb-2">
                {heading}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">{sub}</p>
            </div>
          </div>
          <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {withCategoryFilter && (
            <MoodFilter activeMood={category} onMoodChange={handleMoodChange} />
          )}
          <BookGrid
            sort={sort}
            category={category}
            title={
              gridTitle ??
              (categoryLabel ? `${categoryLabel} Books` : "Recommended for you")
            }
            searchQuery={searchQuery}
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
          {withComingSoonBanner && <ComingSoonBanner />}
        </div>
      </div>
    </>
  );
}
