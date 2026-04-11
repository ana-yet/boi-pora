"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useReadingProgress } from "@/lib/hooks/useReadingProgress";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600'%3E%3Crect fill='%23e5e7eb' width='400' height='600'/%3E%3C/svg%3E";

export function ContinueReading() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading } = useReadingProgress();
  const current = data[0];

  if (authLoading || !isAuthenticated) return null;
  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      </section>
    );
  }
  if (!current?.bookId) return null;

  const book = current.bookId;
  const progress = current.percentComplete ?? 0;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
          Continue Reading
        </h2>
        <Link href="/library" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
          View all <span className="material-icons text-sm ml-1">arrow_forward</span>
        </Link>
      </div>
      <Link
        href={`/read/${book._id}/chapter-1`}
        className="block bg-white dark:bg-surface-dark rounded-2xl shadow-card overflow-hidden border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row max-w-4xl hover:shadow-lg transition-shadow"
      >
        <div className="w-full md:w-1/3 relative h-64 md:h-auto flex-shrink-0">
          <img alt={`${book.title} cover`} className="absolute inset-0 w-full h-full object-cover" src={book.coverImageUrl || PLACEHOLDER} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
        </div>
        <div className="p-8 md:w-2/3 flex flex-col justify-center">
          <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1 block">Currently Reading</span>
          <h3 className="text-3xl font-bold text-neutral-800 dark:text-white mb-1">{book.title}</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg mb-6">{book.author}</p>
          <div>
            <div className="flex justify-between text-sm font-medium mb-2 text-neutral-600 dark:text-neutral-300">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-primary font-medium">
            Resume <span className="material-icons text-xl">play_arrow</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
