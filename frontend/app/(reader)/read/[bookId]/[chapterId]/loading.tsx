export default function ReaderLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading chapter...
        </p>
      </div>
    </div>
  );
}