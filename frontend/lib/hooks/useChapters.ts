"use client";

import useSWR from "swr";
import { api } from "../api";
import type { Chapter } from "../types";
export type { Chapter } from "../types";

export function useChapters(bookId: string | null) {
  const { data, error, isLoading } = useSWR<Chapter[]>(
    bookId ? `/api/v1/chapters/book/${bookId}` : null,
    (url: string) => api.get<Chapter[]>(url)
  );
  return { data: Array.isArray(data) ? data : [], error, isLoading };
}
