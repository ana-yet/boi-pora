"use client";

import useSWR from "swr";
import { api } from "../api";

interface Review {
  _id: string;
  userId: { _id: string; email: string; name?: string };
  bookId: { _id: string; title: string; slug: string; author?: string };
  rating: number;
  content?: string;
  flagged?: boolean;
  createdAt?: string;
}

interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<ReviewsResponse>(url);

export function useAdminReviews(
  page = 1,
  limit = 20,
  search?: string,
  rating?: number,
  flagged?: string,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (rating) params.set("rating", String(rating));
  if (flagged) params.set("flagged", flagged);

  const url = `/api/v1/admin/reviews?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { data, error, isLoading, mutate };
}
