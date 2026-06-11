# ADR 004 — MongoDB stays

**Status:** Accepted

## Context

The audit raised the question of migrating to Postgres (relational fit for
users/books/reviews, stronger constraints) versus keeping MongoDB Atlas.

## Decision

Keep MongoDB. Reasons, in order:

1. **The free tier does real work** — Atlas M0 plus Atlas Search covers
   catalog search, autocomplete, and TTL session expiry with zero extra infra.
2. The schema is document-shaped in practice: chapters are large text blobs,
   books are read-heavy denormalized documents, and the only "joins" are
   populate-on-read for library/progress.
3. A migration would consume weeks of the project budget for no user-visible
   gain.

Uniqueness and integrity are enforced with compound unique indexes
(`userId+bookId` on library/reviews/progress, `bookId+chapterId` on chapters)
plus DTO validation at the API boundary.

## Consequences

- No relational constraints beyond unique indexes; application code owns
  referential integrity (acceptable at this scale, revisit if multi-writer).
- Atlas Search ties search to MongoDB — a worthwhile coupling (see ADR 006).
