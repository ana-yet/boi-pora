"use client";

import useSWR from "swr";
import { api } from "../api";
import type { ApiBook } from "../types";
export type { ApiBook } from "../types";

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
