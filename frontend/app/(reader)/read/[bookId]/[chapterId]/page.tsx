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
import { absoluteUrl } from "@/lib/site";
import { ReaderShell } from "./_components/ReaderShell";
import { ReaderProgressSync } from "./_components/ReaderProgressSync";

export const revalidate = 120;
// Enable PPR (Partial Prerendering) for hybrid static/dynamic
export const experimental_ppr = true;

type PageParams = { bookId: string; chapterId: string };

// Generate static params for popular books/chapters
export async function generateStaticParams(): Promise<PageParams[]> {
  const popularBookIds = ["popular-book-1", "popular-book-2"];
  const params: PageParams[] = [];
  
  for (const bookId of popularBookIds) {
    try {
      // Fetch only chapters list, not full content
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}/chapters`,
        { next: { revalidate: 3600 } }
      );
      
      if (!response.ok) continue;
      
      const chapters = await response.json();
      
      if (Array.isArray(chapters)) {
        chapters.forEach((ch: { chapterId: string }) => {
          if (ch.chapterId) {
            params.push({ bookId, chapterId: ch.chapterId });
          }
        });
      }
    } catch (error) {
      console.warn(`Skipping static generation for book ${bookId}:`, error);
    }
  }
  
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { bookId, chapterId } = await params;
  
  // Fetch both in parallel for better performance
  const [chapter, book] = await Promise.all([
    fetchReaderChapter(bookId, chapterId),
    fetchReaderBook(bookId),
  ]);
  
  if (!chapter) {
    return { 
      title: "Chapter not found",
      robots: { index: false, follow: true }
    };
  }
  
  const bookName = book?.title ?? "Book";
  const title = `${chapter.title} · ${bookName}`;
  const description = `Read “${chapter.title}” from ${bookName} on Boi Pora — digital reading companion.`;
  
  const cover = book?.coverImageUrl?.trim();
  const ogImages = cover
    ? [{ url: cover, alt: `${bookName} cover`, width: 1200, height: 630 }]
    : [{ url: absoluteUrl("/favicon.png"), alt: "Boi Pora", width: 512, height: 512 }];

  return {
    title,
    description,
    alternates: {
      canonical: `/read/${bookId}/${chapterId}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: ogImages,
      siteName: "Boi Pora",
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages.map((i) => i.url),
    },
    // Add structured data for SEO
    other: {
      'application-ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Chapter',
        name: chapter.title,
        isPartOf: {
          '@type': 'Book',
          name: bookName,
          ...(book?.author && { author: { '@type': 'Person', name: book.author } }),
        },
      }),
    },
  };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { bookId, chapterId } = await params;
  
  // Use Promise.all for parallel data fetching
  const [pageData, book] = await Promise.all([
    loadReaderPageData(bookId, chapterId),
    fetchReaderBook(bookId),
  ]);
  
  const { chapter, chapters } = pageData;

  if (!chapter) {
    notFound();
  }

  // Compute all derived data on the server
  const nav = resolveChapterNavigation(chapters, chapterId);
  const prevHref = nav.prev != null ? `/read/${bookId}/${nav.prev.chapterId}` : undefined;
  const nextHref = nav.next != null ? `/read/${bookId}/${nav.next.chapterId}` : undefined;

  const bookTitle = book?.title ?? "Book";
  const chapterLabel = `Chapter ${chapter.chapterNumber}`;
  const ordinal = getOrdinal(chapter.chapterNumber);
  const useMd = isMarkdown(chapter.content);

  // Pre-compute section headings on the server
  const sectionHeadings = useMd ? extractChapterSectionHeadings(chapter.content) : [];

  // Serialize chapter data for client component
  const chapterArticle = {
    ordinalLine: `Chapter ${ordinal}`,
    chapterTitle: chapter.title,
    content: chapter.content,
    isMarkdown: useMd,
    plainChapterNumberLabel: `Chapter ${ordinal}`,
  };

  const progressPct = nav.total > 0 && nav.idx >= 0
    ? Math.min(100, ((nav.idx + 1) / nav.total) * 100)
    : 0;

  const progress = {
    currentPage: 1,
    totalPages: 1,
    percentage: progressPct,
  };

  const chapterPosition = nav.total > 0 && nav.idx >= 0
    ? { current: nav.idx + 1, total: nav.total }
    : undefined;

  // Don't render progress tracker if it's not needed
  const shouldTrackProgress = nav.idx >= 0 && nav.total > 0;

  return (
    <>
      {shouldTrackProgress && (
        <ReaderProgressSync
          bookId={bookId}
          chapterMongoId={chapter._id}
          positionOneBased={nav.idx + 1}
          totalChapters={nav.total}
        />
      )}
      <ReaderShell
        bookTitle={bookTitle}
        bookLanguage={book?.language}
        chapterLabel={chapterLabel}
        progress={progress}
        chapterPosition={chapterPosition}
        prevHref={prevHref}
        nextHref={nextHref}
        bookId={bookId}
        currentChapterId={chapterId}
        chapters={chapters}
        chapterArticle={chapterArticle}
      />
    </>
  );
}

// Import this helper at the top
function extractChapterSectionHeadings(content: string) {
  // If you have this function in markdown-headings, import it instead
  // This is a simple fallback
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    headings.push({ level, text, id });
  }
  
  return headings;
}