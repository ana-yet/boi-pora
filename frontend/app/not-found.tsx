import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-8xl font-bold text-primary/20 mb-4">404</span>
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">
        Page not found
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/explore"
          className="px-6 py-2.5 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Explore Books
        </Link>
      </div>
    </div>
  );
}
