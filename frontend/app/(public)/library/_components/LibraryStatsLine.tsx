"use client";

import { useReadingProgress } from "@/lib/hooks/useReadingProgress";
import { useLibrary } from "@/lib/hooks/useLibrary";

export function LibraryStatsLine() {
    const { data: progress, isLoading: pLoading } = useReadingProgress();
    const { data: library, isLoading: lLoading } = useLibrary();

    if (pLoading || lLoading) {
        return <span className="inline-block w-40 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />;
    }

    const finished = progress.filter((p) => (p.percentComplete ?? 0) >= 100).length;
    const total = library?.total ?? 0;

    if (total === 0) {
        return <span>Start building your personal collection.</span>;
    }

    return (
        <>
            <span className="text-primary font-semibold">{total} book{total !== 1 ? "s" : ""}</span> saved
            {finished > 0 && (
                <>, <span className="text-primary font-semibold">{finished}</span> finished</>
            )}
        </>
    );
}
