"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useBooks } from "@/lib/hooks/useBooks";
import { api } from "@/lib/api";
import type { ApiBook } from "@/lib/types";
import { getLanguageLabel } from "@/lib/constants";
import { Button } from "@/app/components/ui/Button";
import { Toast } from "@/app/components/ui/Toast";
import {
  AdminSearch, StatusBadge, BulkActionBar, Pagination,
  ConfirmModal, useUrlParams, useToast,
} from "../_components";

function BooksPageInner() {
  const { get, getNum, set } = useUrlParams();
  const page = getNum("page", 1);
  const search = get("search");
  const sort = get("sort", "title");
  const status = get("status");

  const { data, error, isLoading, mutate } = useBooks(page, 20, undefined, status || undefined, sort, search || undefined);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, show, close } = useToast();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected((prev) => prev.size === items.length ? new Set() : new Set(items.map((b: ApiBook) => b._id)));
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/v1/books/${id}/status`, { status: newStatus });
      mutate();
      show(`Status changed to ${newStatus}`, "success");
    } catch {
      show("Failed to update status", "error");
    }
  };

  const executeBulk = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res = await api.post<{ affected: number }>("/api/v1/books/bulk", {
        action: confirm.action,
        ids: confirm.ids,
      });
      show(`${res.affected} book(s) updated`, "success");
      setSelected(new Set());
      mutate();
    } catch {
      show("Bulk action failed", "error");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-red-600 dark:text-red-400">
        Failed to load books.
      </div>
    );
  }

  const selectedArr = [...selected];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Books</h2>
        <Link href="/admin/books/new">
          <Button>
            <span className="material-icons text-lg mr-1">add</span>
            Add Book
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <AdminSearch
            value={search}
            onChange={(v) => set({ search: v || null, page: 1 })}
            placeholder="Search by title or author..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => set({ status: e.target.value || null, page: 1 })}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={sort}
          onChange={(e) => set({ sort: e.target.value, page: 1 })}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
        >
          <option value="title">Sort by Title</option>
          <option value="createdAt">Sort by Newest</option>
          <option value="rating">Sort by Rating</option>
        </select>
        {(search || status) && (
          <Button variant="ghost" size="sm" onClick={() => set({ search: null, status: null, page: 1 })}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
            <span className="inline-block h-6 w-6 border-2 border-primary border-r-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-icons text-4xl text-neutral-300 dark:text-neutral-600 mb-3 block">menu_book</span>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">No books found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === items.length && items.length > 0}
                        onChange={toggleAll}
                        className="rounded border-neutral-300 accent-primary"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Title</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Author</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden sm:table-cell">Category</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden md:table-cell">Language</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                    <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((book: ApiBook) => (
                    <tr
                      key={book._id}
                      className={`border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors ${
                        selected.has(book._id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selected.has(book._id)}
                          onChange={() => toggleSelect(book._id)}
                          className="rounded border-neutral-300 accent-primary"
                        />
                      </td>
                      <td className="p-4 font-medium text-neutral-800 dark:text-white max-w-[200px] truncate">
                        {book.title}
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300">{book.author}</td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300 hidden sm:table-cell">{book.category ?? "—"}</td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                          {getLanguageLabel(book.language ?? "en")}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={book.status ?? "draft"}
                          onChange={(e) => handleStatusChange(book._id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-primary/30 ${
                            book.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : book.status === "archived"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                          }`}
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                          <option value="archived">archived</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/books/${book._id}`} className="text-primary hover:underline text-sm">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => set({ page: p })} />
          </>
        )}
      </div>

      <BulkActionBar
        count={selected.size}
        onClearSelection={() => setSelected(new Set())}
        actions={[
          { label: "Publish", icon: "check_circle", variant: "primary", onClick: () => setConfirm({ action: "publish", ids: selectedArr }) },
          { label: "Archive", icon: "archive", variant: "outline", onClick: () => setConfirm({ action: "archive", ids: selectedArr }) },
          { label: "Delete", icon: "delete", variant: "danger", onClick: () => setConfirm({ action: "delete", ids: selectedArr }) },
        ]}
      />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={executeBulk}
        isLoading={actionLoading}
        title={`${confirm?.action === "delete" ? "Delete" : confirm?.action === "publish" ? "Publish" : "Archive"} ${confirm?.ids.length ?? 0} book(s)?`}
        message={confirm?.action === "delete"
          ? `This will permanently delete ${confirm?.ids.length} book(s). This cannot be undone.`
          : `This will ${confirm?.action} ${confirm?.ids.length} book(s).`
        }
        confirmLabel={confirm?.action === "delete" ? "Delete" : confirm?.action === "publish" ? "Publish" : "Archive"}
        variant={confirm?.action === "delete" ? "danger" : "primary"}
      />

      <Toast message={toast.message} variant={toast.variant} open={toast.open} onClose={close} />
    </div>
  );
}

export default function AdminBooksPage() {
  return (
    <Suspense>
      <BooksPageInner />
    </Suspense>
  );
}
