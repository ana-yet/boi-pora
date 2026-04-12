"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "hast-util-sanitize";
import { api, ApiError } from "@/lib/api";
import type { ReaderTheme } from "./ReaderShell";

type ChapterSummaryResponse = { summary: string; cached: boolean };

type SummaryViewMode = "preview" | "markdown";

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
  theme: ReaderTheme;
};

export function ReaderChapterSummary({
  bookId,
  chapterId,
  chapterTitle,
  colors,
  theme,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<SummaryViewMode>("preview");

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    setSummary(null);
    setError(null);
    setFromCache(false);
    setOpen(false);
    setViewMode("preview");
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
      setViewMode("preview");
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

  const proseInvert = theme === "dark" ? "prose-invert" : "";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Read an AI-generated overview of this chapter"
        aria-label="Open chapter summary — AI overview of this chapter"
        className="flex max-w-42 sm:max-w-none items-center gap-1.5 rounded-xl border border-primary/35 bg-primary/12 px-2 py-1.5 sm:px-2.5 sm:py-2 text-left shadow-sm transition-colors hover:bg-primary/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-primary/40 dark:bg-primary/18 dark:hover:bg-primary/25"
      >
        <span className="material-icons shrink-0 text-primary text-[20px]" aria-hidden="true">
          summarize
        </span>
        <span className="min-w-0 flex flex-col gap-0.5">
          <span className="text-[11px] font-bold leading-none tracking-wide text-primary sm:text-xs">
            <span className="sm:hidden">Summary</span>
            <span className="hidden sm:inline">Chapter summary</span>
          </span>
          <span className="hidden text-[10px] font-medium leading-none text-primary/80 sm:block">
            AI overview
          </span>
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
              aria-describedby="reader-chapter-summary-desc"
              className="fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-76 flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[min(32rem,calc(100vw-1.25rem))] translate-x-[-50%] flex-col overflow-hidden rounded-2xl border shadow-2xl ring-1 ring-black/4 dark:ring-white/6"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className="flex shrink-0 items-start gap-3 border-b px-4 py-3.5"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary"
                  aria-hidden
                >
                  <span className="material-icons text-[24px]">summarize</span>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 id="reader-chapter-summary-title" className="text-base font-bold leading-tight">
                    Chapter summary
                  </h2>
                  <p id="reader-chapter-summary-desc" className="mt-1 text-sm leading-snug" style={{ color: colors.muted }}>
                    {chapterTitle}
                  </p>
                  {fromCache && !loading && summary !== null && (
                    <span
                      className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ borderColor: colors.border, color: colors.muted }}
                    >
                      Saved · instant load
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close summary"
                  style={{ color: colors.muted }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl leading-none transition-colors hover:bg-black/5 dark:hover:bg-white/8"
                >
                  ×
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {loading && (
                  <div
                    className="flex flex-col items-center justify-center gap-3 py-10"
                    style={{ color: colors.muted }}
                  >
                    <span
                      className="inline-block size-9 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
                      aria-hidden
                    />
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>
                        Writing your summary…
                      </p>
                      <p className="mt-1 text-xs">First time may take a few seconds</p>
                    </div>
                  </div>
                )}
                {!loading && error && (
                  <div
                    className="rounded-xl border px-3 py-3 text-sm leading-snug text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
                    style={{ borderColor: `${colors.border}` }}
                    role="alert"
                  >
                    {error}
                  </div>
                )}
                {!loading && !error && summary !== null && (
                  <div className="space-y-3">
                    <div
                      className="flex rounded-xl border bg-black/4 p-0.5 dark:bg-white/6"
                      style={{ borderColor: colors.border }}
                      role="tablist"
                      aria-label="Summary display format"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === "preview"}
                        onClick={() => setViewMode("preview")}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
                          viewMode === "preview" ? "bg-primary text-white shadow-sm" : ""
                        }`}
                        style={viewMode === "preview" ? undefined : { color: colors.muted }}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === "markdown"}
                        onClick={() => setViewMode("markdown")}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
                          viewMode === "markdown" ? "bg-primary text-white shadow-sm" : ""
                        }`}
                        style={viewMode === "markdown" ? undefined : { color: colors.muted }}
                      >
                        Markdown
                      </button>
                    </div>

                    {viewMode === "preview" ? (
                      <article
                        className={`prose prose-base max-w-none font-serif-reading ${proseInvert}
                      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-balance
                      prose-h2:mt-6 prose-h2:mb-2 prose-h2:border-b prose-h2:pb-1.5 prose-h2:text-[1rem]
                      prose-h2:border-black/10 dark:prose-h2:border-white/15
                      prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:text-[0.95rem]
                      prose-p:my-2.5 prose-p:leading-relaxed
                      prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1
                      prose-li:marker:text-primary
                      prose-strong:font-semibold prose-strong:text-inherit
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-hr:border-current/20
                      prose-table:text-sm prose-th:px-2 prose-td:px-2`}
                        style={{ color: colors.text }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[[rehypeSanitize, defaultSchema]]}
                        >
                          {summary}
                        </ReactMarkdown>
                      </article>
                    ) : (
                      <pre
                        className="max-h-[min(24rem,55vh)] overflow-auto rounded-xl border p-3 text-left text-[13px] leading-relaxed font-mono whitespace-pre-wrap shadow-inner"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.muted + "14",
                          color: colors.text,
                        }}
                      >
                        {summary}
                      </pre>
                    )}
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
