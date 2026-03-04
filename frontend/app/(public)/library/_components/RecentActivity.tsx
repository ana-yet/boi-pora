"use client";

import Link from "next/link";
import { useReadingProgress } from "@/lib/hooks/useReadingProgress";

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(dateStr).toLocaleDateString();
}

function getActivityLabel(percent: number): { text: string; icon: string; color: string } {
    if (percent >= 100) return { text: "Finished", icon: "emoji_events", color: "text-yellow-500" };
    if (percent >= 75) return { text: "Almost done", icon: "local_fire_department", color: "text-orange-500" };
    if (percent > 0) return { text: "Reading", icon: "auto_stories", color: "text-primary" };
    return { text: "Started", icon: "play_circle", color: "text-green-500" };
}

export function RecentActivity() {
    const { data, isLoading } = useReadingProgress();

    const recent = data
        .filter((p) => p.lastReadAt)
        .slice(0, 5);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-4">
                    Recent Activity
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-4 flex items-center gap-2">
                <span className="material-icons text-base text-primary">history</span>
                Recent Activity
            </h3>

            {recent.length === 0 ? (
                <div className="py-6 text-center">
                    <span className="material-icons text-3xl text-neutral-300 dark:text-neutral-600 block mb-2">schedule</span>
                    <p className="text-xs text-neutral-400">
                        Your reading activity will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recent.map((item) => {
                        const percent = item.percentComplete ?? 0;
                        const activity = getActivityLabel(percent);
                        const category = item.bookId?.category || "fiction";

                        return (
                            <Link
                                key={item._id}
                                href={`/${category}/${item.bookId?.slug}`}
                                className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                            >
                                <span className={`material-icons text-lg mt-0.5 ${activity.color}`}>
                                    {activity.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-primary transition-colors">
                                        {item.bookId?.title ?? "Unknown"}
                                    </p>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        {activity.text} &middot; {percent}%
                                        {item.chapterId?.title && (
                                            <> &middot; {item.chapterId.title}</>
                                        )}
                                    </p>
                                </div>
                                <span className="text-[10px] text-neutral-400 mt-1 flex-shrink-0">
                                    {item.lastReadAt ? formatTimeAgo(item.lastReadAt) : ""}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
