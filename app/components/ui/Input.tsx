import { InputHTMLAttributes, forwardRef } from "react";

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
                    className={`w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-background placeholder:text-muted-light transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${error
                            ? "border-error focus:ring-error/30 focus:border-error"
                            : "border-border hover:border-border-strong"
                        } ${className}`}
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
