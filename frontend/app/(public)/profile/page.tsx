"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useLibrary } from "@/lib/hooks/useLibrary";
import { useReadingProgress } from "@/lib/hooks/useReadingProgress";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Toast } from "@/app/components/ui/Toast";

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated, refetchUser } = useAuth();
  const router = useRouter();
  const { data: libraryData } = useLibrary();
  const { data: progressData } = useReadingProgress();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const libraryCount = libraryData?.total ?? 0;
  const booksInProgress = progressData.length;
  const completedBooks = progressData.filter((p) => (p.percentComplete ?? 0) >= 100).length;

  async function handleSave() {
    setSaving(true);
    try {
      await api.put("/api/v1/auth/me", { name, avatarUrl: avatarUrl || undefined });
      await refetchUser();
      setEditing(false);
      setToast({ message: "Profile updated", variant: "success" });
    } catch (err) {
      setToast({ message: err instanceof ApiError ? err.message : "Failed to update", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark p-8">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-4">
                  <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." type="url" />
                  <div className="flex gap-3">
                    <Button onClick={handleSave} isLoading={saving}>Save</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-neutral-800 dark:text-white">{user.name || "No name set"}</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">{user.email}</p>
                  <p className="text-xs text-neutral-400 mt-1 capitalize">{user.role}</p>
                  <button onClick={() => setEditing(true)} className="mt-4 text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    <span className="material-icons text-base">edit</span> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">Reading Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">Books in Library</span>
                <span className="text-lg font-bold text-primary">{libraryCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">In Progress</span>
                <span className="text-lg font-bold text-primary">{booksInProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600 dark:text-neutral-400 text-sm">Completed</span>
                <span className="text-lg font-bold text-primary">{completedBooks}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/library" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary py-1.5">
                <span className="material-icons text-lg">bookmark</span> My Library
              </Link>
              <Link href="/explore" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary py-1.5">
                <span className="material-icons text-lg">explore</span> Explore Books
              </Link>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} open={!!toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
