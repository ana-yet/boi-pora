"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAdminStats } from "@/lib/hooks/useAdminStats";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const statCards = [
  { key: "users", label: "Users", icon: "people", href: "/admin/users", color: "from-blue-500/10 to-blue-500/5" },
  { key: "books", label: "Books", icon: "menu_book", href: "/admin/books", color: "from-green-500/10 to-green-500/5" },
  { key: "chapters", label: "Chapters", icon: "article", href: "/admin/books", color: "from-purple-500/10 to-purple-500/5" },
  { key: "libraryItems", label: "Library Saves", icon: "bookmark", href: "/admin/library", color: "from-amber-500/10 to-amber-500/5" },
  { key: "reviews", label: "Reviews", icon: "rate_review", href: "/admin/reviews", color: "from-red-500/10 to-red-500/5" },
] as const;

const RANGE_OPTIONS = ["7d", "30d", "90d", "1y"] as const;

interface ChartPoint { date: string; count: number }
interface ActivityEvent { type: string; description: string; timestamp: string }

const analyticsFetcher = (url: string) => api.get<ChartPoint[]>(url);
const activityFetcher = (url: string) => api.get<ActivityEvent[]>(url);

const ACTIVITY_ICONS: Record<string, string> = {
  signup: "person_add",
  book: "menu_book",
  review: "rate_review",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboardPage() {
  const { data: stats, error, isLoading } = useAdminStats();
  const [range, setRange] = useState<string>("30d");

  const { data: usersChart } = useSWR(`/api/v1/admin/analytics?metric=newUsers&range=${range}`, analyticsFetcher);
  const { data: booksChart } = useSWR(`/api/v1/admin/analytics?metric=newBooks&range=${range}`, analyticsFetcher);
  const { data: reviewsChart } = useSWR(`/api/v1/admin/analytics?metric=newReviews&range=${range}`, analyticsFetcher);
  const { data: activity } = useSWR("/api/v1/admin/activity?limit=15", activityFetcher);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-6 text-red-600 dark:text-red-400">
        Failed to load stats. Check that you are logged in as admin.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ key, label, icon, href, color }) => (
          <Link
            key={key}
            href={href}
            className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-icons text-primary text-xl">{icon}</span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {label}
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-neutral-800 dark:text-white tabular-nums">
                  {stats?.[key]?.toLocaleString() ?? 0}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">Analytics</h3>
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="New Users" data={usersChart} color="#3b82f6" type="area" />
        <ChartCard title="Books Added" data={booksChart} color="#22c55e" type="bar" />
        <ChartCard title="New Reviews" data={reviewsChart} color="#f59e0b" type="bar" />

        {/* Recent Activity */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5">
          <h4 className="font-semibold text-neutral-800 dark:text-white mb-4 text-sm">Recent Activity</h4>
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {!activity || activity.length === 0 ? (
              <p className="text-sm text-neutral-400">No recent activity</p>
            ) : (
              activity.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="material-icons text-primary text-lg mt-0.5">
                    {ACTIVITY_ICONS[event.type] ?? "notifications"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                      {event.description}
                    </p>
                    <p className="text-xs text-neutral-400">{timeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/books/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <span className="material-icons text-lg">add</span>
            Add Book
          </Link>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
          >
            <span className="material-icons text-lg">person_add</span>
            Add User
          </Link>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  color,
  type,
}: {
  title: string;
  data?: ChartPoint[];
  color: string;
  type: "area" | "bar";
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5">
      <h4 className="font-semibold text-neutral-800 dark:text-white mb-4 text-sm">{title}</h4>
      <div className="h-[200px]">
        {!data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-neutral-400">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface, #fff)",
                    borderColor: "var(--color-border, #e5e7eb)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke={color} fill={`url(#grad-${title})`} strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface, #fff)",
                    borderColor: "var(--color-border, #e5e7eb)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
