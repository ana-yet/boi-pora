"use client";

import { BookCard } from "./BookCard";
import type { Book } from "./BookCard";
import { ViewToggle } from "./ViewToggle";
import { useBooks } from "@/lib/hooks/useBooks";

const PLACEHOLDER_COVER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EBook cover%3C/text%3E%3C/svg%3E";

function formatDuration(minutes?: number): string {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function mapApiBookToBook(apiBook: {
    _id: string;
    title: string;
    slug: string;
    author: string;
    coverImageUrl?: string;
    category?: string;
    genres?: string[];
    rating?: number;
    estimatedReadTimeMinutes?: number;
}): Book {
    return {
        title: apiBook.title,
        author: apiBook.author,
        image: apiBook.coverImageUrl || PLACEHOLDER_COVER,
        rating: apiBook.rating != null ? String(apiBook.rating.toFixed(1)) : "—",
        duration: formatDuration(apiBook.estimatedReadTimeMinutes),
        tags: (apiBook.genres || apiBook.category ? [apiBook.category, ...(apiBook.genres || [])].filter((x): x is string => !!x).slice(0, 3) : []).map(
            (label) => ({ label } as const)
        ),
        slug: apiBook.slug,
        category: apiBook.category || "fiction",
    };
}

interface BookGridProps {
    sort?: string;
    category?: string;
    title?: string;
}

export function BookGrid({ sort, category, title = "Recommended for you" }: BookGridProps = {}) {
    const { data, error, isLoading } = useBooks(1, 20, category, undefined, sort);

    if (error) {
        return (
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                        {title}
                    </h2>
                    <ViewToggle />
                </div>
                <p className="text-red-500 dark:text-red-400 py-8">
                    Failed to load books. Check that the API is running.
                </p>
            </section>
        );
    }

    const books = data?.items?.map(mapApiBookToBook) ?? [];

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                    {title}
                </h2>
                <ViewToggle />
            </div>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-[3/4] rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                        />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 py-12">
                    No books yet. Add some from the admin dashboard.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {books.map((book) => (
                        <BookCard key={book.title + book.author} book={book} />
                    ))}
                </div>
            )}
        </section>
    );
}
