import Link from "next/link";

export function Footer() {
    const links = [
        { label: "About", href: "/about" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Contact", href: "/contact" },
    ];

    return (
        <footer className="bg-white dark:bg-surface-dark border-t border-neutral-200 dark:border-neutral-800 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="material-icons text-primary text-2xl">
                        auto_stories
                    </span>
                    <span className="font-bold text-lg tracking-tight text-neutral-800 dark:text-white">

                        Boi Pora
                    </span>
                </div>

                {/* Navigation */}
                <div className="flex gap-8 text-sm text-neutral-500">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-sm text-neutral-400">
                    © {new Date().getFullYear()} Boi Pora. All rights reserved.
                </p>
            </div>
        </footer>
    );
}