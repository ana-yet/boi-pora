"use client";

const moods = [
    { id: "all", label: "All", icon: "apps" },
    { id: "fiction", label: "Fiction", icon: "auto_stories" },
    { id: "academic", label: "Academic", icon: "psychology" },
    { id: "self-help", label: "Self Help", icon: "emoji_nature" },
    { id: "business", label: "Business", icon: "bolt" },
    { id: "history", label: "History", icon: "travel_explore" },
    { id: "sci-fi", label: "Sci-Fi", icon: "rocket_launch" },
];

interface MoodFilterProps {
    activeMood?: string;
    onMoodChange: (mood: string | undefined) => void;
}

export function MoodFilter({ activeMood, onMoodChange }: MoodFilterProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
                    Browse by Category
                </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                {moods.map((mood) => {
                    const isActive = (activeMood ?? "all") === mood.id;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => onMoodChange(mood.id === "all" ? undefined : mood.id)}
                            className={`snap-start flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-primary/50 hover:text-primary"
                            }`}
                        >
                            <span className="material-icons text-base" aria-hidden="true">
                                {mood.icon}
                            </span>
                            {mood.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
