"use client";

import useSWR from "swr";
import { api } from "../api";

export interface ProgressBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImageUrl?: string;
  category?: string;
}

export interface ProgressChapter {
  _id: string;
  title?: string;
  chapterNumber?: number;
}

export interface ProgressItem {
  _id: string;
  bookId: ProgressBook;
  chapterId?: ProgressChapter;
  percentComplete?: number;
  lastReadAt?: string;
}

const fetcher = (url: string) => api.get<ProgressItem[]>(url);

export function useReadingProgress() {
  const { data, error, isLoading, mutate } = useSWR<ProgressItem[]>(
    "/api/v1/reading/progress",
    fetcher
  );
  return { data: data ?? [], error, isLoading, mutate };
}
