/**
 * Offline book storage for the PWA (client-only).
 *
 * Storage choice: Cache Storage (not IndexedDB). Chapters are fetched as plain
 * GET responses, so caching them under their real API URLs means the service
 * worker can transparently serve them as a network fallback with a simple
 * `caches.match(request)` — no serialization layer, no schema migrations.
 * A small JSON index under a synthetic URL tracks what has been downloaded.
 */
import { getApiUrl } from "./env";
import type { ApiBook, Chapter } from "./types";

export const OFFLINE_CACHE = "bp-offline-books-v1";
const INDEX_URL = "/__offline__/index";

export interface OfflineChapterRef {
  chapterId: string;
  title: string;
  chapterNumber: number;
}

export interface OfflineBookEntry {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  language?: string;
  chapters: OfflineChapterRef[];
  savedAt: string;
}

export type OfflineIndex = Record<string, OfflineBookEntry>;

function supported(): boolean {
  return typeof window !== "undefined" && "caches" in window;
}

function bookUrl(bookId: string): string {
  return `${getApiUrl()}/api/v1/books/${bookId}`;
}

function chapterListUrl(bookId: string): string {
  return `${getApiUrl()}/api/v1/chapters/book/${bookId}`;
}

function chapterUrl(bookId: string, chapterId: string): string {
  return `${getApiUrl()}/api/v1/chapters/book/${bookId}/${chapterId}`;
}

export async function readOfflineIndex(): Promise<OfflineIndex> {
  if (!supported()) return {};
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const res = await cache.match(INDEX_URL);
    if (!res) return {};
    return (await res.json()) as OfflineIndex;
  } catch {
    return {};
  }
}

async function writeOfflineIndex(index: OfflineIndex): Promise<void> {
  const cache = await caches.open(OFFLINE_CACHE);
  await cache.put(
    INDEX_URL,
    new Response(JSON.stringify(index), {
      headers: { "Content-Type": "application/json" },
    })
  );
}

export async function isBookOffline(bookId: string): Promise<boolean> {
  const index = await readOfflineIndex();
  return bookId in index;
}

export async function listOfflineBooks(): Promise<OfflineBookEntry[]> {
  const index = await readOfflineIndex();
  return Object.values(index).sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt)
  );
}

/**
 * Download a book for offline reading: book metadata, chapter list,
 * every chapter's content, and the cover image.
 */
export async function downloadBookOffline(
  bookId: string,
  onProgress?: (done: number, total: number) => void
): Promise<OfflineBookEntry> {
  if (!supported()) throw new Error("Offline storage is not supported");

  const cache = await caches.open(OFFLINE_CACHE);

  const [bookRes, listRes] = await Promise.all([
    fetch(bookUrl(bookId)),
    fetch(chapterListUrl(bookId)),
  ]);
  if (!bookRes.ok || !listRes.ok) throw new Error("Failed to fetch book data");

  const book = (await bookRes.clone().json()) as ApiBook;
  const chapters = (await listRes.clone().json()) as Chapter[];

  await cache.put(bookUrl(bookId), bookRes);
  await cache.put(chapterListUrl(bookId), listRes);

  const total = chapters.length + 1; // +1 for the cover
  let done = 0;
  onProgress?.(done, total);

  // Sequential keeps memory + server load low; chapters are small.
  for (const ch of chapters) {
    const res = await fetch(chapterUrl(bookId, ch.chapterId));
    if (res.ok) {
      await cache.put(chapterUrl(bookId, ch.chapterId), res);
    }
    onProgress?.(++done, total);
  }

  const cover = book.coverImageUrl?.trim();
  if (cover) {
    try {
      const res = await fetch(cover, { mode: "no-cors" });
      await cache.put(cover, res);
    } catch {
      // Cover is cosmetic — text content matters more offline.
    }
  }
  onProgress?.(++done, total);

  const entry: OfflineBookEntry = {
    bookId,
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    language: book.language,
    chapters: chapters.map((ch) => ({
      chapterId: ch.chapterId,
      title: ch.title,
      chapterNumber: ch.chapterNumber,
    })),
    savedAt: new Date().toISOString(),
  };

  const index = await readOfflineIndex();
  index[bookId] = entry;
  await writeOfflineIndex(index);
  return entry;
}

export async function removeBookOffline(bookId: string): Promise<void> {
  if (!supported()) return;
  const cache = await caches.open(OFFLINE_CACHE);
  const index = await readOfflineIndex();
  const entry = index[bookId];

  await cache.delete(bookUrl(bookId));
  await cache.delete(chapterListUrl(bookId));
  if (entry) {
    await Promise.all(
      entry.chapters.map((ch) => cache.delete(chapterUrl(bookId, ch.chapterId)))
    );
    if (entry.coverImageUrl) await cache.delete(entry.coverImageUrl);
  }

  delete index[bookId];
  await writeOfflineIndex(index);
}

/** Read a downloaded chapter straight from the offline cache. */
export async function readOfflineChapter(
  bookId: string,
  chapterId: string
): Promise<Chapter | null> {
  if (!supported()) return null;
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const res = await cache.match(chapterUrl(bookId, chapterId));
    if (!res) return null;
    return (await res.json()) as Chapter;
  } catch {
    return null;
  }
}
