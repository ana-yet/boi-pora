"use client";

import { useState } from "react";

export function SearchBar() {
    const [query, setQuery] = useState("");

    return (
        <div className="bg-white dark:bg-surface-dark p-2 rounded-2xl shadow-card border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 bg-neutral-100 dark:bg-background-dark rounded-xl">
                <span className="material-icons text-neutral-400 text-xl mr-3">
                    search
                </span>
                <input
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-800 dark:text-white placeholder-neutral-400 py-3 text-base"
                    placeholder="Search by title, author, or keyword..."
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <FilterButton icon="category" label="Genre" />
                <FilterButton icon="schedule" label="Duration" />
                <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95 whitespace-nowrap">
                    Search
                </button>
            </div>
        </div>
    );
}

function FilterButton({ icon, label }: { icon: string; label: string }) {
    return (
        <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-surface-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 text-sm font-medium transition-colors whitespace-nowrap min-w-fit">
            <span className="material-icons text-lg text-neutral-400">
                {icon}
            </span>
            {label}
            <span className="material-icons text-lg text-neutral-400 ml-1">
                expand_more
            </span>
        </button>
    );
}
