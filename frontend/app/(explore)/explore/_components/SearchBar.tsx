"use client";

interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
    return (
        <div className="bg-white dark:bg-surface-dark p-2 rounded-2xl shadow-card border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 bg-neutral-100 dark:bg-background-dark rounded-xl">
                <span className="material-icons text-neutral-400 text-xl mr-3" aria-hidden="true">
                    search
                </span>
                <input
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-neutral-800 dark:text-white placeholder-neutral-400 py-3 text-base"
                    placeholder="Search by title, author, or keyword..."
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
            </div>
            {query && (
                <button
                    onClick={() => onQueryChange("")}
                    className="px-4 py-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                >
                    Clear
                </button>
            )}
        </div>
    );
}
