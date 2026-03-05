const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
  archived: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  saved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  reading: "bg-primary/10 text-primary",
  finished: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  admin: "bg-primary/10 text-primary",
  user: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style} ${className}`}>
      {status}
    </span>
  );
}
