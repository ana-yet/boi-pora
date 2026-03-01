"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminReviews } from "@/lib/hooks/useAdminReviews";
import { Button } from "@/app/components/ui/Button";

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useAdminReviews(page, 20);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-red-600">
        Failed to load reviews.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-6">
        Reviews
      </h2>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No reviews yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">User</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Book</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Rating</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Content</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r: { _id: string; userId?: { email?: string; name?: string }; bookId?: { title?: string; slug?: string }; rating?: number; content?: string }) => (
                    <tr key={r._id} className="border-b border-neutral-100 dark:border-neutral-700/50">
                      <td className="p-4 text-neutral-700 dark:text-neutral-300">
                        {r.userId?.name || r.userId?.email || "—"}
                      </td>
                      <td className="p-4">
                        <Link href={r.bookId?.slug ? `/${r.bookId.slug}` : "#"} className="text-primary hover:underline">
                          {r.bookId?.title || "—"}
                        </Link>
                      </td>
                      <td className="p-4">{r.rating ?? "—"} ★</td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                        {r.content || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-neutral-600">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
