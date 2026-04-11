import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getOrdinal,
  isMarkdown,
  resolveChapterNavigation,
} from "@/lib/chapter-read-utils";
import {
  fetchReaderBook,
  fetchReaderChapter,
  loadReaderPageData,
} from "@/lib/reader-page-fetch";
import { ReaderShell } from "./_components/ReaderShell";
import { ReaderProgressSync } from "./_components/ReaderProgressSync";

export const revalidate = 120;

type PageParams = { bookId: string; chapterId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { bookId, chapterId } = await params;
  const [chapter, book] = await Promise.all([
    fetchReaderChapter(bookId, chapterId),
    fetchReaderBook(bookId),
  ]);
  if (!chapter) {
    return { title: "Chapter not found" };
  }
  const bookName = book?.title ?? "Book";
  return { title: `${chapter.title} · ${bookName}` };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { bookId, chapterId } = await params;
  const { chapter, chapters, book } = await loadReaderPageData(bookId, chapterId);

  if (!chapter) {
    notFound();
  }

  const nav = resolveChapterNavigation(chapters, chapterId);
  const prevHref =
    nav.prev != null ? `/read/${bookId}/${nav.prev.chapterId}` : undefined;
  const nextHref =
    nav.next != null ? `/read/${bookId}/${nav.next.chapterId}` : undefined;

  const bookTitle = book?.title ?? "Book";
  const chapterLabel = `Chapter ${chapter.chapterNumber}`;
  const progressPct =
    nav.total > 0 && nav.idx >= 0
      ? Math.min(100, ((nav.idx + 1) / nav.total) * 100)
      : 0;
  const progress = {
    currentPage: 1,
    totalPages: 1,
    percentage: progressPct,
  };

  const useMd = isMarkdown(chapter.content);
  const ordinal = getOrdinal(chapter.chapterNumber);

  return (
    <>
      {nav.idx >= 0 && nav.total > 0 ? (
        <ReaderProgressSync
          bookId={bookId}
          chapterMongoId={chapter._id}
          positionOneBased={nav.idx + 1}
          totalChapters={nav.total}
        />
      ) : null}
      <ReaderShell
        bookTitle={bookTitle}
        chapterLabel={chapterLabel}
        progress={progress}
        chapterPosition={
          nav.total > 0 && nav.idx >= 0
            ? { current: nav.idx + 1, total: nav.total }
            : undefined
        }
        prevHref={prevHref}
        nextHref={nextHref}
        bookId={bookId}
        currentChapterId={chapterId}
        chapters={chapters}
        chapterArticle={{
          ordinalLine: `Chapter ${ordinal}`,
          chapterTitle: chapter.title,
          content: chapter.content,
          isMarkdown: useMd,
          plainChapterNumberLabel: `Chapter ${ordinal}`,
        }}
      />
    </>
  );
}
