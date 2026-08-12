/**
 * Server-side fetch helpers for public (ISR-cached) backend data.
 * Used by React Server Components — never imported from client code.
 */
import { getApiUrl } from "./env";
import type { ApiBook, BooksResponse, Chapter } from "./types";

/** ISR-style cache for public payloads (matches backend @Public routes). */
export const REVALIDATE_SECONDS = 120;

export async function backendGet<T>(
  path: string,
  revalidate: number = REVALIDATE_SECONDS
): Promise<T | null> {
  const url = `${getApiUrl()}${path}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function fetchBookBySlug(slug: string): Promise<ApiBook | null> {
  return backendGet<ApiBook>(`/api/v1/books/slug/${encodeURIComponent(slug)}`);
}

export async function fetchChapters(bookId: string): Promise<Chapter[]> {
  const data = await backendGet<Chapter[]>(`/api/v1/chapters/book/${bookId}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchBooks(params: {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  search?: string;
}): Promise<BooksResponse | null> {
  const q = new URLSearchParams();
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  if (params.category) q.set("category", params.category);
  if (params.sort) q.set("sort", params.sort);
  if (params.search) q.set("search", params.search);
  return backendGet<BooksResponse>(`/api/v1/books?${q.toString()}`);
}

export async function fetchRelatedBooks(
  category: string | undefined,
  excludeId: string,
  limit = 6
): Promise<ApiBook[]> {
  const data = await fetchBooks({ page: 1, limit: limit + 1, category });
  return (data?.items ?? []).filter((b) => b._id !== excludeId).slice(0, limit);
}
