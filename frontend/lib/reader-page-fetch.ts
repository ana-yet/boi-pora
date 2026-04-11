import { getApiUrl } from "./env";
import type { ApiBook, Chapter } from "./types";

/** ISR-style cache for public book/chapter payloads (matches backend @Public routes). */
const REVALIDATE_SECONDS = 120;

async function backendGet<T>(path: string): Promise<T | null> {
  const url = `${getApiUrl()}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<T>;
}

export function fetchReaderChapter(
  bookId: string,
  chapterId: string
): Promise<Chapter | null> {
  return backendGet<Chapter>(`/api/v1/chapters/book/${bookId}/${chapterId}`);
}

export async function fetchReaderChapters(bookId: string): Promise<Chapter[]> {
  const data = await backendGet<Chapter[]>(`/api/v1/chapters/book/${bookId}`);
  return Array.isArray(data) ? data : [];
}

export function fetchReaderBook(bookId: string): Promise<ApiBook | null> {
  return backendGet<ApiBook>(`/api/v1/books/${bookId}`);
}

export async function loadReaderPageData(bookId: string, chapterId: string) {
  const [chapter, chapters, book] = await Promise.all([
    fetchReaderChapter(bookId, chapterId),
    fetchReaderChapters(bookId),
    fetchReaderBook(bookId),
  ]);
  return { chapter, chapters, book };
}
