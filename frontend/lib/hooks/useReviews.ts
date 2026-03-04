"use client";

import useSWR from "swr";
import { api } from "../api";

export interface ReviewItem {
  _id: string;
  userId: { _id: string; name?: string };
  rating: number;
  content?: string;
  createdAt: string;
}

interface ReviewsResponse {
  items: ReviewItem[];
  total: number;
  page: number;
  limit: number;
}

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
