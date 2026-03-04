"use client";

import Link from "next/link";
import { useReadingProgress } from "@/lib/hooks/useReadingProgress";
import { ProgressBar } from "./ProgressBar";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='240'%3E%3Crect fill='%23e5e7eb' width='160' height='240'/%3E%3C/svg%3E";

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function CurrentlyReading() {
  const { data, isLoading } = useReadingProgress();

  const inProgress = data.filter(
    (p) => (p.percentComplete ?? 0) > 0 && (p.percentComplete ?? 0) < 100
  );
  const current = inProgress[0];

  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 text-neutral-800 dark:text-white">
          Currently Reading
        </h2>
        <div className="h-48 rounded-2xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      </section>
    );
  }

  if (!current?.bookId) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 text-neutral-800 dark:text-white flex items-center gap-2">
          <span className="material-icons text-primary">menu_book</span>
          Currently Reading
        </h2>
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 p-12 text-center">
          <span className="material-icons text-5xl text-neutral-300 dark:text-neutral-600 mb-4 block">auto_stories</span>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            You haven&apos;t started reading any books yet.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Browse books
            <span className="material-icons text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>
    );
  }

  const book = current.bookId;
  const progress = current.percentComplete ?? 0;
  const lastRead = current.lastReadAt;
  const category = book.category || "fiction";

  const readLink = current.chapterId?._id
    ? `/read/${book._id}/${current.chapterId._id}`
    : `/read/${book._id}/chapter-1`;

  const bookLink = `/${category}/${book.slug}`;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-neutral-800 dark:text-white">
          <span className="material-icons text-primary">menu_book</span>
          Currently Reading
        </h2>
        {inProgress.length > 1 && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            +{inProgress.length - 1} more in progress
          </span>
        )}
      </div>
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 relative z-10">
          <Link href={bookLink} className="flex-shrink-0">
            <div className="w-40 h-60 rounded-lg shadow-book overflow-hidden relative bg-neutral-200">
              <img
                alt={`${book.title} cover`}
                className="w-full h-full object-cover"
                src={book.coverImageUrl || PLACEHOLDER}
              />
            </div>
          </Link>
          <div className="flex-1 flex flex-col justify-center">
            <Link href={bookLink}>
              <h3 className="text-2xl font-bold mb-1 text-neutral-800 dark:text-white hover:text-primary transition-colors">
                {book.title}
              </h3>
            </Link>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-1">
              {book.author}
            </p>
            {current.chapterId?.title && (
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-4">
                <span className="material-icons text-xs align-middle mr-1">bookmark</span>
                {current.chapterId.chapterNumber != null && `Ch. ${current.chapterId.chapterNumber}: `}
                {current.chapterId.title}
              </p>
            )}
            {!current.chapterId?.title && <div className="mb-4" />}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Progress
                </span>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
              {lastRead && (
                <p className="text-xs text-neutral-500">
                  Last read {formatTimeAgo(lastRead)}
                </p>
              )}
              <Link
                href={readLink}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              >
                Continue Reading
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
