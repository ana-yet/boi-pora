import type { Metadata } from "next";
import { OfflineShell } from "./_components/OfflineShell";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

// Precached by the service worker and served as the navigation fallback
// while offline. All real work happens client-side in OfflineShell.
export default function OfflinePage() {
  return <OfflineShell />;
}
