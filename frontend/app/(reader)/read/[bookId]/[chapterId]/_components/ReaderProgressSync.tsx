"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { api } from "@/lib/api";

type Props = {
  bookId: string;
  chapterMongoId: string;
  positionOneBased: number;
  totalChapters: number;
};

export function ReaderProgressSync({
  bookId,
  chapterMongoId,
  positionOneBased,
  totalChapters,
}: Props) {
  const { isAuthenticated } = useAuth();
  const lastSyncedRef = useRef<{ percentage: number; timestamp: number } | null>(null);
 const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncProgress = useCallback(() => {
    if (!isAuthenticated || totalChapters < 1 || !chapterMongoId || !bookId) {
      return;
    }

    const percentage = Math.round((positionOneBased / totalChapters) * 100);
    
    // Skip if same percentage
    if (lastSyncedRef.current?.percentage === percentage) {
      return;
    }

    // Skip if synced same percentage in last 10 seconds
    const now = Date.now();
    if (
      lastSyncedRef.current &&
      lastSyncedRef.current.percentage === percentage &&
      now - lastSyncedRef.current.timestamp < 10000
    ) {
      return;
    }

    lastSyncedRef.current = { percentage, timestamp: now };

    api
      .post("/api/v1/reading/progress", {
        bookId,
        chapterId: chapterMongoId,
        percentComplete: percentage,
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to sync reading progress:", error);
        }
      });
  }, [isAuthenticated, bookId, chapterMongoId, positionOneBased, totalChapters]);

  useEffect(() => {
    // Debounce the sync
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(syncProgress, 1500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [syncProgress]);

  // Sync when page becomes hidden (user navigates away)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Immediate sync when user leaves the page
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        syncProgress();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncProgress]);

  return null;
}