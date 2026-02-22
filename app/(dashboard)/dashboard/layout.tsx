import { Sidebar } from "@/app/components/layout";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-8 bg-background overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
