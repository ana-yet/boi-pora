# ADR 003 — RSC + ISR for all public pages

**Status:** Accepted (implemented)

## Context

Home, explore, book detail, and reader pages were client components fetching
via SWR on mount: blank-then-pop rendering, no SEO-meaningful HTML, and every
visitor hit the API directly (painful on a cold free-tier backend).

## Decision

Render all public, non-personalized pages as React Server Components with
ISR (`revalidate = 120`). The server fetches from the NestJS API at build/
revalidate time; visitors get full HTML from the CDN. Personalized fragments
(continue reading, library state, session UI) stay as small client components
that fetch with SWR after hydration.

## Consequences

- Public pages are fast, indexable, and resilient to API cold starts.
- Content changes take up to 2 minutes to appear — fine for a book catalog.
- Two data paths exist (server `fetch` helpers vs. client `api` wrapper);
  kept deliberately separate in `lib/server-fetch.ts` and `lib/api.ts`.
