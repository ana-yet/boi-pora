"use client";

import { Button } from "@/app/components/ui/Button";

interface BulkAction {
  label: string;
  icon: string;
  variant?: "primary" | "danger" | "outline";
  onClick: () => void;
}

interface BulkActionBarProps {
  count: number;
  actions: BulkAction[];
  onClearSelection: () => void;
}

export function BulkActionBar({ count, actions, onClearSelection }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-[fadeInUp_0.2s_ease-out]">
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-neutral-900 dark:bg-neutral-800 shadow-2xl border border-neutral-700">
        <span className="text-sm text-white font-medium whitespace-nowrap">
          {count} selected
        </span>
        <div className="w-px h-5 bg-neutral-700" />
        {actions.map((a) => (
          <Button
            key={a.label}
            variant={a.variant ?? "outline"}
            size="sm"
            onClick={a.onClick}
            className={a.variant === "danger"
              ? "!bg-red-600 !text-white hover:!bg-red-700 !border-red-600"
              : a.variant === "primary"
                ? ""
                : "!text-white !border-neutral-600 hover:!border-neutral-500"
            }
          >
            <span className="material-icons text-sm mr-1">{a.icon}</span>
            {a.label}
          </Button>
        ))}
        <div className="w-px h-5 bg-neutral-700" />
        <button
          onClick={onClearSelection}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Clear selection"
        >
          <span className="material-icons text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
