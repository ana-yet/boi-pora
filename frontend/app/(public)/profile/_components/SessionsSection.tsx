"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/app/components/ui/Button";
import { timeAgo } from "@/lib/format";

interface SessionRow {
  id: string;
  userAgent?: string;
  ip?: string;
  lastUsedAt: string;
  createdAt?: string;
  current: boolean;
}

function deviceLabel(userAgent?: string): string {
  if (!userAgent) return "Unknown device";
  if (/mobile|android|iphone/i.test(userAgent)) {
    if (/android/i.test(userAgent)) return "Android device";
    if (/iphone|ipad/i.test(userAgent)) return "iPhone / iPad";
    return "Mobile device";
  }
  if (/windows/i.test(userAgent)) return "Windows computer";
  if (/macintosh|mac os/i.test(userAgent)) return "Mac";
  if (/linux/i.test(userAgent)) return "Linux computer";
  return "Browser";
}

function browserLabel(userAgent?: string): string | null {
  if (!userAgent) return null;
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
  if (/firefox/i.test(userAgent)) return "Firefox";
  return null;
}

const fetcher = (url: string) => api.get<SessionRow[]>(url);

export function SessionsSection() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    data: sessions,
    error,
    mutate,
  } = useSWR<SessionRow[]>("/api/v1/auth/sessions", fetcher);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function revoke(id: string) {
    setBusyId(id);
    try {
      await api.delete(`/api/v1/auth/sessions/${id}`);
    } catch {
      // Session may already be gone — the revalidation below resyncs.
    } finally {
      await mutate();
      setBusyId(null);
    }
  }

  async function logoutEverywhere() {
    setBusyId("all");
    try {
      await api.post("/api/v1/auth/logout-all");
    } finally {
      await logout();
      router.push("/login");
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Active Sessions
        </h3>
        <Button
          variant="outline"
          onClick={logoutEverywhere}
          isLoading={busyId === "all"}
        >
          Log out everywhere
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4">Failed to load sessions</p>
      )}
      {!sessions && !error && (
        <p className="text-sm text-neutral-500">Loading sessions...</p>
      )}
      {sessions && sessions.length === 0 && (
        <p className="text-sm text-neutral-500">No active sessions.</p>
      )}

      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {sessions?.map((s) => {
          const browser = browserLabel(s.userAgent);
          return (
            <li key={s.id} className="py-4 flex items-center gap-4">
              <span className="material-icons text-neutral-400">
                {/mobile|android|iphone/i.test(s.userAgent ?? "")
                  ? "smartphone"
                  : "computer"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-white truncate">
                  {deviceLabel(s.userAgent)}
                  {browser ? ` — ${browser}` : ""}
                  {s.current && (
                    <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-primary/10 text-primary">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {s.ip ? `${s.ip} · ` : ""}
                  Active {timeAgo(s.lastUsedAt)}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => revoke(s.id)}
                  disabled={busyId === s.id}
                  className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  {busyId === s.id ? "Revoking..." : "Revoke"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
