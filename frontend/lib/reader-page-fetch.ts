import { backendGet, fetchChapters } from "./server-fetch";
import type { ApiBook, Chapter } from "./types";

export function fetchReaderChapter(
  bookId: string,
  chapterId: string
): Promise<Chapter | null> {
  return backendGet<Chapter>(`/api/v1/chapters/book/${bookId}/${chapterId}`);
}

export const fetchReaderChapters = fetchChapters;

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
