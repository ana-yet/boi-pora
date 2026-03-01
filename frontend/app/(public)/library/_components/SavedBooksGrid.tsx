"use client";

import Link from "next/link";
import { SavedBookCard } from "./SavedBookCard";
import type { SavedBook } from "./SavedBookCard";
import { useLibrary } from "@/lib/hooks/useLibrary";

export function SavedBooksGrid() {
  const { data, error, isLoading } = useLibrary();

  const items = data?.items ?? [];
  const books: SavedBook[] = items.map((item) => ({
    title: item.bookId?.title ?? "Unknown",
    author: item.bookId?.author ?? "",
    image: item.bookId?.coverImageUrl ?? "",
    slug: item.bookId?.slug ?? "",
    bookId: item.bookId?._id ?? "",
  }));

  if (error) {
    return (
      <p className="text-red-500 py-8">
        Failed to load your library.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600">
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          Your library is empty.
        </p>
        <Link
          href="/explore"
          className="text-primary hover:underline font-medium"
        >
          Discover books
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
      {books.map((book) => (
        <SavedBookCard key={book.bookId || book.title} book={book} />
      ))}
    </div>
  );
}
