import type { MetadataRoute } from "next";
import { fetchBooks } from "@/lib/server-fetch";
import { absoluteUrl } from "@/lib/site";
import type { ApiBook } from "@/lib/types";

export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/explore", priority: 0.9 },
  { path: "/explore/new", priority: 0.8 },
  { path: "/explore/trending", priority: 0.8 },
  { path: "/search", priority: 0.6 },
  { path: "/about", priority: 0.4 },
  { path: "/terms", priority: 0.2 },
];

/** Backend caps page size at 100; walk pages with a sane upper bound. */
async function fetchAllPublishedBooks(): Promise<ApiBook[]> {
  const books: ApiBook[] = [];
  const MAX_PAGES = 20;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchBooks({ page, limit: 100 });
    if (!data?.items?.length) break;
    books.push(...data.items);
    if (books.length >= data.total) break;
  }
  return books;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "daily",
      priority,
    })
  );

  const books = await fetchAllPublishedBooks();
  for (const book of books) {
    if (!book.slug) continue;
    entries.push({
      url: absoluteUrl(`/${book.category || "fiction"}/${book.slug}`),
      lastModified: book.updatedAt ? new Date(book.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
