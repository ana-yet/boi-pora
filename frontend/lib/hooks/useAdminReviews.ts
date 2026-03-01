"use client";

import useSWR from "swr";
import { api } from "../api";

interface Review {
  _id: string;
  userId: { _id: string; email: string; name?: string };
  bookId: { _id: string; title: string; slug: string };
  rating: number;
  content?: string;
  createdAt?: string;
}

interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<ReviewsResponse>(url);

export function useAdminReviews(page = 1, limit = 20) {
  const url = `/api/v1/admin/reviews?page=${page}&limit=${limit}`;
  const { data, error, isLoading } = useSWR<ReviewsResponse>(url, fetcher);
  return { data, error, isLoading };
}
