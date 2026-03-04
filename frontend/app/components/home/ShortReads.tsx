"use client";

import Link from "next/link";
import { useBooks } from "@/lib/hooks/useBooks";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3C/svg%3E";

function formatDuration(min?: number) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function ShortReads() {
    const { data, isLoading } = useBooks(1, 6, undefined, "published", "createdAt");

    const allItems = data?.items ?? [];
    const shortItems = allItems.filter((b) => b.estimatedReadTimeMinutes && b.estimatedReadTimeMinutes < 120);
    const books = (shortItems.length > 0 ? shortItems : allItems).slice(0, 3);

    if (isLoading) {
        return (
            <section className="mb-12">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Short reads under 2 hours</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Perfect for your commute</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (books.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Short reads under 2 hours</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Perfect for your commute</p>
                </div>
                <Link className="text-primary hover:text-primary-dark text-sm font-medium flex items-center" href="/explore">
                    View all <span className="material-icons text-sm ml-1">arrow_forward</span>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book, idx) => (
                    <Link
                        key={book._id}
                        href={`/${book.category || "fiction"}/${book.slug}`}
                        className={`bg-white dark:bg-surface-dark p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex${idx >= 2 ? " hidden lg:flex" : ""}`}
                    >
                        <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden shadow-sm mr-4">
                            <img alt={`${book.title} book cover`} className="w-full h-full object-cover" src={book.coverImageUrl || PLACEHOLDER} />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h4 className="font-bold text-neutral-800 dark:text-white group-hover:text-primary transition-colors">{book.title}</h4>
                                <p className="text-sm text-neutral-500">{book.author}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-neutral-400">
                                {book.rating != null && (
                                    <div className="flex items-center gap-1 text-primary">
                                        <span className="material-icons text-sm">star</span> {book.rating.toFixed(1)}
                                    </div>
                                )}
                                <span className="flex items-center gap-1">
                                    <span className="material-icons text-[14px]">schedule</span> {formatDuration(book.estimatedReadTimeMinutes)}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
