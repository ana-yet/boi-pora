"use client";

import Link from "next/link";
import { SavedBookCard } from "./SavedBookCard";
import type { SavedBook } from "./SavedBookCard";
import { useLibrary } from "@/lib/hooks/useLibrary";
import { useReadingProgress } from "@/lib/hooks/useReadingProgress";

interface SavedBooksGridProps {
  activeTab: string;
  view: "grid" | "list";
}

export function SavedBooksGrid({ activeTab, view }: SavedBooksGridProps) {
  const { data, error, isLoading, mutate } = useLibrary();
  const { data: progress } = useReadingProgress();

  const progressMap = new Map(
    progress.map((p) => [p.bookId?._id, p.percentComplete ?? 0])
  );

  const items = data?.items ?? [];
  const books: SavedBook[] = items.map((item) => ({
    title: item.bookId?.title ?? "Unknown",
    author: item.bookId?.author ?? "",
    image: item.bookId?.coverImageUrl ?? "",
    slug: item.bookId?.slug ?? "",
    bookId: item.bookId?._id ?? "",
    category: item.bookId?.category ?? "fiction",
    progress: progressMap.get(item.bookId?._id) ?? 0,
    addedAt: item.addedAt,
  }));

  const filtered = books.filter((book) => {
    const p = book.progress ?? 0;
    switch (activeTab) {
      case "in-progress":
        return p > 0 && p < 100;
      case "finished":
        return p >= 100;
      case "saved":
      default:
        return true;
    }
  });

  if (error) {
    return (
      <p className="text-red-500 py-8 text-center">
        Failed to load your library.
      </p>
    );
  }

  if (isLoading) {
    return view === "list" ? (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-[2/3] rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    const messages: Record<string, string> = {
      saved: "Your library is empty.",
      "in-progress": "No books in progress.",
      finished: "No finished books yet.",
    };
    return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600">
        <span className="material-icons text-4xl text-neutral-300 dark:text-neutral-600 mb-3 block">
          {activeTab === "finished" ? "emoji_events" : activeTab === "in-progress" ? "auto_stories" : "collections_bookmark"}
        </span>
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          {messages[activeTab] ?? "Nothing here yet."}
        </p>
        <Link href="/explore" className="text-primary hover:underline font-medium">
          Discover books
        </Link>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-3">
        {filtered.map((book) => (
          <SavedBookCard key={book.bookId || book.title} book={book} view="list" onRemove={() => mutate()} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
      {filtered.map((book) => (
        <SavedBookCard key={book.bookId || book.title} book={book} view="grid" onRemove={() => mutate()} />
      ))}
    </div>
  );
}
