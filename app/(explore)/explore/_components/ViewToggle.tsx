"use client";

import { useState } from "react";

type ViewMode = "grid" | "list";

export function ViewToggle() {
    const [view, setView] = useState<ViewMode>("grid");

    return (
        <div className="flex gap-2">
            <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-colors ${
                    view === "grid"
                        ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                        : "text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
            >
                <span className="material-icons">grid_view</span>
            </button>
            <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-colors ${
                    view === "list"
                        ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                        : "text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
            >
                <span className="material-icons">list</span>
            </button>
        </div>
    );
}
