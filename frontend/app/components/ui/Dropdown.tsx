"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface DropdownItem {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: string;
    disabled?: boolean;
}

interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    align?: "left" | "right";
    className?: string;
}

export function Dropdown({
    trigger,
    items,
    align = "left",
    className = "",
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <div ref={ref} className={`relative inline-block ${className}`}>
            <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
                {trigger}
            </div>
            {open && (
                <div
                    className={`absolute top-full mt-2 min-w-[180px] py-1 rounded-xl bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-800 shadow-lg z-50 ${
                        align === "right" ? "right-0" : "left-0"
                    }`}
                >
                    {items.map((item) =>
                        item.href ? (
                            <a
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                {item.icon && (
                                    <span className="material-icons text-lg text-neutral-500">
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </a>
                        ) : (
                            <button
                                key={item.label}
                                type="button"
                                disabled={item.disabled}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 text-left"
                                onClick={() => {
                                    item.onClick?.();
                                    setOpen(false);
                                }}
                            >
                                {item.icon && (
                                    <span className="material-icons text-lg text-neutral-500">
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
