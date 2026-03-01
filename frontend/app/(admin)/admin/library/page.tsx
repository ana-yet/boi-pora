"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminLibrary } from "@/lib/hooks/useAdminLibrary";
import { Button } from "@/app/components/ui/Button";

export default function AdminLibraryPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useAdminLibrary(page, 20);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-red-600">
        Failed to load library.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-6">
        Library (All Users)
      </h2>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No library items.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">User</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Book</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: { _id: string; userId?: { email?: string; name?: string }; bookId?: { title?: string; slug?: string; _id?: string }; status?: string; addedAt?: string }) => (
                    <tr key={item._id} className="border-b border-neutral-100 dark:border-neutral-700/50">
                      <td className="p-4 text-neutral-700 dark:text-neutral-300">
                        {item.userId?.name || item.userId?.email || "—"}
                      </td>
                      <td className="p-4">
                        <Link
                          href={item.bookId?.slug ? `/${item.bookId.slug}` : "#"}
                          className="text-primary hover:underline"
                        >
                          {item.bookId?.title || "—"}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs bg-neutral-100 dark:bg-neutral-700">
                          {item.status ?? "saved"}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-500 text-xs">
                        {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : "—"}
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
