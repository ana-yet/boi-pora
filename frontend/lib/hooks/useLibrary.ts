"use client";

import useSWR from "swr";
import { api } from "../api";

interface LibraryItem {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    slug: string;
    author: string;
    coverImageUrl?: string;
  };
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

export function useLibrary(page = 1, limit = 50) {
  const url = `/api/v1/library?page=${page}&limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR<LibraryResponse>(
    url,
    fetcher
  );
  return { data, error, isLoading, mutate };
}
