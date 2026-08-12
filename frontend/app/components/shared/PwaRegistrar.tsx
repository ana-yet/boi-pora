"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Registers the service worker, surfaces SW updates as a refresh prompt,
 * and shows a small indicator while the connection is offline.
 */
export function PwaRegistrar() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const offline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", () => {
            if (
              next.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(next);
            }
          });
        });
      })
      .catch(() => {});

    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );
    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
      void registration;
    };
  }, []);

  return (
    <>
      {offline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-60 flex items-center gap-1.5 bg-neutral-800 text-white text-xs font-medium rounded-full px-3 py-1.5 shadow-lg">
          <span className="material-icons text-sm" aria-hidden="true">
            cloud_off
          </span>
          Offline — downloaded books still work
        </div>
      )}
      {waiting && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm rounded-xl px-4 py-3 shadow-xl">
          <span>A new version is available.</span>
          <button
            onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}
            className="font-semibold text-primary hover:underline"
          >
            Refresh
          </button>
          <button
            onClick={() => setWaiting(null)}
            aria-label="Dismiss"
            className="material-icons text-base opacity-60 hover:opacity-100"
          >
            close
          </button>
        </div>
      )}
    </>
  );
}
