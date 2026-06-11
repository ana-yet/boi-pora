"use client";

import { useEffect, useState } from "react";
import { MarkdownRenderer } from "@/app/components/ui/MarkdownRenderer";
import { isMarkdown, splitContent } from "@/lib/chapter-read-utils";
import {
  listOfflineBooks,
  readOfflineChapter,
  type OfflineBookEntry,
} from "@/lib/offline-books";
import type { Chapter } from "@/lib/types";

type State =
  | { kind: "loading" }
  | {
      kind: "chapter";
      chapter: Chapter;
      book: OfflineBookEntry;
      prevHref?: string;
      nextHref?: string;
    }
  | { kind: "list"; books: OfflineBookEntry[] };

const READ_PATH = /^\/read\/([^/]+)\/([^/]+)\/?$/;

/**
 * Client-side offline experience. The service worker serves this shell for
 * any navigation that fails while offline, so the browser URL still points
 * at the originally requested page — we inspect it to decide what to render.
 */
export function OfflineShell() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const match = READ_PATH.exec(window.location.pathname);
      if (match) {
        const [, bookId, chapterId] = match;
        const [chapter, books] = await Promise.all([
          readOfflineChapter(bookId!, decodeURIComponent(chapterId!)),
          listOfflineBooks(),
        ]);
        const book = books.find((b) => b.bookId === bookId);
        if (chapter && book) {
          const idx = book.chapters.findIndex(
            (c) => c.chapterId === chapter.chapterId
          );
          const prev = idx > 0 ? book.chapters[idx - 1] : undefined;
          const next =
            idx >= 0 && idx < book.chapters.length - 1
              ? book.chapters[idx + 1]
              : undefined;
          if (!cancelled) {
            setState({
              kind: "chapter",
              chapter,
              book,
              prevHref: prev && `/read/${bookId}/${prev.chapterId}`,
              nextHref: next && `/read/${bookId}/${next.chapterId}`,
            });
          }
          return;
        }
      }
      const books = await listOfflineBooks();
      if (!cancelled) setState({ kind: "list", books });
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  // Leaving the offline page after reconnecting: full reload so the server
  // renders the real page again instead of the offline shell.
  useEffect(() => {
    const onOnline = () => window.location.reload();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  if (state.kind === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fdfcfb] dark:bg-[#121212]">
        <span className="material-icons animate-spin text-3xl text-primary">
          progress_activity
        </span>
      </main>
    );
  }

  if (state.kind === "chapter") {
    const { chapter, book, prevHref, nextHref } = state;
    const md = isMarkdown(chapter.content);
    return (
      <main className="min-h-screen bg-[#fdfcfb] dark:bg-[#121212] text-neutral-900 dark:text-neutral-100">
        <header className="sticky top-0 z-10 h-14 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-[#fdfcfb]/90 dark:bg-[#121212]/90 backdrop-blur">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{book.title}</p>
            <p className="text-xs text-neutral-500 truncate">
              Chapter {chapter.chapterNumber} · {chapter.title}
            </p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 border border-neutral-300 dark:border-neutral-700 rounded-full px-2 py-1 shrink-0">
            <span className="material-icons text-xs" aria-hidden="true">
              cloud_off
            </span>
            Offline copy
          </span>
        </header>

        <article className="mx-auto w-full max-w-2xl px-5 py-10">
          <h1 className="text-2xl font-bold mb-6">{chapter.title}</h1>
          {md ? (
            <MarkdownRenderer content={chapter.content} />
          ) : (
            <div className="space-y-5 text-[1.05rem] leading-8">
              {splitContent(chapter.content).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </article>

        <nav className="mx-auto w-full max-w-2xl px-5 pb-16 flex items-center justify-between gap-3">
          {prevHref ? (
            <a
              href={prevHref}
              className="flex items-center gap-1 min-h-[44px] px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:border-primary transition-colors"
            >
              <span className="material-icons text-base">chevron_left</span>
              Previous
            </a>
          ) : (
            <span />
          )}
          {nextHref && (
            <a
              href={nextHref}
              className="flex items-center gap-1 min-h-[44px] px-4 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Next
              <span className="material-icons text-base">chevron_right</span>
            </a>
          )}
        </nav>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdfcfb] dark:bg-[#121212] text-neutral-900 dark:text-neutral-100 px-5">
      <div className="w-full max-w-md text-center py-16">
        <span className="material-icons text-5xl text-neutral-300 dark:text-neutral-600 mb-4 block">
          cloud_off
        </span>
        <h1 className="text-xl font-bold mb-2">You’re offline</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          This page isn’t available offline. Books you’ve downloaded from your
          library are still readable.
        </p>

        {state.books.length > 0 ? (
          <ul className="space-y-2 text-left">
            {state.books.map((b) => (
              <li key={b.bookId}>
                <a
                  href={
                    b.chapters[0]
                      ? `/read/${b.bookId}/${b.chapters[0].chapterId}`
                      : "#"
                  }
                  className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary transition-colors"
                >
                  <span className="material-icons text-primary">
                    auto_stories
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate">
                      {b.title}
                    </span>
                    <span className="block text-xs text-neutral-500 truncate">
                      {b.author} · {b.chapters.length} chapters
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-neutral-400">
            No downloaded books yet. When online, open your library and tap
            “Download” on a saved book.
          </p>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <span className="material-icons text-base">refresh</span>
          Try again
        </button>
      </div>
    </main>
  );
}
