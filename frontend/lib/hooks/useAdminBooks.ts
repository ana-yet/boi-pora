"use client";

import useSWR from "swr";
import { api } from "../api";
import type { BooksResponse } from "../types";

const fetcher = (url: string) => api.get<BooksResponse>(url);

/** Authenticated admin listing — supports all statuses (draft/archived included). */
export function useAdminBooks(
  page = 1,
  limit = 20,
  category?: string,
  status?: string,
  sort?: string,
  search?: string
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (sort) params.set("sort", sort);
  if (search) params.set("search", search);

  const url = `/api/v1/admin/books?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<BooksResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { data, error, isLoading, mutate };
}
