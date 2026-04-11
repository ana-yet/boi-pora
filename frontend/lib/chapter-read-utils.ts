import type { Chapter } from "./types";

const ORDINAL_WORDS = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
] as const;

export function isMarkdown(text: string): boolean {
  return /^#{1,6}\s|^\*\*|^\*[^*]|^-\s|^\d+\.\s|^>\s|```|^\|.*\|/m.test(text);
}

export function splitContent(content: string): string[] {
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function getOrdinal(n: number): string {
  return (ORDINAL_WORDS[n] as string | undefined) ?? String(n);
}

/**
 * Prev/next use API list order (backend sorts by order, then chapterNumber).
 * Single O(n) scan — no extra sort.
 */
export function resolveChapterNavigation(
  chapters: readonly Chapter[],
  chapterId: string
): { idx: number; prev: Chapter | null; next: Chapter | null; total: number } {
  const total = chapters.length;
  const idx = total ? chapters.findIndex((c) => c.chapterId === chapterId) : -1;
  const prev = idx > 0 ? chapters[idx - 1]! : null;
  const next = idx >= 0 && idx < total - 1 ? chapters[idx + 1]! : null;
  return { idx, prev, next, total };
}
