"use client";

import Link from "next/link";
import type { ReaderTheme } from "./ReaderShell";

interface Chapter {
  chapterId: string;
  chapterNumber: number;
  title: string;
  wordCount?: number;
}

interface TOCColors {
  bg: string;
  border: string;
  text: string;
  muted: string;
  hoverBg: string;
  activeBg: string;
}

const TOC_COLORS: Record<ReaderTheme, TOCColors> = {
  light: { bg: "#fdfbf9", border: "#e5ddd5", text: "#4a4036", muted: "#8c8075", hoverBg: "#f3eee9", activeBg: "rgba(236,127,19,0.1)" },
  dark: { bg: "#1c1c1c", border: "#3a3a3a", text: "#cccccc", muted: "#666666", hoverBg: "#262626", activeBg: "rgba(236,127,19,0.15)" },
  sepia: { bg: "#faf0d7", border: "#d4be94", text: "#4a3824", muted: "#8a7560", hoverBg: "#f0e2c4", activeBg: "rgba(236,127,19,0.1)" },
};

interface TOCSidebarProps {
  bookId: string;
  currentChapterId: string;
  chapters: Chapter[];
  open: boolean;
  onClose: () => void;
  readerTheme: ReaderTheme;
}

export function TOCSidebar({ bookId, currentChapterId, chapters, open, onClose, readerTheme }: TOCSidebarProps) {
  if (!open) return null;

  const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const tc = TOC_COLORS[readerTheme];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm motion-safe:transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <aside
        style={{ backgroundColor: tc.bg, color: tc.text, borderColor: tc.border }}
        className="fixed top-0 left-0 h-full w-[min(20rem,88vw)] z-50 shadow-2xl flex flex-col overflow-hidden border-r animate-[slideInLeft_0.2s_ease-out] pt-[env(safe-area-inset-top)]"
      >
        <div style={{ borderColor: tc.border }} className="flex items-center justify-between px-4 py-4 border-b shrink-0">
          <h3 className="font-semibold flex items-center gap-2 text-sm tracking-tight">
            <span className="material-icons text-primary text-xl" aria-hidden="true">menu_book</span>
            Contents
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ color: tc.muted }}
            className="p-2 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Close table of contents"
          >
            <span className="material-icons text-xl" aria-hidden="true">close</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-2 space-y-0.5" aria-label="Chapters">
          {sorted.map((ch) => {
            const isCurrent = ch.chapterId === currentChapterId;
            const readMin = ch.wordCount ? Math.max(1, Math.round(ch.wordCount / 200)) : null;
            return (
              <Link
                key={ch.chapterId}
                href={`/read/${bookId}/${ch.chapterId}`}
                onClick={onClose}
                style={{
                  backgroundColor: isCurrent ? tc.activeBg : undefined,
                  color: isCurrent ? "var(--color-primary)" : tc.text,
                  borderColor: isCurrent ? "var(--color-primary)" : "transparent",
                }}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                  isCurrent ? "border shadow-sm" : "border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                }`}
              >
                <span
                  style={{ color: isCurrent ? "var(--color-primary)" : tc.muted }}
                  className="text-[11px] font-mono tabular-nums mt-0.5 w-7 shrink-0 opacity-90"
                >
                  {String(ch.chapterNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug line-clamp-2 ${isCurrent ? "font-semibold" : "font-medium"}`}>
                    {ch.title}
                  </p>
                  {readMin && (
                    <p style={{ color: tc.muted }} className="text-[11px] mt-1 tabular-nums">{readMin} min</p>
                  )}
                </div>
                {isCurrent && (
                  <span className="material-icons text-primary text-lg shrink-0 mt-0.5" aria-hidden="true">chevron_right</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
