"use client";

import { useState } from "react";
import { SavedBooksGrid } from "./SavedBooksGrid";

const tabs = [
    { id: "saved", label: "All Saved", icon: "collections_bookmark" },
    { id: "in-progress", label: "In Progress", icon: "auto_stories" },
    { id: "finished", label: "Finished", icon: "emoji_events" },
] as const;

type ViewMode = "grid" | "list";

export function LibraryTabs() {
    const [activeTab, setActiveTab] = useState<string>("saved");
    const [view, setView] = useState<ViewMode>("grid");

    return (
        <section>
            <div className="flex items-center justify-between mb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex gap-1 sm:gap-6 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 px-1 ${
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                            }`}
                        >
                            <span className="material-icons text-base hidden sm:inline">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex gap-1 pb-2">
                    <button
                        onClick={() => setView("grid")}
                        className={`p-1.5 rounded transition-colors ${
                            view === "grid"
                                ? "text-neutral-800 dark:text-white bg-neutral-200 dark:bg-neutral-800"
                                : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                        title="Grid view"
                    >
                        <span className="material-icons text-lg">grid_view</span>
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`p-1.5 rounded transition-colors ${
                            view === "list"
                                ? "text-neutral-800 dark:text-white bg-neutral-200 dark:bg-neutral-800"
                                : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                        title="List view"
                    >
                        <span className="material-icons text-lg">view_list</span>
                    </button>
                </div>
            </div>

            <SavedBooksGrid activeTab={activeTab} view={view} />
        </section>
    );
}
