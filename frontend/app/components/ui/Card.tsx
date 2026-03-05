import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
    return (
        <div
            className={twMerge(
                "bg-surface border border-border rounded-xl p-6 transition-all duration-200",
                hover && "hover:shadow-lg hover:border-border-strong hover:-translate-y-0.5 cursor-pointer",
                className
            )}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
    return (
        <div className={twMerge("mb-4", className)}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
    return (
        <h3 className={twMerge("text-lg font-semibold text-foreground", className)}>
            {children}
        </h3>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
    return (
        <div className={twMerge("text-sm text-muted", className)}>
            {children}
        </div>
    );
}
