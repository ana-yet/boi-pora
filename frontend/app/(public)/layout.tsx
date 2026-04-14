import { Navbar, Footer } from "@/app/components/layout";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col w-full min-h-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {children}
            </main>
            <Footer />
        </div>
    );
}
