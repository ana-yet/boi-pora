import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
    isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
    secondary:
        "bg-secondary text-white hover:bg-secondary-hover shadow-sm hover:shadow-md",
    outline:
        "border border-border text-foreground hover:bg-surface-hover hover:border-border-strong",
    ghost:
        "text-muted hover:text-foreground hover:bg-surface-hover",
    danger:
        "bg-error text-white hover:bg-error/90 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-xs px-3 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-xl",
};

export function Button({
    variant = "primary",
    size = "md",
    children,
    isLoading = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="inline-block h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {children}
        </button>
    );
}
