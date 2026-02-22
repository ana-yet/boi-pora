export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-4xl">📖</span>
                    <h2 className="mt-2 text-xl font-bold text-foreground">বই পড়া</h2>
                </div>
                {children}
            </div>
        </div>
    );
}
