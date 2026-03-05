"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";

const discoverLinks = [
    { label: "Explore", href: "/explore", icon: "explore" },
    { label: "Trending", href: "/explore/trending", icon: "trending_up" },
    { label: "New Arrivals", href: "/explore/new", icon: "new_releases" },
];

const libraryLinks = [
    { label: "My List", href: "/library", icon: "bookmarks" },
    { label: "History", href: "/library", icon: "history" },
];

const categoryLinks = [
    { label: "Philosophy", href: "/explore?category=philosophy", icon: "psychology" },
    { label: "Sci-Fi", href: "/explore?category=sci-fi", icon: "rocket_launch" },
];

export function ExploreSidebar() {
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? "?";

    return (
        <aside className="w-64 bg-white dark:bg-surface-dark border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0 flex-col h-screen z-20 hidden md:flex">
            <div className="p-8 pb-4">
                <Link
                    href="/"
                    className="flex items-center gap-3 text-primary font-bold text-2xl tracking-tight"
                >
                    <span className="material-icons text-3xl">auto_stories</span>
                    <span>Boi Pora</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <SidebarSection title="Discover" links={discoverLinks} pathname={pathname} />
                <SidebarSection title="Library" links={libraryLinks} pathname={pathname} />
                <SidebarSection title="Categories" links={categoryLinks} pathname={pathname} />
            </nav>

            {isAuthenticated && user && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Link
                        href="/profile"
                        className="flex items-center gap-3 w-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-xl transition-colors text-left"
                        aria-label="Go to profile"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm ring-2 ring-white dark:ring-neutral-700 shadow-sm">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-800 dark:text-white truncate">
                                {user.name || user.email}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                {user.role === "admin" ? "Admin" : "Member"}
                            </p>
                        </div>
                        <span className="material-icons text-neutral-400">
                            chevron_right
                        </span>
                    </Link>
                </div>
            )}
        </aside>
    );
}

interface SidebarLink {
    label: string;
    href: string;
    icon: string;
}

function SidebarSection({
    title,
    links,
    pathname,
}: {
    title: string;
    links: SidebarLink[];
    pathname: string;
}) {
    return (
        <div className="pt-6 first:pt-0">
            <p className="px-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2">
                {title}
            </p>
            {links.map((link) => {
                const active = pathname === link.href;
                return (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group font-medium ${
                        active
                            ? "bg-primary/10 text-primary"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-800 dark:hover:text-white"
                    }`}
                >
                    <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                        {link.icon}
                    </span>
                    {link.label}
                </Link>
                );
            })}
        </div>
    );
}
