export function LibraryHeader() {
    return (
        <header className="flex items-end justify-between">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-neutral-800 dark:text-white">
                    My Library
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    You&apos;ve read{" "}
                    <span className="text-primary font-semibold">
                        12 books
                    </span>{" "}
                    this year. Keep the momentum!
                </p>
            </div>
            <button className="flex items-center gap-2 bg-white dark:bg-surface-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm font-medium transition-all shadow-sm">
                <span className="material-icons text-primary text-lg">add</span>
                Add Book
            </button>
        </header>
    );
}
