interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function EmptyState({
    icon = "📭",
    title,
    description,
    children,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted max-w-md">{description}</p>
            )}
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}
