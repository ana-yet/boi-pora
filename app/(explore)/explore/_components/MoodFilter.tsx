"use client";

import { useState } from "react";

const moods = [
    { id: "deep-thinking", label: "Deep Thinking", icon: "psychology" },
    { id: "calm", label: "Calm & Relaxing", icon: "emoji_nature" },
    { id: "productivity", label: "Productivity", icon: "bolt" },
    { id: "light-fun", label: "Light & Fun", icon: "sentiment_very_satisfied" },
    { id: "adventure", label: "Adventure", icon: "travel_explore" },
];

export function MoodFilter() {
    const [activeMood, setActiveMood] = useState("deep-thinking");

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
                    Browse by Mood
                </h2>
                <a
                    className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    href="#"
                >
                    View all
                </a>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                {moods.map((mood) => {
                    const isActive = activeMood === mood.id;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => setActiveMood(mood.id)}
                            className={`snap-start flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 ${
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-primary/50 hover:text-primary"
                            }`}
                        >
                            <span className="material-icons text-base">
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
