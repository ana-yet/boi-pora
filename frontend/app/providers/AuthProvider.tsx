"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, setToken, ApiError } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    const t = typeof window !== "undefined" ? localStorage.getItem("boi_pora_token") : null;
    if (!t) {
      setUser(null);
      setTokenState(null);
      return;
    }
    try {
      const me = await api.get<{ _id: string; email: string; name: string; role: string }>("/api/v1/auth/me");
      setUser({
        id: me._id,
        email: me.email,
        name: me.name,
        role: me.role,
      });
      setTokenState(t);
    } catch {
      setToken(null);
      setUser(null);
      setTokenState(null);
    }
  }, []);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("boi_pora_token") : null;
    if (!t) {
      setIsLoading(false);
      return;
    }
    setTokenState(t);
    refetchUser().finally(() => setIsLoading(false));
  }, [refetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ accessToken: string; user: User }>("/api/v1/auth/login", {
        email,
        password,
      });
      setToken(res.accessToken);
      setTokenState(res.accessToken);
      setUser(res.user);
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<{ accessToken: string; user: User }>("/api/v1/auth/register", {
        name,
        email,
        password,
      });
      setToken(res.accessToken);
      setTokenState(res.accessToken);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
