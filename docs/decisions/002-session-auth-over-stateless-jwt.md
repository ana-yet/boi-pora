# ADR 002 — Server-side sessions with rotating refresh tokens (not stateless JWT)

**Status:** Accepted (implemented)

## Context

The original auth used a long-lived JWT stored in `localStorage`. That meant no
revocation, XSS-readable credentials, and no notion of devices/sessions.

## Decision

- Short-lived (15 min) JWT **access tokens** held in memory on the client only.
- Opaque **refresh tokens** in an `HttpOnly` cookie, stored hashed (SHA-256) in
  a `sessions` collection with a TTL index.
- **Rotation with reuse detection**: every refresh issues a new token in the
  same `familyId`; presenting an already-rotated token revokes the entire
  family (stolen-token replay defense).
- Session management endpoints (`GET /auth/sessions`, `DELETE
  /auth/sessions/:id`, `POST /auth/logout-all`) power a devices UI.
- A non-HttpOnly **hint cookie** (no credentials in it) lets Next.js middleware
  redirect unauthenticated users away from protected routes without an API call.

## Consequences

- Logout, password reset, and per-device revocation actually work.
- One DB read per refresh (every ~15 min per active client) — negligible load.
- Sessions live in MongoDB; if auth QPS ever matters they move to Redis
  (see `docs/scaling.md`) without changing the token contract.
