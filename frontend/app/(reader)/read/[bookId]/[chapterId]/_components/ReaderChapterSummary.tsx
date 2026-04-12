"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api, ApiError } from "@/lib/api";

type ChapterSummaryResponse = { summary: string; cached: boolean };

type ReaderChapterSummaryColors = {
  text: string;
  muted: string;
  border: string;
  bg: string;
};

type Props = {
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  colors: ReaderChapterSummaryColors;
};

export function ReaderChapterSummary({ bookId, chapterId, chapterTitle, colors }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    setSummary(null);
    setError(null);
    setFromCache(false);
    setOpen(false);
  }, [bookId, chapterId]);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ChapterSummaryResponse>(
        `/api/v1/chapters/book/${bookId}/${chapterId}/summary`,
        {},
      );
      setSummary(res.summary);
      setFromCache(res.cached);
    } catch (e: unknown) {
      setSummary(null);
      setError(e instanceof ApiError ? e.message : "Could not load summary");
    } finally {
      setLoading(false);
    }
  }, [bookId, chapterId]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (summary !== null && !error) return;
    void loadSummary();
  }, [loadSummary, summary, error]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        style={{ color: colors.muted }}
        className="p-2.5 rounded-xl hover:bg-black/4 dark:hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
        aria-label="Chapter summary"
      >
        <span className="material-icons text-[22px]" aria-hidden="true">
          auto_stories
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              aria-hidden
              className="fixed inset-0 z-75 touch-none bg-transparent"
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                close();
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reader-chapter-summary-title"
              className="fixed left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-76 w-[min(26rem,calc(100vw-1.5rem))] max-h-[min(32rem,calc(100dvh-2rem))] translate-x-[-50%] overflow-hidden rounded-2xl border shadow-2xl ring-1 ring-black/4 dark:ring-white/6 flex flex-col"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5"
                style={{ borderColor: colors.border }}
              >
                <div className="min-w-0">
                  <h2
                    id="reader-chapter-summary-title"
                    className="truncate text-sm font-semibold leading-tight"
                  >
                    Summary
                  </h2>
                  <p className="truncate text-[11px] mt-0.5" style={{ color: colors.muted }}>
                    {chapterTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close summary"
                  style={{ color: colors.muted }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none transition-colors hover:bg-black/5 dark:hover:bg-white/8"
                >
                  ×
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                {loading && (
                  <div className="flex items-center gap-2 py-6 justify-center" style={{ color: colors.muted }}>
                    <span
                      className="inline-block size-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
                      aria-hidden
                    />
                    <span className="text-sm">Generating…</span>
                  </div>
                )}
                {!loading && error && (
                  <p className="text-sm leading-snug text-red-600 dark:text-red-400" role="alert">
                    {error}
                  </p>
                )}
                {!loading && !error && summary !== null && (
                  <div className="space-y-2">
                    {fromCache && (
                      <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: colors.muted }}>
                        From saved summary
                      </p>
                    )}
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap font-serif-reading"
                      style={{ color: colors.text }}
                    >
                      {summary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
