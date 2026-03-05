"use client";

import useSWR from "swr";
import { api } from "../api";
import type { ProgressItem } from "../types";
export type { ProgressBook, ProgressChapter, ProgressItem } from "../types";

const fetcher = (url: string) => api.get<ProgressItem[]>(url);

export function useReadingProgress() {
  const { data, error, isLoading, mutate } = useSWR<ProgressItem[]>(
    "/api/v1/reading/progress",
    fetcher
  );
  return { data: data ?? [], error, isLoading, mutate };
}
