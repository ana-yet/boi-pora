"use client";

import useSWR from "swr";
import { api } from "../api";
import type { Chapter } from "../types";
export type { Chapter } from "../types";

export function useChapter(bookId: string | null, chapterId: string | null) {
  const { data, error, isLoading } = useSWR<Chapter>(
    bookId && chapterId
      ? `/api/v1/chapters/book/${bookId}/${chapterId}`
      : null,
    (url: string) => api.get<Chapter>(url)
  );
  return { data, error, isLoading };
}
