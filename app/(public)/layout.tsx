import { Navbar, Footer } from "@/app/components/layout";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Navbar />
            <main className="flex-1 ">{children}</main>
            <Footer />
        </div>
    );
}
