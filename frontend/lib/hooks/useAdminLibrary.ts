"use client";

import useSWR from "swr";
import { api } from "../api";

interface LibraryItem {
  _id: string;
  userId?: { _id: string; email: string; name?: string };
  bookId?: { _id: string; title: string; slug: string; author: string };
  status?: string;
  addedAt?: string;
}

interface LibraryResponse {
  items: LibraryItem[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<LibraryResponse>(url);

export function useAdminLibrary(page = 1, limit = 20, search?: string, status?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const url = `/api/v1/admin/library?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<LibraryResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { data, error, isLoading, mutate };
}
