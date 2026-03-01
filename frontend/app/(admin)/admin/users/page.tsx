"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminUsers } from "@/lib/hooks/useAdminUsers";
import { Button } from "@/app/components/ui/Button";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useAdminUsers(page, 20);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-red-600">
        Failed to load users.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
          Users
        </h2>
        <Link href="/admin/users/new">
          <Button>
            <span className="material-icons text-lg mr-1">add</span>
            Add User
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            No users yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Email</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Name</th>
                    <th className="text-left p-4 font-medium text-neutral-600 dark:text-neutral-400">Role</th>
                    <th className="text-right p-4 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((user: { _id: string; email: string; name?: string; role: string }) => (
                    <tr
                      key={user._id}
                      className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                    >
                      <td className="p-4 font-medium text-neutral-800 dark:text-white">{user.email}</td>
                      <td className="p-4 text-neutral-600 dark:text-neutral-300">{user.name ?? "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-neutral-100 dark:bg-neutral-700"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/users/${user._id}`} className="text-primary hover:underline">
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
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-neutral-600">
                  Page {page} of {totalPages}
                </span>
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
