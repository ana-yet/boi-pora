"use client";

import useSWR from "swr";
import { api } from "../api";

interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
}

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

const fetcher = (url: string) => api.get<UsersResponse>(url);

export function useAdminUsers(page = 1, limit = 20) {
  const url = `/api/v1/admin/users?page=${page}&limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(url, fetcher);
  return { data, error, isLoading, mutate };
}
