"use client";

import Link from "next/link";
import { useBooks } from "@/lib/hooks/useBooks";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3C/svg%3E";

function formatTime(min?: number) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function RecommendationRow() {
  const { data, error, isLoading } = useBooks(1, 5, undefined, undefined, "rating");
  const books = data?.items ?? [];

  if (isLoading && books.length === 0) {
    return (
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Recommended for you</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Top rated books</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }
  if (error || books.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Recommended for you
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            Top rated books
          </p>
        </div>
        <Link
          href="/explore"
          className="text-primary hover:underline text-sm font-medium"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.map((book: { _id: string; title: string; author: string; slug: string; category?: string; coverImageUrl?: string; rating?: number; estimatedReadTimeMinutes?: number }) => (
          <Link
            key={book._id}
            href={`/${book.category || "fiction"}/${book.slug}`}
            className="group block"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
              <img
                alt={`${book.title} cover`}
                className="w-full h-full object-cover"
                src={book.coverImageUrl || PLACEHOLDER}
              />
              {book.rating != null && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="material-icons text-[10px] text-primary">star</span>{" "}
                  {book.rating.toFixed(1)}
                </div>
              )}
            </div>
            <h3 className="font-bold text-neutral-800 dark:text-white text-base leading-tight mb-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{book.author}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
              <span className="material-icons text-[14px]">schedule</span>{" "}
              {formatTime(book.estimatedReadTimeMinutes)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
