"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";
import { api } from "@/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Toast } from "@/app/components/ui/Toast";
import {
  AdminSearch, StatusBadge, BulkActionBar, Pagination,
  ConfirmModal, useUrlParams, useToast,
} from "../_components";

function UsersPageInner() {
  const { get, getNum, set } = useUrlParams();
  const page = getNum("page", 1);
  const search = get("search");
  const role = get("role");

  const { data, error, isLoading, mutate } = useAdminUsers(page, 20, search || undefined, role || undefined);
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
    setSelected((prev) => prev.size === items.length ? new Set() : new Set(items.map((u) => u._id)));
  };

  const executeBulk = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res = await api.post<{ affected: number }>("/api/v1/admin/users/bulk", {
        action: confirm.action,
        ids: confirm.ids,
      });
      show(`${res.affected} user(s) affected`, "success");
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
        Failed to load users.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Users</h2>
        <Link href="/admin/users/new">
          <Button>
            <span className="material-icons text-lg mr-1">person_add</span>
            Add User
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <AdminSearch value={search} onChange={(v) => set({ search: v || null, page: 1 })} placeholder="Search by name or email..." />
        </div>
        <select
          value={role}
          onChange={(e) => set({ role: e.target.value || null, page: 1 })}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        {(search || role) && (
          <Button variant="ghost" size="sm" onClick={() => set({ search: null, role: null, page: 1 })}>
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
            <span className="material-icons text-4xl text-neutral-300 dark:text-neutral-600 mb-3 block">people</span>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">No users found.</p>
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
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Email</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Role</th>
                    <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => (
                    <tr
                      key={user._id}
                      className={`border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors ${selected.has(user._id) ? "bg-primary/5" : ""}`}
                    >
                      <td className="p-4">
                        <input type="checkbox" checked={selected.has(user._id)} onChange={() => toggleSelect(user._id)} className="rounded border-neutral-300 accent-primary" />
                      </td>
                      <td className="p-4 font-medium text-neutral-800 dark:text-white">{user.email}</td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300">{user.name ?? "—"}</td>
                      <td className="p-4"><StatusBadge status={user.role} /></td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/users/${user._id}`} className="text-primary hover:underline text-sm">Edit</Link>
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
          { label: "Delete", icon: "delete", variant: "danger", onClick: () => setConfirm({ action: "delete", ids: [...selected] }) },
        ]}
      />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={executeBulk}
        isLoading={actionLoading}
        title={`Delete ${confirm?.ids.length ?? 0} user(s)?`}
        message="This will permanently delete the selected users. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <Toast message={toast.message} variant={toast.variant} open={toast.open} onClose={close} />
    </div>
  );
}

export default function AdminUsersPage() {
  return <Suspense><UsersPageInner /></Suspense>;
}
