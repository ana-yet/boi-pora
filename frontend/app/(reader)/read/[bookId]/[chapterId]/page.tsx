"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useChapter } from "@/lib/hooks/useChapter";
import { useChapters } from "@/lib/hooks/useChapters";
import { useBookById } from "@/lib/hooks/useBook";
import { ReaderShell } from "./_components/ReaderShell";
import { ChapterContent } from "./_components/ChapterContent";

function splitContent(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const chapterId = params.chapterId as string;

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

  if (chapterError || (!isLoading && !chapter)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">Chapter not found.</p>
        <Link href="/explore" className="text-primary hover:underline">
          Browse books
        </Link>
      </div>
    );
  }

  if (isLoading || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const paragraphs = splitContent(chapter.content);
  const bookTitle = book?.title ?? "Book";
  const chapterLabel = `Chapter ${chapter.chapterNumber}`;
  const progress = {
    currentPage: 1,
    totalPages: 1,
    percentage: Math.min(100, ((idx + 1) / sortedChapters.length) * 100) || 0,
  };

  return (
    <ReaderShell
      bookTitle={bookTitle}
      chapterLabel={chapterLabel}
      progress={progress}
      prevHref={prevHref}
      nextHref={nextHref}
    >
      <ChapterContent
        chapterNumber={`Chapter ${getOrdinal(chapter.chapterNumber)}`}
        chapterTitle={chapter.title}
        paragraphs={paragraphs}
      />
    </ReaderShell>
  );
}

function getOrdinal(n: number): string {
  const s = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  return s[n] ?? String(n);
}
