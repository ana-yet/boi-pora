"use client";

import useSWR from "swr";
import { api } from "../api";

export interface Chapter {
  _id: string;
  bookId: string;
  chapterNumber: number;
  chapterId: string;
  title: string;
  content: string;
  wordCount?: number;
}

export function useChapters(bookId: string | null) {
  const { data, error, isLoading } = useSWR<Chapter[]>(
    bookId ? `/api/v1/chapters/book/${bookId}` : null,
    (url: string) => api.get<Chapter[]>(url)
  );
  return { data: Array.isArray(data) ? data : [], error, isLoading };
}
