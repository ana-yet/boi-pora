const stats = [
    { value: "14h", label: "Time Read" },
    { value: "3", label: "Books Finished" },
];

export function ReadingStats() {
    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-soft border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-4">
                Reading Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-background-light dark:bg-background-dark p-4 rounded-xl text-center"
                    >
                        <span className="block text-2xl font-bold text-primary mb-1">
                            {stat.value}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {stat.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
