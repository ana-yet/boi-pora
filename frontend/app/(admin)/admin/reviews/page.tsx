"use client";

import { useState, Suspense } from "react";
import { useAdminReviews } from "@/lib/hooks/useAdminReviews";
import { api } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Toast } from "@/app/components/ui/Toast";
import {
  AdminSearch, BulkActionBar, Pagination, ConfirmModal, useUrlParams, useToast,
} from "../_components";

const RATING_STARS = [1, 2, 3, 4, 5];

function ReviewsPageInner() {
  const { get, getNum, set } = useUrlParams();
  const page = getNum("page", 1);
  const search = get("search");
  const flagged = get("flagged");
  const rating = get("rating");

  const { data, error, isLoading, mutate } = useAdminReviews(
    page, 20,
    search || undefined,
    rating ? parseInt(rating, 10) : undefined,
    flagged || undefined,
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ action: string; ids: string[] } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast, show, close } = useToast();

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelected((prev) => prev.size === items.length ? new Set() : new Set(items.map((r) => r._id)));
  };

  const handleFlag = async (id: string, flag: boolean) => {
    try {
      await api.patch(`/api/v1/admin/reviews/${id}/flag`, { flagged: flag });
      mutate();
      show(flag ? "Review flagged" : "Flag removed", "success");
    } catch {
      show("Failed to update flag", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/v1/admin/reviews/${id}`);
      mutate();
      show("Review deleted", "success");
    } catch {
      show("Failed to delete review", "error");
    }
  };

  const executeBulk = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res = await api.post<{ affected: number }>("/api/v1/admin/reviews/bulk", {
        action: confirm.action,
        ids: confirm.ids,
      });
      show(`${res.affected} review(s) affected`, "success");
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
        Failed to load reviews.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Reviews</h2>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: "All", value: "" },
          { label: "Flagged", value: "true" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => set({ flagged: tab.value || null, page: 1 })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              flagged === tab.value || (!flagged && tab.value === "")
                ? "bg-primary/10 text-primary"
                : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <AdminSearch value={search} onChange={(v) => set({ search: v || null, page: 1 })} placeholder="Search review content..." />
        </div>
        <select
          value={rating}
          onChange={(e) => set({ rating: e.target.value || null, page: 1 })}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
        >
          <option value="">All Ratings</option>
          {RATING_STARS.map((r) => (
            <option key={r} value={r}>{r} ★</option>
          ))}
        </select>
        {(search || rating || flagged) && (
          <Button variant="ghost" size="sm" onClick={() => set({ search: null, rating: null, flagged: null, page: 1 })}>
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
            <span className="material-icons text-4xl text-neutral-300 dark:text-neutral-600 mb-3 block">rate_review</span>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">No reviews found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="p-4 w-10">
                      <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded border-neutral-300 accent-primary" />
                    </th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">User</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Book</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Rating</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400 hidden md:table-cell">Content</th>
                    <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr
                      key={r._id}
                      className={`border-b border-neutral-100 dark:border-neutral-700/50 transition-colors ${
                        r.flagged ? "bg-red-50/50 dark:bg-red-900/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                      } ${selected.has(r._id) ? "bg-primary/5" : ""}`}
                    >
                      <td className="p-4">
                        <input type="checkbox" checked={selected.has(r._id)} onChange={() => toggleSelect(r._id)} className="rounded border-neutral-300 accent-primary" />
                      </td>
                      <td className="p-4 text-neutral-700 dark:text-neutral-300">
                        {r.userId?.name || r.userId?.email || "—"}
                      </td>
                      <td className="p-4 text-primary font-medium max-w-[160px] truncate">
                        {r.bookId?.title || "—"}
                      </td>
                      <td className="p-4">
                        <span className="text-amber-500 font-medium">{r.rating}★</span>
                      </td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate hidden md:table-cell">
                        {r.content || "—"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleFlag(r._id, !r.flagged)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              r.flagged ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            }`}
                            title={r.flagged ? "Unflag" : "Flag"}
                          >
                            <span className="material-icons text-lg">{r.flagged ? "flag" : "outlined_flag"}</span>
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <span className="material-icons text-lg">delete</span>
                          </button>
                        </div>
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
          { label: "Flag", icon: "flag", variant: "outline", onClick: () => setConfirm({ action: "flag", ids: [...selected] }) },
          { label: "Delete", icon: "delete", variant: "danger", onClick: () => setConfirm({ action: "delete", ids: [...selected] }) },
        ]}
      />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={executeBulk}
        isLoading={actionLoading}
        title={`${confirm?.action === "delete" ? "Delete" : "Flag"} ${confirm?.ids.length ?? 0} review(s)?`}
        message={confirm?.action === "delete"
          ? `This will permanently delete ${confirm?.ids.length} review(s). This cannot be undone.`
          : `This will flag ${confirm?.ids.length} review(s) for moderation.`
        }
        confirmLabel={confirm?.action === "delete" ? "Delete" : "Flag"}
        variant={confirm?.action === "delete" ? "danger" : "primary"}
      />

      <Toast message={toast.message} variant={toast.variant} open={toast.open} onClose={close} />
    </div>
  );
}

export default function AdminReviewsPage() {
  return <Suspense><ReviewsPageInner /></Suspense>;
}
