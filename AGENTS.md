## Learned User Preferences

- Prefer committing and pushing completed work to the `develop` branch when asked to ship code.
- Prefer SSR/SSG/ISR for pages where possible; keep client components limited to interactive sections.
- Reader should stay minimal and distraction-free, with clear light/dark/sepia contrast and reading settings persisted in `localStorage` across chapter navigation.
- Inline translation should be press-and-hold on a word/sentence (not full-chapter), with a small UI that closes on outside click and does not dim the page; default source language from the book's language setting.
- Chapter AI summaries should use Groq, cache results in the database for reuse, show readable markdown with a copy action, and use friendly messaging when content is too large or the feature is unavailable.
- Leave Google social login as a coming-soon placeholder rather than wiring extra OAuth providers for now.
- Optimize for a solo developer personal/learning project: high product quality and maintainability, strong SEO and reading UX, and minimum unnecessary complexity—not enterprise scale.
- Prefer mobile-aware UX (e.g. hide reader fullscreen on mobile when it does not work; keep footers pinned during loading).

## Learned Workspace Facts

- Boi Pora (বই পড়া) is a full-stack digital reading platform: catalog, themeable reader, personal library with progress sync, offline PWA, and an admin workspace.
- Frontend is Next.js 16 (App Router) aimed at Cloudflare Workers; backend is NestJS 11 on Render; data is MongoDB Atlas with Atlas Search (regex fallback off-Atlas).
- The former Hono edge books API (`honobackend/`) was removed; keep a single NestJS API (see ADR 001).
- Auth uses short-lived in-memory access tokens plus rotating HttpOnly refresh cookies with server-side sessions and reuse detection.
- Public catalog pages use RSC + ISR (`revalidate = 120`); personalized UI stays in small client components.
- Optional AI integrations: Groq for cached chapter summaries and Langbly for press-and-hold translation; transactional mail via Resend.
- Hosting/budget context is free-tier oriented (Cloudflare + Render + Atlas); cold starts are mitigated with ISR and optional keep-alive rather than a second API.
- Active git branches commonly used in this repo include `main`, `develop`, and `cloudflare`.
