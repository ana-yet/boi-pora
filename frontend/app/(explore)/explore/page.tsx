"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "./_components/SearchBar";
import { MoodFilter } from "./_components/MoodFilter";
import { BookGrid } from "./_components/BookGrid";
import { ComingSoonBanner } from "./_components/ComingSoonBanner";

const CATEGORY_LABELS: Record<string, string> = {
  fiction: "Fiction",
  academic: "Academic",
  "sci-fi": "Sci-Fi",
  "self-help": "Self Help",
  history: "History",
  business: "Business",
};

function ExploreContent() {
    const searchParams = useSearchParams();
    const category = searchParams.get("category") || undefined;
    const categoryLabel = category ? CATEGORY_LABELS[category] || category : undefined;

    return (
        <>
            <header className="flex-shrink-0 px-8 pt-8 pb-4 bg-background-light dark:bg-background-dark z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white tracking-tight mb-2">
                                {categoryLabel ? categoryLabel : "Find your next journey"}
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {categoryLabel
                                    ? `Browsing ${categoryLabel} books`
                                    : "Explore over 10,000+ titles curated for focus and flow."}
                            </p>
                        </div>
                        <button className="md:hidden p-2 text-neutral-600 dark:text-neutral-300">
                            <span className="material-icons text-3xl">
                                menu
                            </span>
                        </button>
                    </div>
                    <SearchBar />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 pb-12">
                <div className="max-w-7xl mx-auto space-y-10">
                    <MoodFilter />
                    <BookGrid category={category} title={categoryLabel ? `${categoryLabel} Books` : "Recommended for you"} />
                    <ComingSoonBanner />
                </div>
            </div>
        </>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-24"><span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" /></div>}>
            <ExploreContent />
        </Suspense>
    );
}
