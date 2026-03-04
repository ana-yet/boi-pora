"use client";

import { useReadingProgress } from "@/lib/hooks/useReadingProgress";
import { useLibrary } from "@/lib/hooks/useLibrary";

export function ReadingStats() {
    const { data: progress } = useReadingProgress();
    const { data: library } = useLibrary();

    const booksInProgress = progress.filter(
        (p) => (p.percentComplete ?? 0) > 0 && (p.percentComplete ?? 0) < 100
    ).length;
    const booksFinished = progress.filter(
        (p) => (p.percentComplete ?? 0) >= 100
    ).length;
    const totalBooks = library?.total ?? 0;

    const stats = [
        { value: String(booksFinished), label: "Books Finished" },
        { value: String(booksInProgress), label: "In Progress" },
        { value: String(totalBooks), label: "In Library" },
    ];

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-4">
                Reading Stats
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-background-light dark:bg-background-dark p-3 rounded-xl text-center"
                    >
                        <span className="block text-2xl font-bold text-primary mb-1">
                            {stat.value}
                        </span>
                        <span className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
