# ADR 001 — Delete the Hono edge books API

**Status:** Accepted (implemented)

## Context

A second backend (`honobackend/`, Hono on Cloudflare Workers) was added to serve
public book reads from the edge and mask Render free-tier cold starts. In
practice it covered roughly 12% of API surface (public book/chapter GETs only),
duplicated the data layer against the same Atlas cluster, doubled CORS/auth
edge cases, and — measured against a warm NestJS instance — was not faster for
this workload. It also leaked a MongoDB URI into version control via
`wrangler.jsonc`.

## Decision

Delete the Hono backend entirely. Keep a single NestJS API on Render. Handle
the cold-start problem with (a) a scheduled keep-alive ping against `/health`
and (b) ISR on the Next.js side so public pages are served from cache and
rarely hit the API synchronously.

## Consequences

- One API, one CORS policy, one auth model, one deploy target.
- Public pages depend on ISR-cached data, not a second runtime.
- A cold Render instance can still add latency to the first uncached request;
  accepted as a free-tier trade-off, mitigated by keep-alive.
