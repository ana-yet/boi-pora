"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { api, getAccessToken } from "@/lib/api";
import { getApiUrl } from "@/lib/env";

type Props = {
  bookId: string;
  chapterMongoId: string;
  positionOneBased: number;
  totalChapters: number;
};

interface ProgressItem {
  bookId: { _id: string } | string;
  chapterId?: { _id: string } | string;
  scrollPercent?: number;
}

function idOf(ref: { _id: string } | string | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref._id;
}

/** Current scroll position as a percentage of the scrollable document. */
function currentScrollPercent(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
}

const SCROLL_SYNC_MS = 5000;
const PENDING_KEY = "bp-pending-progress";

type ProgressPayload = {
  bookId: string;
  chapterId: string;
  percentComplete: number;
  scrollPercent: number;
};

/** Persist the latest unsent progress so it survives offline navigation. */
function queuePending(payload: ProgressPayload) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {}
}

function flushPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const payload = JSON.parse(raw) as ProgressPayload;
    localStorage.removeItem(PENDING_KEY);
    api.post("/api/v1/reading/progress", payload).catch(() => {
      queuePending(payload);
    });
  } catch {}
}

/**
 * Syncs chapter position + in-chapter scroll percentage, and offers a
 * "Continue where you left off" chip when returning to a chapter.
 */
export function ReaderProgressSync({
  bookId,
  chapterMongoId,
  positionOneBased,
  totalChapters,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const lastSentScrollRef = useRef<number>(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const percentage =
    totalChapters > 0
      ? Math.round((positionOneBased / totalChapters) * 100)
      : 0;

  const sync = useCallback(
    (scrollPercent: number) => {
      if (!isAuthenticated || totalChapters < 1 || !chapterMongoId || !bookId)
        return;
      if (scrollPercent === lastSentScrollRef.current) return;
      lastSentScrollRef.current = scrollPercent;
      const payload: ProgressPayload = {
        bookId,
        chapterId: chapterMongoId,
        percentComplete: percentage,
        scrollPercent,
      };
      if (!navigator.onLine) {
        queuePending(payload);
        return;
      }
      api.post("/api/v1/reading/progress", payload).catch(() => {
        queuePending(payload);
      });
    },
    [isAuthenticated, bookId, chapterMongoId, percentage, totalChapters]
  );

  // Offer to restore the last scroll position once per chapter visit.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api
      .get<ProgressItem[]>("/api/v1/reading/progress?limit=100")
      .then((items) => {
        if (cancelled) return;
        const match = items.find(
          (p) =>
            idOf(p.bookId) === bookId && idOf(p.chapterId) === chapterMongoId
        );
        const saved = match?.scrollPercent;
        if (saved != null && saved > 5 && saved < 95) {
          setResumeAt(saved);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, bookId, chapterMongoId]);

  // Periodic scroll sync + flush on pagehide (keepalive survives navigation).
  useEffect(() => {
    if (!isAuthenticated) return;

    // Progress recorded while offline syncs once connectivity returns.
    flushPending();
    window.addEventListener("online", flushPending);

    intervalRef.current = setInterval(() => {
      sync(currentScrollPercent());
    }, SCROLL_SYNC_MS);

    const flush = () => {
      const scrollPercent = currentScrollPercent();
      if (scrollPercent === lastSentScrollRef.current) return;
      lastSentScrollRef.current = scrollPercent;
      if (!navigator.onLine) {
        queuePending({
          bookId,
          chapterId: chapterMongoId,
          percentComplete: percentage,
          scrollPercent,
        });
        return;
      }
      const token = getAccessToken();
      void fetch(`${getApiUrl()}/api/v1/reading/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        keepalive: true,
        body: JSON.stringify({
          bookId,
          chapterId: chapterMongoId,
          percentComplete: percentage,
          scrollPercent,
        }),
      }).catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("online", flushPending);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isAuthenticated, sync, bookId, chapterMongoId, percentage]);

  function restore() {
    if (resumeAt == null) return;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: (resumeAt / 100) * scrollable,
      behavior: "smooth",
    });
    setResumeAt(null);
  }

  if (resumeAt == null) return null;

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-1 bg-neutral-900/90 dark:bg-white/90 text-white dark:text-neutral-900 rounded-full shadow-xl backdrop-blur px-2 py-1.5 text-sm">
        <button
          onClick={restore}
          className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
        >
          <span className="material-icons text-base" aria-hidden="true">
            history
          </span>
          Continue where you left off ({resumeAt}%)
        </button>
        <button
          onClick={() => setResumeAt(null)}
          aria-label="Dismiss"
          className="p-1.5 rounded-full hover:opacity-70 transition-opacity"
        >
          <span className="material-icons text-base" aria-hidden="true">
            close
          </span>
        </button>
      </div>
    </div>
  );
}
