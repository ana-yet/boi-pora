"use client";

import { BookCard } from "./BookCard";
import type { Book } from "./BookCard";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { useBooks } from "@/lib/hooks/useBooks";
import Link from "next/link";

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
    language?: string;
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
        language: apiBook.language,
    };
}

interface BookGridProps {
    sort?: string;
    category?: string;
    title?: string;
    searchQuery?: string;
    viewMode: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function BookGrid({ sort, category, title = "Recommended for you", searchQuery, viewMode, onViewChange }: BookGridProps) {
    const { data, error, isLoading } = useBooks(1, 20, category, undefined, sort);

    const allBooks = data?.items?.map(mapApiBookToBook) ?? [];
    const books = searchQuery
        ? allBooks.filter(
              (b) =>
                  b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  b.author.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allBooks;

    if (error) {
        return (
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                        {title}
                    </h2>
                    <ViewToggle view={viewMode} onViewChange={onViewChange} />
                </div>
                <p className="text-red-500 dark:text-red-400 py-8">
                    Failed to load books. Check that the API is running.
                </p>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                    {title}
                </h2>
                <ViewToggle view={viewMode} onViewChange={onViewChange} />
            </div>
            {isLoading ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className={viewMode === "grid" ? "aspect-[3/4] rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" : "h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"}
                        />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 py-12">
                    {searchQuery ? "No books match your search." : "No books yet. Add some from the admin dashboard."}
                </p>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {books.map((book) => (
                        <BookCard key={book.title + book.author} book={book} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {books.map((book) => (
                        <Link key={book.slug} href={`/${book.category}/${book.slug}`}
                            className="flex gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 hover:shadow-md transition-all"
                        >
                            <img
                                src={book.image}
                                alt={book.title}
                                className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-neutral-800 dark:text-white truncate">{book.title}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{book.author}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                    {book.rating !== "—" && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons text-amber-400 text-sm" aria-hidden="true">star</span>
                                            {book.rating}
                                        </span>
                                    )}
                                    <span>{book.duration}</span>
                                    {book.tags[0] && <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">{book.tags[0].label}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
