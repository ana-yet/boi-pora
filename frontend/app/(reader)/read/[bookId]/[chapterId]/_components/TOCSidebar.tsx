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
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <aside
        style={{ backgroundColor: tc.bg, color: tc.text }}
        className="fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 shadow-2xl flex flex-col overflow-hidden animate-[slideInLeft_0.2s_ease-out]"
      >
        <div style={{ borderColor: tc.border }} className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <span className="material-icons text-primary text-lg" aria-hidden="true">list</span>
            Table of Contents
          </h3>
          <button
            onClick={onClose}
            style={{ color: tc.muted }}
            className="p-1 rounded hover:text-primary transition-colors"
            aria-label="Close table of contents"
          >
            <span className="material-icons text-lg" aria-hidden="true">close</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
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
                  borderLeftColor: isCurrent ? "var(--color-primary)" : "transparent",
                }}
                className="flex items-start gap-3 px-4 py-3 transition-colors border-l-[3px] hover:opacity-90"
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = tc.hoverBg; }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = ""; }}
              >
                <span style={{ color: isCurrent ? "var(--color-primary)" : tc.muted }} className="text-xs font-mono mt-0.5">
                  {String(ch.chapterNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isCurrent ? "font-semibold" : "font-medium"}`}>
                    {ch.title}
                  </p>
                  {readMin && (
                    <p style={{ color: tc.muted }} className="text-xs mt-0.5">{readMin} min read</p>
                  )}
                </div>
                {isCurrent && (
                  <span className="material-icons text-primary text-sm mt-0.5" aria-hidden="true">play_arrow</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
