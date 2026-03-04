"use client";

import Link from "next/link";

interface Chapter {
  chapterId: string;
  chapterNumber: number;
  title: string;
  wordCount?: number;
}

interface TOCSidebarProps {
  bookId: string;
  currentChapterId: string;
  chapters: Chapter[];
  open: boolean;
  onClose: () => void;
}

export function TOCSidebar({ bookId, currentChapterId, chapters, open, onClose }: TOCSidebarProps) {
  if (!open) return null;

  const sorted = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <aside className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900 z-50 shadow-2xl flex flex-col overflow-hidden animate-[slideInLeft_0.2s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="font-semibold text-neutral-800 dark:text-white flex items-center gap-2">
            <span className="material-icons text-primary">list</span>
            Table of Contents
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <span className="material-icons text-neutral-500">close</span>
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
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-l-4 border-transparent"
                }`}
              >
                <span className={`text-xs font-mono mt-0.5 ${isCurrent ? "text-primary font-bold" : "text-neutral-400"}`}>
                  {String(ch.chapterNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isCurrent ? "font-semibold" : "font-medium"}`}>
                    {ch.title}
                  </p>
                  {readMin && (
                    <p className="text-xs text-neutral-400 mt-0.5">{readMin} min read</p>
                  )}
                </div>
                {isCurrent && (
                  <span className="material-icons text-primary text-sm mt-0.5">play_arrow</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
