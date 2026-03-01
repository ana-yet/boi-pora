"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers/AuthProvider";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <span className="material-icons text-primary text-3xl">auto_stories</span>
            <span className="font-bold text-xl tracking-tight text-neutral-800 dark:text-white">
              Boi Pora
            </span>
          </Link>
          <div className="hidden md:flex space-x-10 items-center">
            <Link
              href="/explore"
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors font-medium"
            >
              Explore
            </Link>
            <Link
              href="/library"
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors font-medium"
            >
              My Library
            </Link>
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-primary font-medium hover:text-primary/80"
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <form action="/search" method="get" className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-neutral-400 text-lg">search</span>
              </span>
              <input
                name="q"
                className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-white dark:bg-surface-dark focus:bg-white focus:ring-2 focus:ring-primary text-sm w-48 transition-all placeholder-neutral-400"
                placeholder="Search..."
                type="search"
              />
            </form>
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                    {initials}
                  </div>
                  <span className="material-icons text-neutral-500 text-lg">
                    expand_more
                  </span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <p className="font-medium text-neutral-800 dark:text-white truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/library"
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Library
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-primary hover:bg-neutral-50 dark:hover:bg-neutral-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                <span className="material-icons text-lg">login</span>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
