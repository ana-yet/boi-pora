"use client";

import useSWR from "swr";
import { api } from "../api";

export interface SearchBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImageUrl?: string;
  category?: string;
  rating?: number;
}

export function useBookSearch(query: string) {
  const { data, error, isLoading } = useSWR<SearchBook[]>(
    query.trim() ? [`/api/v1/books/search?q=${encodeURIComponent(query)}`] : null,
    ([url]) => api.get<SearchBook[]>(url)
  );
  return { data: Array.isArray(data) ? data : [], error, isLoading };
}
