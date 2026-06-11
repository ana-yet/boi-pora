# ADR 006 — Atlas Search for catalog search and autocomplete

**Status:** Accepted (implemented, with fallback)

## Context

Search used a regex `$or` across title/author — no relevance ranking, no typo
tolerance, no autocomplete, and `$regex` can't use indexes for contains-style
queries.

## Decision

Use MongoDB Atlas Search (`$search` aggregation) with a compound query:
boosted title match, author/description matches, and fuzzy matching for typo
tolerance. Add a throttled, cached `GET /books/autocomplete` endpoint built on
the `autocomplete` operator for type-ahead suggestions.

Because Atlas Search only exists on Atlas, `BooksService` detects failures and
falls back to the legacy regex search (`legacySearch`) so local development
and CI (mongodb-memory-server) keep working without an Atlas cluster.

## Consequences

- Relevance-ranked, typo-tolerant search with zero extra infrastructure.
- The search index definition lives in Atlas, not in the repo — documented in
  the README; recreate it when pointing at a new cluster.
- Search behavior differs slightly between Atlas (prod) and fallback (dev);
  tests assert on the fallback path.
