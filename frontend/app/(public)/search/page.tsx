import type { Metadata } from "next";
import { SearchForm } from "./_components/SearchForm";
import { SearchResults } from "./_components/SearchResults";

export const metadata: Metadata = {
    title: "Search",
    description: "Search books by title, author, or keyword.",
};

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    const query = typeof q === "string" ? q.trim() : "";

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
                    Search
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Find books by title, author, or keyword.
                </p>
            </div>

            <SearchForm initialQuery={query} />

            {query ? (
                <SearchResults query={query} />
            ) : (
                <div className="mt-12 text-center py-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                    <span className="material-icons text-5xl text-neutral-400 mb-4 block">
                        search
                    </span>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Enter a search term above to find books.
                    </p>
                </div>
            )}
        </div>
    );
}
