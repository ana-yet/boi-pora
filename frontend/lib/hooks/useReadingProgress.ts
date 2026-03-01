"use client";

import useSWR from "swr";
import { api } from "../api";

export interface ProgressItem {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    slug: string;
    author: string;
    coverImageUrl?: string;
  };
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
