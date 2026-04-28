"use client";

export default function ReaderError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {error.message || "Failed to load the chapter"}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}