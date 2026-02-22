/**
 * Utility: Conditional class name concatenation
 * Usage: cn("base-class", isActive && "active-class", "always-class")
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(" ");
}

/**
 * Utility: Format a date to a localised string
 */
export function formatDate(date: Date | string, locale = "bn-BD"): string {
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
}

/**
 * Utility: Truncate a string to a max length
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Utility: Sleep for a given number of milliseconds (useful in dev/testing)
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
