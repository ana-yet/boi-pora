"use client";

import useSWR from "swr";
import { api } from "../api";

interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
  createdAt?: string;
}

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<UsersResponse>(url);

export function useAdminUsers(page = 1, limit = 20, search?: string, role?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (role) params.set("role", role);

  const url = `/api/v1/admin/users?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { data, error, isLoading, mutate };
}
