import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBookBySlug, fetchChapters, fetchRelatedBooks } from "@/lib/server-fetch";
import { absoluteUrl } from "@/lib/site";
import { getLanguageLabel } from "@/lib/constants";
import { PLACEHOLDER_COVER as PLACEHOLDER, formatDuration } from "@/lib/format";
import { ReviewsSection } from "./_components/ReviewsSection";
import { BookActions } from "./_components/BookActions";

export const revalidate = 120;

type PageParams = { category: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await fetchBookBySlug(slug);

  if (!book) {
    return { title: "Book not found", robots: { index: false, follow: true } };
  }

  const title = `${book.title} by ${book.author}`;
  const description =
    book.description?.slice(0, 160) ||
    `Read ${book.title} by ${book.author} on Boi Pora — digital reading companion.`;
  const canonicalPath = `/${book.category || "fiction"}/${book.slug}`;

  const cover = book.coverImageUrl?.trim();
  const ogImages = cover
    ? [{ url: cover, alt: `${book.title} cover` }]
    : [{ url: absoluteUrl("/favicon.png"), alt: "Boi Pora", width: 512, height: 512 }];

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: "book",
      images: ogImages,
      siteName: "Boi Pora",
      url: absoluteUrl(canonicalPath),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const book = await fetchBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const [chapters, relatedBooks] = await Promise.all([
    fetchChapters(book._id),
    fetchRelatedBooks(book.category, book._id),
  ]);

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const firstChapter = sortedChapters[0];
  const startReadingHref = firstChapter
    ? `/read/${book._id}/${firstChapter.chapterId}`
    : `/read/${book._id}/chapter-1`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    ...(book.description && { description: book.description }),
    ...(book.coverImageUrl && { image: book.coverImageUrl }),
    ...(book.language && { inLanguage: book.language }),
    ...(book.rating != null &&
      (book.ratingCount ?? 0) > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: book.rating,
          ratingCount: book.ratingCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    url: absoluteUrl(`/${book.category || "fiction"}/${book.slug}`),
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="relative group w-[280px] sm:w-[320px] lg:w-full aspect-2/3 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden">
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

          <BookActions bookId={book._id} startReadingHref={startReadingHref} />
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="mt-24 border-t border-slate-200 dark:border-slate-800 pt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Related Books</h2>
          <div className="flex overflow-x-auto gap-6 pb-8">
            {relatedBooks.map((b) => (
              <Link
                href={`/${b.category || "fiction"}/${b.slug}`}
                key={b._id}
                className="flex-none w-[180px] group"
              >
                <div className="aspect-2/3 rounded-lg overflow-hidden shadow-md mb-3">
                  <img
                    alt={`${b.title} cover`}
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
    </div>
  );
}
