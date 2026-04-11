import Link from "next/link";

export default function ReaderChapterNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark">
      <span className="material-icons text-5xl text-neutral-300 dark:text-neutral-600 mb-4" aria-hidden>
        menu_book
      </span>
      <p className="text-neutral-800 dark:text-white font-medium mb-1">Chapter not found</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
        This chapter may have been removed or the link is incorrect.
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
      >
        Browse books
        <span className="material-icons text-lg" aria-hidden>
          arrow_forward
        </span>
      </Link>
    </div>
  );
}
