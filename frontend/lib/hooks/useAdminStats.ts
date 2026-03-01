"use client";

import useSWR from "swr";
import { api } from "../api";

interface AdminStats {
  users: number;
  books: number;
  chapters: number;
  libraryItems: number;
  reviews: number;
}

const fetcher = (url: string) => api.get<AdminStats>(url);

export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR<AdminStats>(
    "/api/v1/admin/stats",
    fetcher,
    { revalidateOnFocus: false }
  );
  return { data, error, isLoading, mutate };
}
