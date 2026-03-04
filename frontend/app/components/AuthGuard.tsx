"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

interface AuthGuardProps {
  children: ReactNode;
  /** If set, the user must have this role (e.g. "admin") */
  requiredRole?: string;
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const target = redirectTo ?? "/login";

  useEffect(() => {
    if (isLoading) return;
    if (!user || (requiredRole && user.role !== requiredRole)) {
      const current = typeof window !== "undefined" ? window.location.pathname : "/";
      router.replace(`${target}?redirect=${encodeURIComponent(current)}`);
    }
  }, [user, isLoading, router, requiredRole, target]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
