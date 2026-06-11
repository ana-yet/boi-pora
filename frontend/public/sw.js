/* Boi Pora service worker — hand-rolled for @opennextjs/cloudflare compat. */

const VERSION = "v1";
const SHELL_CACHE = `bp-shell-${VERSION}`;
const ASSET_CACHE = `bp-assets-${VERSION}`;
// Managed from page code (lib/offline-books.ts) — never purged on activate.
const OFFLINE_BOOKS_CACHE = "bp-offline-books-v1";

const OFFLINE_FALLBACK = "/offline";
const PRECACHE = [
  OFFLINE_FALLBACK,
  "/site.webmanifest",
  "/favicon.png",
  "/placeholder-cover.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSET_CACHE, OFFLINE_BOOKS_CACHE]);
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("bp-") && !keep.has(n))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true;
  return /\.(css|js|woff2?|png|jpe?g|webp|avif|svg|ico)$/.test(url.pathname);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok || res.type === "opaque") {
        cache.put(request, res.clone()).catch(() => {});
      }
      return res;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    // Offline: serve the offline fallback shell. It inspects the original
    // URL client-side and renders downloaded chapters from Cache Storage.
    const cache = await caches.open(SHELL_CACHE);
    const fallback = await cache.match(OFFLINE_FALLBACK);
    return fallback || Response.error();
  }
}

async function handleApiGet(request) {
  try {
    return await fetch(request);
  } catch {
    // Offline: downloaded book/chapter JSON lives in the offline books cache
    // under its real URL, so a plain match serves it transparently.
    const cached = await caches.match(request, {
      cacheName: OFFLINE_BOOKS_CACHE,
    });
    return cached || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (url.origin === self.location.origin && isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API requests: network-only, with offline-books fallback for downloaded
  // content. Authenticated responses are intentionally never cached here.
  if (url.pathname.startsWith("/api/")) {
    if (!request.headers.has("Authorization")) {
      event.respondWith(handleApiGet(request));
    }
    return;
  }

  // Cross-origin covers (cached during book download) — serve when offline.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request, {
          cacheName: OFFLINE_BOOKS_CACHE,
        });
        return cached || Response.error();
      })
    );
  }
});
