import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = "", id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-foreground"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={twMerge(
                        "w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500",
                        error && "border-error focus:ring-error/30 focus:border-error",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-error">{error}</p>
                )}
                {helperText && !error && (
                    <p className="text-xs text-muted-light">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
