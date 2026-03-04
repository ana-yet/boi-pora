"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <span className="material-icons text-5xl text-red-400 mb-4">warning</span>
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">
        Something went wrong
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
