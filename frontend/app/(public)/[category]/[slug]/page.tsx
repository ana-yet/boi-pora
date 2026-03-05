"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useBookBySlug } from "@/lib/hooks/useBook";
import { useBooks } from "@/lib/hooks/useBooks";
import { useChapters } from "@/lib/hooks/useChapters";
import { api } from "@/lib/api";
import { getLanguageLabel } from "@/lib/constants";
import { ReviewsSection } from "./_components/ReviewsSection";
import { Toast } from "@/app/components/ui/Toast";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3C/svg%3E";

function formatDuration(min?: number) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function BookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = params.category as string;
  const { isAuthenticated } = useAuth();
  const { data: book, error, isLoading } = useBookBySlug(slug);
  const { data: relatedData } = useBooks(1, 6, book?.category || undefined);
  const relatedBooks = (relatedData?.items ?? []).filter((b: { _id: string }) => b._id !== book?._id).slice(0, 6);
  const { data: chapters } = useChapters(book?._id ?? null);
  const sortedChapters = [...(chapters || [])].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const firstChapter = sortedChapters[0];
  const startReadingHref = firstChapter ? `/read/${book?._id}/${firstChapter.chapterId}` : book ? `/read/${book._id}/chapter-1` : "#";

  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!book || !isAuthenticated) return;
    api.get<{ inLibrary: boolean }>(`/api/v1/library/status/${book._id}`)
      .then((res) => setInLibrary(res.inLibrary))
      .catch(() => {});
  }, [book, isAuthenticated]);

  async function toggleLibrary() {
    if (!book || libraryLoading) return;
    setLibraryLoading(true);
    try {
      if (inLibrary) {
        await api.delete(`/api/v1/library/${book._id}`);
        setInLibrary(false);
        setToast({ message: "Removed from library", variant: "success" });
      } else {
        await api.post(`/api/v1/library/${book._id}`);
        setInLibrary(true);
        setToast({ message: "Added to library", variant: "success" });
      }
    } catch {
      setToast({ message: "Failed to update library", variant: "error" });
    }
    setLibraryLoading(false);
  }

  if (error) {
    return (
      <main className="py-12 text-center">
        <p className="text-red-500">Book not found.</p>
        <Link href="/explore" className="text-primary hover:underline mt-4 inline-block">
          Browse books
        </Link>
      </main>
    );
  }

  if (isLoading || !book) {
    return (
      <main className="py-12">
        <div className="animate-pulse h-96 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      </main>
    );
  }

  return (
    <main>
      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link className="hover:text-primary transition-colors" href="/">
          Home
        </Link>
        <span className="material-icons text-base mx-2 text-slate-300">chevron_right</span>
        <Link className="hover:text-primary transition-colors" href="/explore">
          {book.category || "Books"}
        </Link>
        <span className="material-icons text-base mx-2 text-slate-300">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">{book.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center lg:items-start">
          <div className="relative group w-[280px] sm:w-[320px] lg:w-full aspect-[2/3] rounded-xl shadow-2xl shadow-primary/10 overflow-hidden">
            <img
              alt={`${book.title} cover`}
              className="w-full h-full object-cover"
              src={book.coverImageUrl || PLACEHOLDER}
            />
          </div>
          <Link
            href={startReadingHref}
            className="mt-6 w-full lg:hidden flex items-center justify-center gap-2 py-3 bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-200 font-medium"
          >
            <span className="material-icons text-primary">visibility</span>
            Free Preview
          </Link>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-start pt-2">
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              by <span className="text-primary font-medium">{book.author}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10 mb-8 border-y border-slate-200 dark:border-slate-800 py-6">
            <div>
              <div className="flex items-center text-yellow-400 gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="material-icons text-xl">
                    {i <= (book.rating || 0) ? "star" : "star_border"}
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {book.rating?.toFixed(1) ?? "—"} ({book.ratingCount ?? 0} reviews)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-icons text-xl">menu_book</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{book.pageCount ?? "—"}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Pages</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <span className="material-icons text-xl">schedule</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatDuration(book.estimatedReadTimeMinutes)}
                </p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Read Time</p>
              </div>
            </div>
            {book.language && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <span className="material-icons text-xl">translate</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getLanguageLabel(book.language)}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Language</p>
                </div>
              </div>
            )}
          </div>

          {book.description && (
            <div className="mb-10 max-w-3xl">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Synopsis</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{book.description}</p>
            </div>
          )}

          {(book.genres?.length || book.category) && (
            <div className="flex flex-wrap gap-3 mb-10">
              {[...(book.genres || []), book.category].filter(Boolean).map((g) => (
                <span
                  key={String(g)}
                  className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            {startReadingHref !== "#" ? (
              <Link
                href={startReadingHref}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold shadow-lg shadow-primary/30 transition-all"
              >
                <span className="material-icons">play_arrow</span>
                Start Reading
              </Link>
            ) : (
              <span className="flex items-center justify-center gap-3 px-8 py-4 bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-lg font-semibold cursor-not-allowed">
                <span className="material-icons">hourglass_empty</span>
                Coming Soon
              </span>
            )}
            {isAuthenticated ? (
              <button
                onClick={toggleLibrary}
                disabled={libraryLoading}
                className={`flex items-center justify-center gap-3 px-8 py-4 border-2 rounded-lg font-semibold transition-all ${
                  inLibrary
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-primary/5 text-neutral-700 dark:text-neutral-200 hover:text-primary"
                }`}
              >
                <span className="material-icons">{inLibrary ? "bookmark" : "bookmark_add"}</span>
                {libraryLoading ? "Updating..." : inLibrary ? "In Library" : "Add to Library"}
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-primary/5 text-neutral-700 dark:text-neutral-200 hover:text-primary rounded-lg font-semibold transition-all"
              >
                <span className="material-icons">bookmark_add</span>
                Add to Library
              </Link>
            )}
          </div>
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="mt-24 border-t border-slate-200 dark:border-slate-800 pt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Related Books</h2>
          <div className="flex overflow-x-auto gap-6 pb-8">
            {relatedBooks.map((b: { _id: string; title: string; author: string; slug: string; category?: string; coverImageUrl?: string }) => (
              <Link
                href={`/${b.category || "fiction"}/${b.slug}`}
                key={b._id}
                className="flex-none w-[180px] group"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-md mb-3">
                  <img
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    src={b.coverImageUrl || PLACEHOLDER}
                  />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">{b.title}</h3>
                <p className="text-sm text-slate-500">{b.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ReviewsSection bookId={book._id} />

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          open={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
