"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useChapter } from "@/lib/hooks/useChapter";
import { useChapters } from "@/lib/hooks/useChapters";
import { useBookById } from "@/lib/hooks/useBook";
import { useAuth } from "@/app/providers/AuthProvider";
import { api } from "@/lib/api";
import { ReaderShell } from "./_components/ReaderShell";
import { ChapterContent } from "./_components/ChapterContent";
import { ChapterMarkdown } from "./_components/ChapterMarkdown";
import { extractChapterSectionHeadings } from "@/lib/markdown-headings";

function isMarkdown(text: string): boolean {
  return /^#{1,6}\s|^\*\*|^\*[^*]|^-\s|^\d+\.\s|^>\s|```|^\|.*\|/m.test(text);
}

function splitContent(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function getOrdinal(n: number): string {
  const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];
  return words[n] ?? String(n);
}

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const chapterId = params.chapterId as string;

  const { isAuthenticated } = useAuth();
  const { data: chapter, error: chapterError, isLoading } = useChapter(bookId, chapterId);
  const { data: chapters } = useChapters(bookId);
  const { data: book } = useBookById(bookId);

  const sortedChapters = [...(chapters || [])].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );
  const idx = sortedChapters.findIndex((c) => c.chapterId === chapterId);
  const prev = idx > 0 ? sortedChapters[idx - 1] : null;
  const next = idx >= 0 && idx < sortedChapters.length - 1 ? sortedChapters[idx + 1] : null;

  const prevHref = prev ? `/read/${bookId}/${prev.chapterId}` : undefined;
  const nextHref = next ? `/read/${bookId}/${next.chapterId}` : undefined;

  useEffect(() => {
    if (!isAuthenticated || !chapter || !book) return;
    const percentage = sortedChapters.length > 0 ? Math.round(((idx + 1) / sortedChapters.length) * 100) : 0;
    api.post("/api/v1/reading/progress", {
      bookId,
      chapterId: chapter._id,
      percentComplete: percentage,
    }).catch(() => {});
  }, [isAuthenticated, chapter, book, bookId, idx, sortedChapters.length]);

  if (chapterError || (!isLoading && !chapter)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark">
        <span className="material-icons text-5xl text-neutral-300 dark:text-neutral-600 mb-4" aria-hidden>
          menu_book
        </span>
        <p className="text-neutral-800 dark:text-white font-medium mb-1">Chapter not found</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
          This chapter may have been removed or the link is incorrect.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Browse books
          <span className="material-icons text-lg" aria-hidden>
            arrow_forward
          </span>
        </Link>
      </div>
    );
  }

  if (isLoading || !chapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background-light dark:bg-background-dark px-6">
        <span className="inline-block h-10 w-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" aria-hidden />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Opening chapter…</p>
        <span className="sr-only">Loading chapter</span>
      </div>
    );
  }

  const bookTitle = book?.title ?? "Book";
  const chapterLabel = `Chapter ${chapter.chapterNumber}`;
  const progress = {
    currentPage: 1,
    totalPages: 1,
    percentage: Math.min(100, ((idx + 1) / sortedChapters.length) * 100) || 0,
  };

  const useMarkdown = isMarkdown(chapter.content);
  const sectionHeadings = useMarkdown ? extractChapterSectionHeadings(chapter.content) : [];

  return (
    <ReaderShell
      bookTitle={bookTitle}
      chapterLabel={chapterLabel}
      progress={progress}
      chapterPosition={
        sortedChapters.length > 0
          ? { current: idx + 1, total: sortedChapters.length }
          : undefined
      }
      prevHref={prevHref}
      nextHref={nextHref}
      bookId={bookId}
      currentChapterId={chapterId}
      chapters={sortedChapters}
      sectionHeadings={sectionHeadings.length > 0 ? sectionHeadings : undefined}
    >
      <header className="mb-10 md:mb-12 text-center max-w-[min(42rem,100%)] mx-auto">
        <span className="text-primary/80 font-display text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-5 block">
          Chapter {getOrdinal(chapter.chapterNumber)}
        </span>
        <h2 className="font-serif-reading text-[1.65rem] sm:text-3xl md:text-4xl font-bold leading-[1.2] text-balance px-1">
          {chapter.title}
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="h-px w-16 bg-linear-to-r from-transparent via-primary/40 to-transparent rounded-full" />
        </div>
      </header>

      {useMarkdown ? (
        <ChapterMarkdown content={chapter.content} />
      ) : (
        <div className="mx-auto w-full max-w-[min(42rem,100%)]">
          <ChapterContent
            chapterNumber={`Chapter ${getOrdinal(chapter.chapterNumber)}`}
            chapterTitle={chapter.title}
            paragraphs={splitContent(chapter.content)}
            hideHeader
          />
        </div>
      )}
    </ReaderShell>
  );
}
