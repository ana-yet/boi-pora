"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { LibraryHeader } from "./_components/LibraryHeader";
import { CurrentlyReading } from "./_components/CurrentlyReading";
import { LibraryTabs } from "./_components/LibraryTabs";
import { SavedBooksGrid } from "./_components/SavedBooksGrid";
import { ReadingStats } from "./_components/ReadingStats";
import { InsightsList } from "./_components/InsightsList";

export default function LibraryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login?redirect=" + encodeURIComponent("/library"));
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="inline-block h-8 w-8 border-2 border-primary border-r-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-12">
        <LibraryHeader />
        <CurrentlyReading />
        <LibraryTabs>
          <SavedBooksGrid />
        </LibraryTabs>
      </div>
      <aside className="lg:col-span-4 space-y-8">
        <ReadingStats />
        <InsightsList />
      </aside>
      <div className="fixed bottom-8 right-8 z-50 lg:hidden">
        <a
          href="/explore"
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-icons text-2xl">add</span>
        </a>
      </div>
    </div>
  );
}
