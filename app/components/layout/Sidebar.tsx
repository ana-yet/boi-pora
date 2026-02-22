"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
    { label: "ড্যাশবোর্ড", href: "/dashboard", icon: "🏠" },
    { label: "আমার বই", href: "/dashboard/my-books", icon: "📚" },
    { label: "পছন্দ তালিকা", href: "/dashboard/favorites", icon: "❤️" },
    { label: "সেটিংস", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface min-h-screen sticky top-0">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl">📖</span>
                    <span className="font-bold text-foreground">বই পড়া</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? "bg-primary-light text-primary"
                                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                                }`}
                        >
                            <span className="text-lg">{link.icon}</span>
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-border">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors">
                    <span className="text-lg">🚪</span>
                    <span>লগ আউট</span>
                </button>
            </div>
        </aside>
    );
}
