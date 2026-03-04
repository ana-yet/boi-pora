"use client";

import useSWR from "swr";
import { api } from "../api";

export interface LibraryBookRef {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImageUrl?: string;
  category?: string;
}

export interface LibraryItem {
  _id: string;
  bookId: LibraryBookRef;
  status?: string;
  addedAt?: string;
}

export interface LibraryResponse {
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
