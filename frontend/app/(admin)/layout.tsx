"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Users", href: "/admin/users", icon: "people" },
  { label: "Books", href: "/admin/books", icon: "menu_book" },
  { label: "Library", href: "/admin/library", icon: "bookmark" },
  { label: "Reviews", href: "/admin/reviews", icon: "rate_review" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/login?redirect=" + encodeURIComponent(pathname || "/admin"));
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <aside className="sticky top-0 self-start h-screen w-64 flex-shrink-0 flex flex-col bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-700">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="material-icons text-primary text-2xl">auto_stories</span>
            <span className="font-bold text-neutral-800 dark:text-white">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-auto">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span className="material-icons text-lg">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <span className="material-icons text-lg">arrow_back</span>
            Back to Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-neutral-800 dark:text-white">
            Boi Pora Admin
          </h1>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{user.email}</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
              Admin
            </span>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
