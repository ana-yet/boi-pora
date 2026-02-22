import Link from "next/link";

const footerLinks = {
    navigate: [
        { label: "হোম", href: "/" },
        { label: "বই সমূহ", href: "/books" },
        { label: "সম্পর্কে", href: "/about" },
        { label: "যোগাযোগ", href: "/contact" },
    ],
    resources: [
        { label: "FAQ", href: "/faq" },
        { label: "গোপনীয়তা নীতি", href: "/privacy" },
        { label: "শর্তাবলী", href: "/terms" },
    ],
};

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-3">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">📖</span>
                            <span className="font-bold text-lg text-foreground">বই পড়া</span>
                        </Link>
                        <p className="text-sm text-muted leading-relaxed max-w-xs">
                            আপনার ডিজিটাল পড়ার সঙ্গী — আবিষ্কার করুন, পড়ুন এবং শেয়ার করুন।
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4">নেভিগেশন</h4>
                        <ul className="space-y-2">
                            {footerLinks.navigate.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4">রিসোর্স</h4>
                        <ul className="space-y-2">
                            {footerLinks.resources.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-light">
                        © {currentYear} বই পড়া। সর্বস্বত্ব সংরক্ষিত।
                    </p>
                </div>
            </div>
        </footer>
    );
}
