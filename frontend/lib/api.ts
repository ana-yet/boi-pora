/**
 * Centralized API client for backend requests.
 * - Base URL from env
 * - Auth token injection
 * - Consistent error handling
 */

import { getApiUrl } from "./env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("boi_pora_token");
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("boi_pora_token", token);
  else localStorage.removeItem("boi_pora_token");
}

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | FormData | null;
};

async function request<T>(
  path: string,
  options: ApiRequestInit = {}
): Promise<T> {
  const base = getApiUrl();
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;

  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body =
    options.body instanceof FormData
      ? options.body
      : options.body && typeof options.body === "object" && !Array.isArray(options.body)
        ? JSON.stringify(options.body)
        : undefined;

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  let parsed: unknown;
  const ct = res.headers.get("content-type");
  if (ct?.includes("application/json")) {
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
  } else {
    parsed = await res.text();
  }

  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : typeof parsed === "string"
          ? parsed
          : `Request failed: ${res.status}`;
    throw new ApiError(msg, res.status, parsed);
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, init?: Omit<RequestInit, "method" | "body">) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: Record<string, unknown>, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", body }),

  put: <T>(path: string, body?: Record<string, unknown>, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PUT", body }),

  delete: <T>(path: string, init?: Omit<RequestInit, "method" | "body">) =>
    request<T>(path, { ...init, method: "DELETE" }),
};
