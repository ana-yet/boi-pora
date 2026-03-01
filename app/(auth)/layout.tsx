import { AuthPanel } from "./_components";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            <AuthPanel />
            <main className="flex-1 flex items-center justify-center px-6 py-12 bg-background-light dark:bg-background-dark">
                <div className="w-full max-w-md">{children}</div>
            </main>
        </div>
    );
}
