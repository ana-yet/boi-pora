export default function ReaderChapterLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background-light dark:bg-background-dark px-6">
      <span
        className="inline-block h-10 w-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
        aria-hidden
      />
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Opening chapter…</p>
      <span className="sr-only">Loading chapter</span>
    </div>
  );
}
