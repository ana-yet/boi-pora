import type { Metadata } from "next";
import { SearchBar } from "../_components/SearchBar";
import { BookGrid } from "../_components/BookGrid";

export const metadata: Metadata = {
    title: "New Arrivals",
    description: "Newly added books. Discover fresh titles every week.",
};

export default function NewArrivalsPage() {
    return (
        <>
            <header className="flex-shrink-0 px-8 pt-8 pb-4 bg-background-light dark:bg-background-dark z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white tracking-tight mb-2">
                                New Arrivals
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Fresh titles added recently.
                            </p>
                        </div>
                        <button className="md:hidden p-2 text-neutral-600 dark:text-neutral-300">
                            <span className="material-icons text-3xl">
                                menu
                            </span>
                        </button>
                    </div>
                    <SearchBar />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    <BookGrid />
                </div>
            </div>
        </>
    );
}
