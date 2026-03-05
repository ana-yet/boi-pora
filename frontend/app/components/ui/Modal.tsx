"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export function Modal({
    open,
    onClose,
    title,
    children,
    className = "",
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        const dialog = dialogRef.current;
        if (dialog) {
            const focusable = dialog.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            first?.focus();

            const trapFocus = (e: KeyboardEvent) => {
                if (e.key !== "Tab") return;
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last?.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first?.focus();
                    }
                }
            };
            dialog.addEventListener("keydown", trapFocus);
            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow = "";
                dialog.removeEventListener("keydown", trapFocus);
            };
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div
                ref={dialogRef}
                className={twMerge(
                    "relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-surface-dark shadow-xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] flex flex-col",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <h2
                            id="modal-title"
                            className="text-lg font-semibold text-neutral-800 dark:text-white"
                        >
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <span className="material-icons text-xl" aria-hidden="true">close</span>
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
