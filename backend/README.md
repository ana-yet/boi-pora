# Boi Pora API (backend)

NestJS service for **Boi Pora**. Full setup, environment variables, and product overview are in the **[repository root README](../README.md)**.

## Quick reference

```bash
cp .env.example .env   # configure MONGODB_URI, JWT_SECRET, CORS_ORIGIN, etc.
npm install
npm run seed           # admin user (see seed script / console output)
npm run start:dev      # http://localhost:4000
```

## Endpoint cheat sheet

| Area | Examples |
|------|----------|
| Auth | `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| Books | `GET /api/v1/books`, `GET /api/v1/books/:id`, `GET /api/v1/books/slug/:slug` |
| Chapters | `GET /api/v1/chapters/book/:bookId`, `GET /api/v1/chapters/book/:bookId/:chapterId` |
| Summary | `POST /api/v1/chapters/book/:bookId/:chapterId/summary` |
| Translate | `POST /api/v1/translate` |
| Admin | `GET /api/v1/admin/stats`, user/book/chapter CRUD under `/api/v1/admin` and guarded book/chapter mutations |

Admin routes require JWT and **admin** role. Many book/chapter reads are `@Public()` for the storefront and reader.
