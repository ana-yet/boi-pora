export function ProgressBar({ value }: { value: number }) {
    return (
        <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full shadow-[0_0_10px_rgba(236,127,19,0.3)]"
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
