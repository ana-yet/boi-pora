"use client";

import useSWR from "swr";
import { api } from "../api";

interface LibraryResponse {
  items: Array<{
    _id: string;
    userId?: { _id: string; email: string; name?: string };
    bookId?: { _id: string; title: string; slug: string; author: string };
    status?: string;
    addedAt?: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<LibraryResponse>(url);

export function useAdminLibrary(page = 1, limit = 20) {
  const url = `/api/v1/admin/library?page=${page}&limit=${limit}`;
  const { data, error, isLoading } = useSWR<LibraryResponse>(url, fetcher);
  return { data, error, isLoading };
}
