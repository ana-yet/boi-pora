import Link from "next/link";
import { AuthGuard } from "@/app/components/AuthGuard";
import { LibraryHeader } from "./_components/LibraryHeader";
import { CurrentlyReading } from "./_components/CurrentlyReading";
import { LibraryTabs } from "./_components/LibraryTabs";
import { ReadingStats } from "./_components/ReadingStats";
import { RecentActivity } from "./_components/RecentActivity";

export default function LibraryPage() {
  return (
    <AuthGuard>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <LibraryHeader />
          <CurrentlyReading />
          <LibraryTabs />
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <ReadingStats />
          <RecentActivity />
        </aside>
        <div className="fixed bottom-8 right-8 z-50 lg:hidden">
          <Link
            href="/explore"
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <span className="material-icons text-2xl">add</span>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
