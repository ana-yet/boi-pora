"use client";

import Link from "next/link";
import { useAdminStats } from "@/lib/hooks/useAdminStats";

const statCards = [
  { key: "users", label: "Users", icon: "people", href: "/admin/users" },
  { key: "books", label: "Books", icon: "menu_book", href: "/admin/books" },
  { key: "chapters", label: "Chapters", icon: "article", href: "/admin/books" },
  { key: "libraryItems", label: "Library Items", icon: "bookmark", href: "/admin/library" },
  { key: "reviews", label: "Reviews", icon: "rate_review", href: "/admin/reviews" },
] as const;

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useAdminStats();

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6 text-red-600 dark:text-red-400">
        Failed to load stats. Check that you are logged in as admin.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-6">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ key, label, icon, href }) => (
          <Link
            key={key}
            href={href}
            className="block p-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons text-primary">{icon}</span>
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {label}
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-white">
              {data?.[key] ?? 0}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              href="/admin/books/new"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="material-icons text-lg">add</span>
              Add a new book
            </Link>
            <Link
              href="/admin/users/new"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="material-icons text-lg">person_add</span>
              Add a new user
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
