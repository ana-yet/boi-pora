"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
    const router = useRouter();
    const [q, setQ] = useState(initialQuery);

    useEffect(() => {
        setQ(initialQuery);
    }, [initialQuery]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const term = q.trim();
        if (term) {
            router.push(`/search?q=${encodeURIComponent(term)}`);
        } else {
            router.push("/search");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-10">
            <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl shadow-card border border-neutral-200 dark:border-neutral-800 p-2 gap-2">
                <span className="material-icons text-neutral-400 ml-2 text-2xl">
                    search
                </span>
                <input
                    type="search"
                    name="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by title, author, or keyword..."
                    className="flex-1 px-2 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-lg text-neutral-800 dark:text-white placeholder-neutral-400"
                />
                <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                >
                    Search
                </button>
            </div>
        </form>
    );
}
