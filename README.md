# Boi Pora (বই পড়া)

A full-stack digital reading platform: browse books, read chapters in a focused reader, manage your library and progress, and run an admin workspace for catalog content. The stack is **Next.js** (App Router) on the frontend and **NestJS** with **MongoDB** on the backend.

## Repository layout

```
boi-pora/
├── frontend/          # Next.js 16 — public site, reader, library, admin UI
├── backend/           # NestJS 11 API — auth, books, chapters, reviews, etc.
├── docker-compose.yml # Optional local MongoDB
├── package.json       # Root scripts (installs both apps on postinstall)
└── README.md
```

## Features

- **Catalog** — Books with metadata (language, category, cover, slug), chapter list, book detail and reviews.
- **Reader** — Themed reading view, TOC and section navigation, fullscreen, typography settings.
- **Inline translation** — Press-and-hold a word; server calls [Langbly](https://langbly.com/docs/) (Google Translate v2–compatible). Source language follows the book’s catalog language; target is user-selectable.
- **Chapter AI summary** — Optional Groq-powered summary per chapter, cached in MongoDB and reused for all users until chapter body changes. Copy-as-Markdown in the reader UI.
- **Accounts** — JWT auth, roles (including admin), library and reading progress APIs.

## Prerequisites

- **Node.js** 20 or newer  
- **MongoDB** 6+ (local, Docker, or Atlas)

## Quick start (local)

### 1. MongoDB

Either install MongoDB locally, or start the bundled Compose service:

```bash
docker compose up -d
```

This exposes MongoDB on `localhost:27017` (database name `boi-pora`).

### 2. Backend API

```bash
cd backend
cp .env.example .env
# Edit .env — at minimum MONGODB_URI, JWT_SECRET, CORS_ORIGIN (see below)
npm install
npm run seed    # Creates admin user (see seed output for credentials)
npm run start:dev
```

API listens on **http://localhost:4000** by default (`PORT` in `.env`).

### 3. Frontend

In a second terminal:

```bash
cd frontend
# Optional: copy .env.local.example → .env.local and set API URL, site URL for OG tags
# NEXT_PUBLIC_API_URL=http://localhost:4000
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm install
npm run dev
```

Add your branding asset **`public/favicon.png`** (used as the favicon, PWA manifest icon, and default Open Graph / Twitter image until a page supplies its own image).

Open **http://localhost:3000**. The browser calls the API using `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`).

### One-shot install from repo root

```bash
npm install          # postinstall installs frontend + backend dependencies
```

Then configure `backend/.env`, run `npm run seed --prefix backend`, and start `npm run dev:api` and `npm run dev` in two terminals (or use the `cd` flows above).

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET` | Signing secret for access tokens |
| `CORS_ORIGIN` | Allowed browser origin(s), comma-separated (e.g. `http://localhost:3000`) |
| `PORT` | API port (default `4000`) |
| `ADMIN_SEED_PASSWORD` | Password for the seeded admin user |
| `LANGBLY_API_KEY` | Optional — enables reader inline translation ([Langbly](https://langbly.com/docs/)) |
| `LANGBLY_API_BASE_URL` | Optional Langbly base URL |
| `GROQ_API_KEY` | Optional — enables AI chapter summaries ([Groq](https://console.groq.com/)) |
| `GROQ_MODEL` | Optional Groq chat model id (default `llama-3.3-70b-versatile`) |

See `backend/.env.example` for comments and deployment notes.

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Public API base URL (no trailing slash). Defaults to `http://localhost:4000` if unset. |
| `NEXT_PUBLIC_SITE_URL` | Public **site** URL (no trailing slash) for Open Graph, Twitter cards, and JSON-LD. Defaults to `http://localhost:3000`. Set to your production domain at build time. |

## Root npm scripts

| Script | Description |
|--------|-------------|
| `npm install` | Installs root, then `frontend` and `backend` (postinstall) |
| `npm run dev` | Next.js dev server (`frontend`) |
| `npm run dev:api` | NestJS watch mode (`backend`) |
| `npm run build` | Production build of the frontend |
| `npm run build:api` | Compile the backend to `backend/dist` |
| `npm run start` | Start Next.js production server |
| `npm run start:api` | Run compiled Nest app |
| `npm run seed` | Run backend seed (admin user, etc.) |
| `npm run lint` | Frontend lint |

## API overview

Base path: **`/api/v1`**.

- **Auth** — `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` (JWT for protected routes).
- **Books & chapters** — Public reads for lists, by slug/id, and chapter payloads used by the reader.
- **Chapter summary** — `POST /chapters/book/:bookId/:chapterId/summary` (public, throttled) — returns cached Markdown summary or generates via Groq when configured.
- **Translate** — `POST /translate` (public, throttled) — Langbly-backed text translation.
- **Library, reviews, reading progress** — Authenticated user flows.
- **Admin** — JWT + admin role for users, books, chapters, moderation-style listings.

For a longer endpoint list, see `backend/README.md`.

## Production notes

- Set **`CORS_ORIGIN`** to your real frontend URL (multiple values allowed, comma-separated).
- Set **`NEXT_PUBLIC_API_URL`** on the frontend build to the public API URL.
- Use a strong **`JWT_SECRET`** and secure **`MONGODB_URI`** (e.g. Atlas with TLS).
- Optional features: without **`LANGBLY_API_KEY`**, inline translate fails gracefully; without **`GROQ_API_KEY`**, chapter summary returns a clear “not configured” response.

## Tech stack

| Area | Choices |
|------|---------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, SWR, react-markdown |
| Backend | NestJS 11, Mongoose, Passport JWT, class-validator, throttling |
| Data | MongoDB |
| External | Langbly (translation), Groq OpenAI-compatible chat (summaries) |

---

**Boi Pora** — built for reading and managing books in one place.
