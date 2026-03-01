"use client";

import { useState, forwardRef, type InputHTMLAttributes } from "react";

interface PasswordInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, className = "", id, ...props }, ref) => {
        const [visible, setVisible] = useState(false);
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-neutral-800 dark:text-neutral-200"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={visible ? "text" : "password"}
                        className={`w-full px-4 py-3 pr-12 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-surface-dark text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-neutral-300 dark:hover:border-neutral-600 ${
                            error
                                ? "border-red-400 focus:ring-red-300/30 focus:border-red-400"
                                : ""
                        } ${className}`}
                        {...props}
                    />
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                        tabIndex={-1}
                        aria-label={
                            visible ? "Hide password" : "Show password"
                        }
                    >
                        <span className="material-icons text-xl">
                            {visible ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                </div>
                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <span className="material-icons text-xs">error</span>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
