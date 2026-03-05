"use client";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => onViewChange("grid")}
                aria-label="Grid view"
                className={`p-2 rounded-lg transition-colors ${
                    view === "grid"
                        ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                        : "text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
            >
                <span className="material-icons" aria-hidden="true">grid_view</span>
            </button>
            <button
                onClick={() => onViewChange("list")}
                aria-label="List view"
                className={`p-2 rounded-lg transition-colors ${
                    view === "list"
                        ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white"
                        : "text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                }`}
            >
                <span className="material-icons" aria-hidden="true">list</span>
            </button>
        </div>
    );
}
