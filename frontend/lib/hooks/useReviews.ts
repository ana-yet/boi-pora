"use client";

import useSWR from "swr";
import { api } from "../api";
import type { ReviewsResponse } from "../types";
export type { ReviewItem, ReviewsResponse } from "../types";

const fetcher = (url: string) => api.get<ReviewsResponse>(url);

export function useReviews(bookId: string | null, page = 1, limit = 10) {
  const url = bookId
    ? `/api/v1/reviews?bookId=${bookId}&page=${page}&limit=${limit}`
    : null;
  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(
    url,
    fetcher
  );
  return { data, error, isLoading, mutate };
}
