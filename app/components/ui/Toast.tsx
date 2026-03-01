"use client";

import { useEffect, type ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info" | "default";

interface ToastProps {
    message: ReactNode;
    variant?: ToastVariant;
    open: boolean;
    onClose: () => void;
    duration?: number;
}

const variantStyles: Record<ToastVariant, string> = {
    success: "bg-green-600 text-white border-green-700",
    error: "bg-red-600 text-white border-red-700",
    info: "bg-primary text-white border-primary-dark",
    default:
        "bg-neutral-800 dark:bg-neutral-700 text-white border-neutral-700",
};

export function Toast({
    message,
    variant = "default",
    open,
    onClose,
    duration = 4000,
}: ToastProps) {
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [open, duration, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-[fadeInUp_0.3s_ease-out]"
            role="status"
            aria-live="polite"
        >
            <div
                className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${variantStyles[variant]}`}
            >
                {variant === "success" && (
                    <span className="material-icons text-xl">check_circle</span>
                )}
                {variant === "error" && (
                    <span className="material-icons text-xl">error</span>
                )}
                {variant === "info" && (
                    <span className="material-icons text-xl">info</span>
                )}
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
}
