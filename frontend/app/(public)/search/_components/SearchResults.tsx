"use client";

import Link from "next/link";
import { useBookSearch } from "@/lib/hooks/useBookSearch";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='96'%3E%3Crect fill='%23e5e7eb' width='64' height='96'/%3E%3C/svg%3E";

export function SearchResults({ query }: { query: string }) {
  const { data: results, error, isLoading } = useBookSearch(query);

  if (!query.trim()) return null;

  if (isLoading) {
    return (
      <section>
        <p className="text-sm text-neutral-500 mb-6">Searching...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <p className="text-sm text-red-500 mb-6">Failed to search. Try again.</p>
      </section>
    );
  }

  return (
    <section>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
      </p>
      {results.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <span className="material-icons text-5xl text-neutral-400 mb-4 block">menu_book</span>
          <p className="text-neutral-600 dark:text-neutral-400 mb-2">No books found.</p>
          <p className="text-sm text-neutral-500">
            Try a different search term or browse{" "}
            <Link href="/explore" className="text-primary hover:underline">
              Explore
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((book) => (
            <li key={book._id}>
              <Link
                href={`/${book.category || "fiction"}/${book.slug}`}
                className="group flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                  <img
                    alt=""
                    className="w-full h-full object-cover"
                    src={book.coverImageUrl || PLACEHOLDER}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-800 dark:text-white group-hover:text-primary transition-colors truncate">
                    {book.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{book.author}</p>
                  {book.rating != null && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                      <span className="material-icons text-primary text-sm">star</span>
                      {book.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
