import type { Metadata } from "next";
import { ExploreSidebar } from "./_components";

export const metadata: Metadata = {
    title: "Explore Books",
    description:
        "Discover and explore over 10,000+ titles curated for focus and flow.",
};

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen overflow-hidden">
            <ExploreSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {children}
            </main>
        </div>
    );
}
