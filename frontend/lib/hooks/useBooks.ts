"use client";

import useSWR from "swr";
import { api } from "../api";

export interface ApiBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  description?: string;
  coverImageUrl?: string;
  category?: string;
  language?: string;
  genres?: string[];
  pageCount?: number;
  estimatedReadTimeMinutes?: number;
  rating?: number;
  ratingCount?: number;
  status?: string;
}

interface BooksResponse {
  items: ApiBook[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<BooksResponse>(url);

export function useBooks(
  page = 1,
  limit = 20,
  category?: string,
  status?: string,
  sort?: string
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  const url = `/api/v1/books${query ? `?${query}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<BooksResponse>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return { data, error, isLoading, mutate };
}
