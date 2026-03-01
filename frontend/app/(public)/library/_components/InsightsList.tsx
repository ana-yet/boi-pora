import { InsightCard } from "./InsightCard";
import type { Insight } from "./InsightCard";

const insights: Insight[] = [
    {
        quote: "We suffer more often in imagination than in reality.",
        note: "Reminder to stay present and not overthink future scenarios.",
        source: "Letters from a Stoic",
        timeAgo: "2h ago",
    },
    {
        quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
        source: "Atomic Habits",
        timeAgo: "Yesterday",
    },
    {
        quote: "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration.",
        note: "The Litany Against Fear. Classic.",
        source: "Dune",
        timeAgo: "3d ago",
    },
];

export function InsightsList() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-neutral-800 dark:text-white">
                    <span className="material-icons text-yellow-500">
                        lightbulb
                    </span>
                    Insights
                </h3>
                <button className="p-1 text-neutral-600 hover:text-primary transition-colors">
                    <span className="material-icons text-xl">filter_list</span>
                </button>
            </div>

            <div className="space-y-4">
                {insights.map((insight) => (
                    <InsightCard key={insight.source} insight={insight} />
                ))}
            </div>

            <button className="w-full mt-4 py-3 text-xs font-medium text-neutral-600 hover:text-primary border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                <span className="material-icons text-sm">add</span>
                Add new note
            </button>
        </div>
    );
}
