"use client";

import { useState } from "react";
import { SearchBar } from "../_components/SearchBar";
import { BookGrid } from "../_components/BookGrid";
import type { ViewMode } from "../_components/ViewToggle";

export default function TrendingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    return (
        <>
            <header className="flex-shrink-0 px-8 pt-8 pb-4 bg-background-light dark:bg-background-dark z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white tracking-tight mb-2">
                                Trending
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Most popular books this week.
                            </p>
                        </div>
                    </div>
                    <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <BookGrid
                        sort="rating"
                        title="Trending books"
                        searchQuery={searchQuery}
                        viewMode={viewMode}
                        onViewChange={setViewMode}
                    />
                </div>
            </div>
        </>
    );
}
