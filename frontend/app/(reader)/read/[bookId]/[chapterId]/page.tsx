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
import { MarkdownRenderer } from "@/app/components/ui/MarkdownRenderer";

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
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fafafa]">
        <p className="text-red-500 mb-4">Chapter not found.</p>
        <Link href="/explore" className="text-primary hover:underline">
          Browse books
        </Link>
      </div>
    );
  }

  if (isLoading || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
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

  return (
    <ReaderShell
      bookTitle={bookTitle}
      chapterLabel={chapterLabel}
      progress={progress}
      prevHref={prevHref}
      nextHref={nextHref}
      bookId={bookId}
      currentChapterId={chapterId}
      chapters={sortedChapters}
    >
      <header className="mb-12 text-center">
        <span className="text-primary/70 font-display text-sm font-bold tracking-widest uppercase mb-4 block">
          Chapter {getOrdinal(chapter.chapterNumber)}
        </span>
        <h2 className="font-serif-reading text-3xl md:text-4xl font-bold leading-snug">
          {chapter.title}
        </h2>
        <div className="mt-4 w-12 h-0.5 bg-primary/30 mx-auto rounded-full" />
      </header>

      {useMarkdown ? (
        <MarkdownRenderer content={chapter.content} />
      ) : (
        <ChapterContent
          chapterNumber={`Chapter ${getOrdinal(chapter.chapterNumber)}`}
          chapterTitle={chapter.title}
          paragraphs={splitContent(chapter.content)}
          hideHeader
        />
      )}
    </ReaderShell>
  );
}
