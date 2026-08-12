# ADR 005 — PWA for offline/mobile, not a native app

**Status:** Accepted (implemented)

## Context

"Read on the bus" is the core mobile use case. Options: native app (React
Native/Expo), or make the web app installable with offline reading.

## Decision

Ship a PWA: web manifest + hand-rolled service worker (`frontend/public/sw.js`)
registered from a client component. A framework SW plugin was deliberately
avoided because the app deploys through `@opennextjs/cloudflare`, and build
plugins that rewrite the output tend to fight that pipeline.

Offline strategy:

- **App shell**: precache `/offline` fallback + core static assets;
  stale-while-revalidate for `/_next/static`.
- **Books**: explicit per-book "make available offline" in the library, stored
  in Cache Storage under real API URLs (`lib/offline-books.ts`), so the SW can
  serve them as a transparent network fallback.
- **Never** cache authenticated API responses generically.
- Reading progress made offline queues in `localStorage` and flushes on
  `online`.

## Consequences

- One codebase, installable on Android/iOS, offline reading works.
- No push notifications on iOS-without-install and no app-store presence —
  acceptable; neither is core to reading.
- SW updates are user-prompted (skipWaiting toast) to avoid white-screens.
