"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useState, useRef, useEffect, useCallback } from "react";

function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = stored === "dark" || (!stored && prefersDark);
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { isDark, toggle };
}

const navLinkClass =
  "block rounded-xl px-4 py-3 text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary transition-colors";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center gap-2">
          <Link href="/" className="shrink-0 flex items-center gap-2 min-w-0">
            <span className="material-icons text-primary text-2xl sm:text-3xl shrink-0">auto_stories</span>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-neutral-800 dark:text-white truncate">
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
              <Link href="/admin" className="text-primary font-medium hover:text-primary/80">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <form action="/search" method="get" className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-neutral-400 text-lg">search</span>
              </span>
              <input
                name="q"
                aria-label="Search books"
                className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-white dark:bg-surface-dark focus:bg-white focus:ring-2 focus:ring-primary text-sm w-48 transition-all placeholder-neutral-400"
                placeholder="Search..."
                type="search"
              />
            </form>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-icons text-neutral-600 dark:text-neutral-300">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
                    {initials}
                  </div>
                  <span className="material-icons text-neutral-500 text-lg hidden sm:inline">
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
                      href="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
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
                      type="button"
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
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 shrink-0"
              >
                <span className="material-icons text-base sm:text-lg">login</span>
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="material-icons text-neutral-700 dark:text-neutral-200 text-2xl" aria-hidden="true">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-60 bg-black/45 backdrop-blur-sm md:hidden"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed top-0 right-0 z-61 flex h-full w-[min(20rem,88vw)] flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-surface-dark md:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
              <span className="text-sm font-semibold text-neutral-800 dark:text-white">Menu</span>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Close menu"
              >
                <span className="material-icons text-neutral-600 dark:text-neutral-300">close</span>
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              <Link href="/explore" className={navLinkClass} onClick={closeMobile}>
                Explore
              </Link>
              <Link href="/library" className={navLinkClass} onClick={closeMobile}>
                My Library
              </Link>
              <Link href="/search" className={navLinkClass} onClick={closeMobile}>
                Search
              </Link>
              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin" className={navLinkClass} onClick={closeMobile}>
                  Admin
                </Link>
              )}
              {!isAuthenticated && (
                <Link href="/login" className={navLinkClass} onClick={closeMobile}>
                  Sign in
                </Link>
              )}
              {!isAuthenticated && (
                <Link href="/register" className={navLinkClass} onClick={closeMobile}>
                  Create account
                </Link>
              )}
            </nav>
            <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
              <form action="/search" method="get" onSubmit={closeMobile} className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="material-icons text-neutral-400 text-lg">search</span>
                </span>
                <input
                  name="q"
                  aria-label="Search books"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="Search books…"
                  type="search"
                />
              </form>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
