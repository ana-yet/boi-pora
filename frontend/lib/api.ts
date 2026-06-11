/**
 * Centralized API client for backend requests.
 * - Access token lives in memory only (module variable) — never persisted.
 * - The refresh token is an HttpOnly cookie owned by the backend; on 401 we
 *   do a single-flight POST /auth/refresh and replay the request once.
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

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | FormData | null;
};

async function request<T>(
  path: string,
  options: ApiRequestInit = {},
  isRetry = false
): Promise<T> {
  const base = getApiUrl();
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const body =
    options.body instanceof FormData
      ? options.body
      : options.body &&
          typeof options.body === "object" &&
          !Array.isArray(options.body)
        ? JSON.stringify(options.body)
        : undefined;

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  let parsed: unknown;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }
  } else {
    parsed = await res.text();
  }

  if (!res.ok) {
    if (
      res.status === 401 &&
      !isRetry &&
      !path.includes("/auth/refresh") &&
      !path.includes("/auth/login") &&
      !path.includes("/auth/logout")
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }

    const message =
      typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : typeof parsed === "string"
          ? parsed
          : `Request failed: ${res.status}`;

    throw new ApiError(message, res.status, parsed);
  }

  return parsed as T;
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Exchange the HttpOnly refresh cookie for a new access token.
 * Single-flight: concurrent 401s share one refresh call.
 */
export async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setAccessToken(null);
        return false;
      }
      const data = (await res.json()) as { accessToken?: string };
      if (!data.accessToken) {
        setAccessToken(null);
        return false;
      }
      setAccessToken(data.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      return false;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

export const api = {
  get: <T>(path: string, init?: Omit<RequestInit, "method" | "body">) =>
    request<T>(path, { ...init, method: "GET" }),

  post: <T>(path: string, body?: Record<string, unknown>, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", body }),

  put: <T>(path: string, body?: Record<string, unknown>, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PUT", body }),

  patch: <T>(
    path: string,
    body?: Record<string, unknown>,
    init?: RequestInit
  ) => request<T>(path, { ...init, method: "PATCH", body }),

  delete: <T>(path: string, init?: Omit<RequestInit, "method" | "body">) =>
    request<T>(path, { ...init, method: "DELETE" }),
};
