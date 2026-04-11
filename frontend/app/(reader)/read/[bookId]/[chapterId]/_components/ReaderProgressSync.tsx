"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { api } from "@/lib/api";

type Props = {
  bookId: string;
  chapterMongoId: string;
  /** 1-based index in the book (for progress percentage). */
  positionOneBased: number;
  totalChapters: number;
};

/**
 * Fire-and-forget reading progress; stays client-only because it depends on auth + localStorage token.
 */
export function ReaderProgressSync({
  bookId,
  chapterMongoId,
  positionOneBased,
  totalChapters,
}: Props) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || totalChapters < 1 || !chapterMongoId) return;
    const percentage = Math.round((positionOneBased / totalChapters) * 100);
    api
      .post("/api/v1/reading/progress", {
        bookId,
        chapterId: chapterMongoId,
        percentComplete: percentage,
      })
      .catch(() => {});
  }, [isAuthenticated, bookId, chapterMongoId, positionOneBased, totalChapters]);

  return null;
}
