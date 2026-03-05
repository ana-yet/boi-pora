"use client";

import useSWR from "swr";
import { api } from "../api";
import type { LibraryResponse } from "../types";
export type { LibraryBookRef, LibraryItem, LibraryResponse } from "../types";

const fetcher = (url: string) => api.get<LibraryResponse>(url);

export function useLibrary(page = 1, limit = 50) {
  const url = `/api/v1/library?page=${page}&limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR<LibraryResponse>(
    url,
    fetcher
  );
  return { data, error, isLoading, mutate };
}
