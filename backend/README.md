# Boi Pora Backend

NestJS API for the Boi Pora admin dashboard. JWT auth, MongoDB, and admin-only endpoints.

## Setup

1. **Environment**

   ```bash
   cp .env.example .env
   # Edit .env: MONGODB_URI, JWT_SECRET, etc.
   ```

2. **MongoDB**

   Start MongoDB locally or with Docker:

   ```bash
   docker-compose up -d
   ```

3. **Install & run**

   ```bash
   npm install
   npm run seed    # Create admin user (admin@boipora.com / admin123)
   npm run start:dev
   ```

   API runs at `http://localhost:4000` by default.

## API Endpoints

### Auth (public)
- `POST /api/v1/auth/login` – Login (body: `{ email, password }`)

### Auth (JWT)
- `GET /api/v1/auth/me` – Current user

### Books (public read)
- `GET /api/v1/books` – List books (query: page, limit, category, status)
- `GET /api/v1/books/slug/:slug` – Book by slug
- `GET /api/v1/books/:id` – Book by ID

### Chapters (public read)
- `GET /api/v1/chapters/book/:bookId` – Chapters by book
- `GET /api/v1/chapters/book/:bookId/:chapterId` – Chapter by book + chapterId
- `GET /api/v1/chapters/:id` – Chapter by ID

### Admin (JWT + admin role)
- `GET /api/v1/admin/stats` – Dashboard stats
- `GET|POST|PUT|DELETE /api/v1/admin/users` – User CRUD
- `POST|PUT|DELETE /api/v1/books` – Book create/update/delete
- `POST|PUT|DELETE /api/v1/chapters` – Chapter create/update/delete
- `GET /api/v1/admin/library` – All library items
- `GET /api/v1/admin/reviews` – All reviews
