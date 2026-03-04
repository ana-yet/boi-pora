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
}

export function useBookBySlug(slug: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiBook>(
    slug ? `/api/v1/books/slug/${slug}` : null,
    (url: string) => api.get<ApiBook>(url)
  );
  return { data, error, isLoading, mutate };
}

export function useBookById(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiBook>(
    id ? `/api/v1/books/${id}` : null,
    (url: string) => api.get<ApiBook>(url)
  );
  return { data, error, isLoading, mutate };
}
