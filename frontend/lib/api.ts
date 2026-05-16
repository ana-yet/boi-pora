/**
 * Centralized API client for backend requests.
 * - Main API URL for auth/admin/update
 * - Separate Books API URL for public books GET
 * - Auth token injection
 * - Refresh token support
 * - Consistent error handling
 */

import { getApiUrl, getBooksApiUrl } from "./env";

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

  if (token) {
    localStorage.setItem("boi_pora_token", token);
    document.cookie = `boi_pora_token=${token}; path=/; max-age=${
      60 * 60 * 24 * 7
    }; SameSite=Lax`;
  } else {
    localStorage.removeItem("boi_pora_token");
    document.cookie = "boi_pora_token=; path=/; max-age=0";
  }
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem("boi_pora_refresh_token", token);
  } else {
    localStorage.removeItem("boi_pora_refresh_token");
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("boi_pora_refresh_token");
}

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | FormData | null;
  baseUrl?: string;
};

async function request<T>(
  path: string,
  options: ApiRequestInit = {}
): Promise<T> {
  const base = options.baseUrl || getApiUrl();
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;

  const headers: HeadersInit = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] =
      headers["Content-Type"] ?? "application/json";
  }

  /**
   * Only attach token for main API
   * Skip token for books API if it's public/cache optimized
   */
  const token = getToken();
  const isBooksApi = base === getBooksApiUrl();

  if (token && !isBooksApi) {
    headers["Authorization"] = `Bearer ${token}`;
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
    /** Public books API (Hono) does not use cookies; include breaks CORS without Allow-Credentials. */
    credentials: isBooksApi ? "omit" : "include",
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
    /**
     * Auto refresh token only for main API
     */
    if (
      !isBooksApi &&
      res.status === 401 &&
      !path.includes("/auth/refresh") &&
      !path.includes("/auth/login")
    ) {
      const refreshed = await tryRefreshToken();

      if (refreshed) {
        return request<T>(path, options);
      }
    }

    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : typeof parsed === "string"
          ? parsed
          : `Request failed: ${res.status}`;

    throw new ApiError(message, res.status, parsed);
  }

  return parsed as T;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) return false;

    try {
      const base = getApiUrl();

      const res = await fetch(`${base}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!res.ok) {
        setToken(null);
        setRefreshToken(null);
        return false;
      }

      const data = await res.json();

      setToken(data.accessToken);

      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      return true;
    } catch {
      setToken(null);
      setRefreshToken(null);
      return false;
    }
  })();

  const result = await refreshPromise;
  refreshPromise = null;

  return result;
}

export const api = {
  /**
   * MAIN API
   */
  get: <T>(
    path: string,
    init?: Omit<RequestInit, "method" | "body">
  ) =>
    request<T>(path, {
      ...init,
      method: "GET",
    }),

  post: <T>(
    path: string,
    body?: Record<string, unknown>,
    init?: RequestInit
  ) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body,
    }),

  put: <T>(
    path: string,
    body?: Record<string, unknown>,
    init?: RequestInit
  ) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body,
    }),

  patch: <T>(
    path: string,
    body?: Record<string, unknown>,
    init?: RequestInit
  ) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body,
    }),

  delete: <T>(
    path: string,
    init?: Omit<RequestInit, "method" | "body">
  ) =>
    request<T>(path, {
      ...init,
      method: "DELETE",
    }),

  /**
   * BOOKS READ-ONLY API
   */
  booksGet: <T>(
    path: string,
    init?: Omit<RequestInit, "method" | "body">
  ) =>
    request<T>(path, {
      ...init,
      method: "GET",
      baseUrl: getBooksApiUrl(),
    }),
};