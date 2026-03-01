export interface Insight {
    quote: string;
    note?: string;
    source: string;
    timeAgo: string;
}

export function InsightCard({ insight }: { insight: Insight }) {
    return (
        <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl text-primary/20 font-serif leading-none h-4">
                    &ldquo;
                </span>
                <p className="text-sm italic text-neutral-800 dark:text-neutral-200 font-light leading-relaxed">
                    {insight.quote}
                </p>
            </div>

            {insight.note && (
                <div className="pl-7 mb-3">
                    <div className="h-px w-8 bg-neutral-300 dark:bg-neutral-700 mb-3" />
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 bg-primary/5 p-2 rounded">
                        <span className="font-semibold text-primary">
                            Note:
                        </span>{" "}
                        {insight.note}
                    </p>
                </div>
            )}

            <div className="pl-7 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-primary transition-colors">
                    {insight.source}
                </span>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-400">
                    {insight.timeAgo}
                </span>
            </div>
        </div>
    );
}
