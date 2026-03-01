# Boi Pora Backend – Full Plan (Admin Dashboard Focus)

## 1. Overview

Backend API for Boi Pora with **admin dashboard** to manage users, books, chapters, and content. REST API with JWT auth and admin-only endpoints.

## 2. Architecture

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/           # Env, DB config
│   ├── common/           # Guards, pipes, filters, decorators
│   ├── schemas/          # Mongoose schemas
│   └── modules/
│       ├── auth/         # Login, JWT, admin guard
│       ├── users/        # User CRUD + admin
│       ├── books/        # Book CRUD + admin
│       ├── chapters/     # Chapter CRUD + admin
│       ├── library/      # User library (read)
│       ├── reading/      # Progress, highlights (read)
│       ├── reviews/      # Reviews (read)
│       └── admin/        # Aggregated admin stats & actions
```

## 3. API Design

| Prefix | Purpose |
|--------|---------|
| `/api/v1/auth` | Login, me, refresh |
| `/api/v1/admin/*` | All admin endpoints (protected) |
| `/api/v1/users` | User management (admin) |
| `/api/v1/books` | Book CRUD (admin create/update/delete; public read) |
| `/api/v1/chapters` | Chapter CRUD (admin) |
| `/api/v1/library` | User library (future: user-scoped) |
| `/api/v1/reading` | Progress, highlights (future) |
| `/api/v1/reviews` | Reviews (future) |

## 4. MongoDB Collections

- **users** – email, passwordHash, name, role (user|admin)
- **books** – title, slug, author, description, coverUrl, category, genres, pageCount, rating
- **chapters** – bookId, chapterId, title, content
- **library_items** – userId, bookId, status
- **reading_progress** – userId, bookId, chapterId, percentComplete
- **highlights** – userId, bookId, chapterId, quote, note
- **reviews** – userId, bookId, rating, content

## 5. Admin Endpoints

- `GET /api/v1/admin/stats` – Dashboard stats (users, books, chapters)
- `GET/POST/PUT/DELETE /api/v1/admin/users`
- `GET/POST/PUT/DELETE /api/v1/admin/books`
- `GET/POST/PUT/DELETE /api/v1/admin/books/:bookId/chapters`
- `GET /api/v1/admin/library` – List all library items
- `GET /api/v1/admin/reviews` – List all reviews

## 6. Auth

- JWT access token (15m)
- Admin role required for `/admin/*` and write operations
- bcrypt for password hashing

## 7. Security

- Rate limiting (future)
- Helmet
- CORS
- Validation via class-validator
