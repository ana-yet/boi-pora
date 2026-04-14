"use client";

import { Suspense } from "react";
import { useAdminLibrary } from "@/lib/hooks/useAdminLibrary";
import { api } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Toast } from "@/app/components/ui/Toast";
import {
  AdminSearch, Pagination, useUrlParams, useToast,
} from "../_components";

function LibraryPageInner() {
  const { get, getNum, set } = useUrlParams();
  const page = getNum("page", 1);
  const search = get("search");
  const status = get("status");

  const { data, error, isLoading, mutate } = useAdminLibrary(page, 20, search || undefined, status || undefined);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));
  const { toast, show, close } = useToast();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/v1/admin/library/${id}/status?status=${newStatus}`, {});
      mutate();
      show(`Status updated to ${newStatus}`, "success");
    } catch {
      show("Failed to update status", "error");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/api/v1/admin/library/${id}`);
      mutate();
      show("Library item removed", "success");
    } catch {
      show("Failed to remove item", "error");
    }
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-red-600 dark:text-red-400">
        Failed to load library.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Library (All Users)</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <AdminSearch value={search} onChange={(v) => set({ search: v || null, page: 1 })} placeholder="Search by user or book..." />
        </div>
        <select
          value={status}
          onChange={(e) => set({ status: e.target.value || null, page: 1 })}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
        >
          <option value="">All Status</option>
          <option value="saved">Saved</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
        </select>
        {(search || status) && (
          <Button variant="ghost" size="sm" onClick={() => set({ search: null, status: null, page: 1 })}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <span className="inline-block h-6 w-6 border-2 border-primary border-r-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-icons text-4xl text-neutral-300 dark:text-neutral-600 mb-3 block">bookmark</span>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">No library items found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">User</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Book</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden sm:table-cell">Added</th>
                    <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                      <td className="p-4 text-neutral-700 dark:text-neutral-300">
                        {item.userId?.name || item.userId?.email || "—"}
                      </td>
                      <td className="p-4 font-medium text-neutral-800 dark:text-white max-w-[200px] truncate">
                        {item.bookId?.title || "—"}
                      </td>
                      <td className="p-4">
                        <select
                          value={item.status ?? "saved"}
                          onChange={(e) => handleStatusChange(item._id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-primary/30 ${
                            item.status === "reading"
                              ? "bg-primary/10 text-primary"
                              : item.status === "finished"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          <option value="saved">saved</option>
                          <option value="reading">reading</option>
                          <option value="finished">finished</option>
                        </select>
                      </td>
                      <td className="p-4 text-neutral-500 text-xs hidden sm:table-cell">
                        {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove"
                        >
                          <span className="material-icons text-lg">delete</span>
                        </button>
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

      <Toast message={toast.message} variant={toast.variant} open={toast.open} onClose={close} />
    </div>
  );
}

export default function AdminLibraryPage() {
  return <Suspense><LibraryPageInner /></Suspense>;
}
