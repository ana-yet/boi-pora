import Link from "next/link";

const navLinks = [
    { label: "হোম", href: "/" },
    { label: "বই সমূহ", href: "/books" },
    { label: "সম্পর্কে", href: "/about" },
    { label: "যোগাযোগ", href: "/contact" },
];

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 group"
                    >
                        <span className="text-2xl">📖</span>
                        <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors duration-200">
                            বই পড়া
                        </span>
                    </Link>

                    {/* Center Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted hover:text-primary transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                        >
                            লগইন
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            রেজিস্টার
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
