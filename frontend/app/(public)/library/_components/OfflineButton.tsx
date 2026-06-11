"use client";

import { useEffect, useState } from "react";
import {
  downloadBookOffline,
  isBookOffline,
  removeBookOffline,
} from "@/lib/offline-books";
import { useToast } from "@/app/providers/ToastProvider";

type Status = "unknown" | "none" | "downloading" | "stored";

/** Download / remove a book's chapters for offline reading. */
export function OfflineButton({
  bookId,
  title,
  className = "",
}: {
  bookId?: string;
  title: string;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("unknown");
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (!bookId || !("caches" in window)) return;
    let cancelled = false;
    isBookOffline(bookId).then((stored) => {
      if (!cancelled) setStatus(stored ? "stored" : "none");
    });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  if (!bookId || status === "unknown") return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!bookId) return;

    if (status === "stored") {
      await removeBookOffline(bookId);
      setStatus("none");
      showToast(`Removed “${title}” from offline storage`);
      return;
    }
    if (status === "downloading") return;

    setStatus("downloading");
    setProgress(0);
    try {
      await downloadBookOffline(bookId, (done, total) =>
        setProgress(total > 0 ? Math.round((done / total) * 100) : 0)
      );
      setStatus("stored");
      showToast(`“${title}” is available offline`, "success");
    } catch {
      setStatus("none");
      showToast("Download failed — check your connection", "error");
    }
  }

  const icon =
    status === "stored"
      ? "offline_pin"
      : status === "downloading"
        ? "downloading"
        : "download_for_offline";

  const label =
    status === "stored"
      ? "Remove offline copy"
      : status === "downloading"
        ? `Downloading ${progress}%`
        : "Make available offline";

  return (
    <button
      onClick={toggle}
      disabled={status === "downloading"}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center transition-colors ${
        status === "stored"
          ? "text-primary"
          : "text-neutral-400 hover:text-primary"
      } ${className}`}
    >
      <span
        className={`material-icons text-lg ${status === "downloading" ? "animate-pulse" : ""}`}
      >
        {icon}
      </span>
    </button>
  );
}
