"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  api,
  setAccessToken,
  refreshAccessToken,
  ApiError,
} from "@/lib/api";
import type { User } from "@/lib/types";

export type { User };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Non-HttpOnly presence hint on the FRONTEND domain, read by middleware.ts
 * for fast redirects. Carries no credential — the real refresh token is an
 * HttpOnly cookie scoped to the API; the API enforces all authorization.
 */
function setAuthHint(on: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = on
    ? `boi_pora_auth=1; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
    : "boi_pora_auth=; path=/; max-age=0";
}

interface MeResponse {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      const me = await api.get<MeResponse>("/api/v1/auth/me");
      setUser({
        id: me.id,
        email: me.email,
        name: me.name ?? "",
        role: me.role,
        avatarUrl: me.avatarUrl,
        createdAt: me.createdAt,
      });
    } catch {
      setUser(null);
    }
  }, []);

  // Bootstrap: one silent refresh — the HttpOnly cookie may carry a live
  // session from a previous visit. Only then fetch the profile.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await refreshAccessToken();
      if (cancelled) return;
      if (ok) {
        await refetchUser();
      } else {
        setAuthHint(false);
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; user: User }>(
      "/api/v1/auth/login",
      { email, password }
    );
    setAccessToken(res.accessToken);
    setUser(res.user);
    setAuthHint(true);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<{ accessToken: string; user: User }>(
        "/api/v1/auth/register",
        { name, email, password }
      );
      setAccessToken(res.accessToken);
      setUser(res.user);
      setAuthHint(true);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch {
      // Session may already be gone — local state is cleared regardless.
    }
    setAccessToken(null);
    setUser(null);
    setAuthHint(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export { ApiError };
