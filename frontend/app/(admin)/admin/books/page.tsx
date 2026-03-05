"use client";

import { useState } from "react";
import Link from "next/link";
import { useBooks } from "@/lib/hooks/useBooks";
import type { ApiBook } from "@/lib/types";
import { getLanguageLabel } from "@/lib/constants";
import { Button } from "@/app/components/ui/Button";

export default function AdminBooksPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<string>("title");
  const { data, error, isLoading } = useBooks(page, 20, undefined, undefined, sort);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-red-600 dark:text-red-400">
        Failed to load books.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
          Books
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
          >
            <option value="title">Sort by Title</option>
            <option value="createdAt">Sort by Newest</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <Link href="/admin/books/new">
            <Button>
              <span className="material-icons text-lg mr-1">add</span>
              Add Book
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            No books yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">
                      Title
                    </th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">
                      Author
                    </th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden md:table-cell">
                      Language
                    </th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((book: ApiBook) => (
                    <tr
                      key={book._id}
                      className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                    >
                      <td className="p-4 font-medium text-neutral-800 dark:text-white">
                        {book.title}
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300">
                        {book.author}
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300 hidden sm:table-cell">
                        {book.category ?? "—"}
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                          {getLanguageLabel(book.language ?? "en")}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            book.status === "published"
                              ? "bg-primary/10 text-primary"
                              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {book.status ?? "draft"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/books/${book._id}`}
                          className="text-primary hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
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
