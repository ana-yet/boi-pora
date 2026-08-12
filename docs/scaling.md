# Scaling seams

The system is deliberately small (solo developer, free tiers). These are the
pre-identified seams to widen **when a metric demands it** — not before.

| Pressure signal | Seam | Change |
|---|---|---|
| API p95 rises on public reads | Cloudflare in front of the API domain | Add CF cache rules for `GET /api/v1/books*` and chapter payloads (they are public and ISR-friendly). Zero code change. |
| Render free instance sleeps / CPU throttles | Render plan | Flip to a paid Render instance. Keep-alive ping becomes unnecessary. |
| Atlas M0 storage/connection limits | Atlas tier | Upgrade cluster tier in place. Indexes and Atlas Search definitions carry over. |
| Auth refresh QPS or session lookups show in profiles | Session store | Move the `sessions` collection behind a small repository interface to Redis (Upstash). Token contract (opaque cookie + rotation) is unchanged. |
| AI summary latency blocks request threads | Queue behind `AiService` | The Groq call already sits behind a service interface with Mongo-cached results; swap the inline call for a queue (BullMQ/Upstash QStash) + poll/SSE without touching controllers. |
| Search volume outgrows Atlas Search free usage | Search interface | `BooksService.search` already isolates the `$search` pipeline with a legacy fallback; the same seam fits Typesense/Meilisearch if ever needed. |
| Cover/file uploads needed | Object storage | Add Cloudflare R2 with presigned uploads; store only URLs in MongoDB (schema already URL-based). |

## Explicit non-goals at current scale

- Microservices, Kubernetes, service meshes.
- Multi-region databases or read replicas.
- Custom observability stacks — add Sentry + structured pino logs first if
  diagnosing production issues becomes necessary.
