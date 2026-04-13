"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useReviews } from "@/lib/hooks/useReviews";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Toast } from "@/app/components/ui/Toast";

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          aria-pressed={i <= value}
        >
          <span
            className={`material-icons text-2xl ${i <= (hover || value) ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-600"}`}
          >
            {i <= (hover || value) ? "star" : "star_border"}
          </span>
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ bookId }: { bookId: string }) {
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, mutate } = useReviews(bookId);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const reviews = data?.items ?? [];
  const userReview = reviews.find((r) => r.userId?._id === user?.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await api.post("/api/v1/reviews", {
        bookId,
        rating,
        content: content.trim() || undefined,
      });
      setRating(0);
      setContent("");
      mutate();
      setToast({ message: "Review submitted!", variant: "success" });
    } catch (err) {
      setToast({
        message:
          err instanceof ApiError ? err.message : "Failed to submit review",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    try {
      await api.delete(`/api/v1/reviews/${reviewId}`);
      mutate();
      setToast({ message: "Review deleted", variant: "success" });
    } catch {
      setToast({ message: "Failed to delete review", variant: "error" });
    }
  }

  return (
    <section className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
        Reviews {data?.total ? `(${data.total})` : ""}
      </h2>

      {isAuthenticated && !userReview && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark p-6"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Write a Review
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Review (optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Share your thoughts about this book..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <Button type="submit" isLoading={submitting} disabled={rating === 0}>
            Submit Review
          </Button>
        </form>
      )}

      {!isAuthenticated && (
        <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 py-8">
          No reviews yet. Be the first to review this book!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                    {(review.userId?.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {review.userId?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={review.rating} readonly />
                  {review.userId?._id === user?.id && (
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-500 hover:text-red-600 ml-2"
                      title="Delete review"
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  )}
                </div>
              </div>
              {review.content && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {review.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          open={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
}
