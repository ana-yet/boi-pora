"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { api } from "@/lib/api";
import { Toast } from "@/app/components/ui/Toast";

interface BookActionsProps {
  bookId: string;
  startReadingHref: string;
}

export function BookActions({ bookId, startReadingHref }: BookActionsProps) {
  const { isAuthenticated } = useAuth();
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api
      .get<{ inLibrary: boolean }>(`/api/v1/library/status/${bookId}`)
      .then((res) => {
        if (!cancelled) setInLibrary(res.inLibrary);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bookId, isAuthenticated]);

  async function toggleLibrary() {
    if (libraryLoading) return;
    setLibraryLoading(true);
    try {
      if (inLibrary) {
        await api.delete(`/api/v1/library/${bookId}`);
        setInLibrary(false);
        setToast({ message: "Removed from library", variant: "success" });
      } else {
        await api.post(`/api/v1/library/${bookId}`);
        setInLibrary(true);
        setToast({ message: "Added to library", variant: "success" });
      }
    } catch {
      setToast({ message: "Failed to update library", variant: "error" });
    }
    setLibraryLoading(false);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {startReadingHref !== "#" ? (
        <Link
          href={startReadingHref}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold shadow-lg shadow-primary/30 transition-all"
        >
          <span className="material-icons">play_arrow</span>
          Start Reading
        </Link>
      ) : (
        <span className="flex items-center justify-center gap-3 px-8 py-4 bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 rounded-lg font-semibold cursor-not-allowed">
          <span className="material-icons">hourglass_empty</span>
          Coming Soon
        </span>
      )}
      {isAuthenticated ? (
        <button
          onClick={toggleLibrary}
          disabled={libraryLoading}
          className={`flex items-center justify-center gap-3 px-8 py-4 border-2 rounded-lg font-semibold transition-all ${
            inLibrary
              ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              : "border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-primary/5 text-neutral-700 dark:text-neutral-200 hover:text-primary"
          }`}
        >
          <span className="material-icons">{inLibrary ? "bookmark" : "bookmark_add"}</span>
          {libraryLoading ? "Updating..." : inLibrary ? "In Library" : "Add to Library"}
        </button>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-primary/5 text-neutral-700 dark:text-neutral-200 hover:text-primary rounded-lg font-semibold transition-all"
        >
          <span className="material-icons">bookmark_add</span>
          Add to Library
        </Link>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          open={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
