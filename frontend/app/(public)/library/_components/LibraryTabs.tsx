"use client";

import { useState, type ReactNode } from "react";

const tabs = [
    { id: "saved", label: "Saved for Later" },
    { id: "finished", label: "Finished" },
    { id: "collections", label: "Collections" },
] as const;

type ViewMode = "grid" | "list";

export function LibraryTabs({ children }: { children: ReactNode }) {
    const [activeTab, setActiveTab] = useState<string>("saved");
    const [view, setView] = useState<ViewMode>("grid");

    return (
        <section>
            <div className="flex items-center justify-between mb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="hidden sm:flex gap-2 pb-2">
                    <button
                        onClick={() => setView("grid")}
                        className={`p-1.5 rounded transition-colors ${
                            view === "grid"
                                ? "text-neutral-800 dark:text-white bg-neutral-200 dark:bg-neutral-800"
                                : "text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        }`}
                    >
                        <span className="material-icons text-lg">
                            grid_view
                        </span>
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`p-1.5 rounded transition-colors ${
                            view === "list"
                                ? "text-neutral-800 dark:text-white bg-neutral-200 dark:bg-neutral-800"
                                : "text-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        }`}
                    >
                        <span className="material-icons text-lg">
                            view_list
                        </span>
                    </button>
                </div>
            </div>

            {children}
        </section>
    );
}
