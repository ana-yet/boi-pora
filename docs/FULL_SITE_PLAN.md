# Boi Pora — Full Site Plan: Admin Dashboard, User Roles & Dynamic Routes

## 1. Overview

This document outlines how to build the admin dashboard, user roles, user data flow, and make every route dynamic across the Boi Pora platform.

---

## 2. User Roles

| Role  | Access |
|-------|--------|
| **admin** | Full access: manage users, books, chapters, library, reviews. Admin dashboard. |
| **user**  | Browse, search, read books. Personal library (saved books, progress). Profile. |

**Role enforcement:**
- **Backend**: `@Roles('admin')` + `RolesGuard` on admin routes; JWT required for user-scoped routes.
- **Frontend**: Redirect non-admin from `/admin/*`; show/hide admin nav link by role.

---

## 3. Admin Dashboard — Structure & Routes

### 3.1 Admin Route Layout

```
/admin                          → Dashboard overview (stats, recent activity)
/admin/users                    → User list (table, search, pagination)
/admin/users/new                → Create user
/admin/users/[id]               → Edit user
/admin/books                    → Book list (table, filters)
/admin/books/new                → Add book
/admin/books/[id]               → Edit book + chapter list
/admin/books/[id]/chapters/new  → Add chapter
/admin/books/[id]/chapters/[cid]→ Edit chapter
/admin/library                  → All library items (admin view)
/admin/reviews                  → All reviews (moderate/delete)
```

### 3.2 Admin UI Components (reusable)

| Component       | Purpose |
|----------------|---------|
| AdminLayout    | Sidebar nav, header, role guard |
| AdminSidebar   | Links: Dashboard, Users, Books, Library, Reviews |
| DataTable      | Sortable, filterable table with actions |
| FormBook       | Create/edit book form |
| FormChapter    | Create/edit chapter form (rich text for content) |
| FormUser       | Create/edit user form |
| StatsCards     | Users, Books, Chapters, Library, Reviews counts |

### 3.3 Admin Features

- **Dashboard**: Stats from `GET /api/v1/admin/stats`, recent users/books.
- **Users**: CRUD via `GET|POST|PUT|DELETE /api/v1/admin/users`.
- **Books**: CRUD via `GET|POST|PUT|DELETE /api/v1/books`; chapters via `GET|POST|PUT|DELETE /api/v1/chapters`.
- **Library**: `GET /api/v1/admin/library` (paginated).
- **Reviews**: `GET /api/v1/admin/reviews` (paginated); future: delete/flag.

---

## 4. User Data in Frontend

### 4.1 Auth & User State

| Source      | Usage |
|------------|--------|
| `useAuth()` | `user` (id, email, name, role), `isAuthenticated`, `login`, `logout` |
| `GET /api/v1/auth/me` | Hydrate user after login / page load |
| LocalStorage | JWT for API requests |

### 4.2 Where User Data Shows

| Location     | Data | API |
|-------------|------|-----|
| Navbar      | Avatar, name (if logged in); dropdown: Profile, Library, Logout | `useAuth().user` |
| Library     | Saved books, reading progress | `GET /api/v1/library`, `GET /api/v1/reading/progress` |
| Home        | Continue Reading, recommendations | `GET /api/v1/reading/progress`, `GET /api/v1/books?…` |
| Profile     | Name, email, avatar | `useAuth().user` + `GET /api/v1/auth/me` |
| Admin nav   | "Admin" link only if `user.role === 'admin'` | `useAuth().user` |

### 4.3 User Avatar

- Use `user.avatarUrl` from backend, or fallback to initials/placeholder.

---

## 5. Backend Gaps to Fill

### 5.1 New Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/books/search` | GET | Public | Search by title, author, description (query param `q`) |
| `/api/v1/library` | GET | User | Current user's library items |
| `/api/v1/library` | POST | User | Add book to library |
| `/api/v1/library/:bookId` | DELETE | User | Remove from library |
| `/api/v1/reading/progress` | GET | User | Current user's reading progress |
| `/api/v1/reading/progress` | POST/PUT | User | Update progress for a book/chapter |
| `/api/v1/reviews` | GET | Public | Reviews for a book (query `bookId`) |
| `/api/v1/reviews` | POST | User | Create review |
| `/api/v1/reviews/:id` | DELETE | User/Admin | Delete own review or admin delete any |

### 5.2 Books Search

- Add `GET /api/v1/books/search?q=…` using Mongoose text index on `title`, `author`, `description`.

---

## 6. Dynamic Routes — Route-by-Route Plan

### 6.1 Home (`/`)

| Section          | Current | Dynamic Source |
|-----------------|---------|----------------|
| Hero            | Static  | Keep static |
| Continue Reading| Mock    | `GET /api/v1/reading/progress` (user) or hide when guest |
| RecommendationRow | Mock  | `GET /api/v1/books?limit=5&category=…` or similar |
| CategoryGrid    | Static  | `GET /api/v1/books` grouped by category, or static categories |
| ShortReads      | Mock    | `GET /api/v1/books?maxReadTime=120` (if backend supports) |

### 6.2 Explore (`/explore`)

| Section  | Current | Dynamic Source |
|----------|---------|----------------|
| BookGrid | ✅ API | `GET /api/v1/books` (already done) |
| MoodFilter | Static | Map to category/genre query params |

### 6.3 Explore sub-routes (`/explore/trending`, `/explore/new`)

| Route | Dynamic Source |
|-------|----------------|
| `/explore/trending` | `GET /api/v1/books?sort=rating` or `?sort=ratingCount` |
| `/explore/new` | `GET /api/v1/books?sort=createdAt` |

### 6.4 Book Detail (`/[category]/[slug]`)

| Section       | Current | Dynamic Source |
|--------------|---------|----------------|
| Book info    | Mock    | `GET /api/v1/books/slug/:slug` |
| Related books| Mock    | `GET /api/v1/books?category=…&limit=6` (exclude current) |

**Note**: `[category]` may be redundant if slug is unique; can use `/books/[slug]` or keep for SEO.

### 6.5 Reader (`/read/[bookId]/[chapterId]`)

| Section   | Current | Dynamic Source |
|----------|---------|----------------|
| Chapter  | Mock    | `GET /api/v1/chapters/book/:bookId/:chapterId` or by book slug |
| Book title| Mock   | From chapter response or `GET /api/v1/books/:id` |
| Prev/Next| Mock    | `GET /api/v1/chapters/book/:bookId` for chapter list |

**URL choice**: Use `bookId` = MongoDB `_id` or `slug`. If slug: add backend `GET /chapters/book-slug/:slug/:chapterId`.

### 6.6 Search (`/search`)

| Section | Current | Dynamic Source |
|---------|---------|----------------|
| Results | Mock filter | `GET /api/v1/books/search?q=…` |

### 6.7 Library (`/library`)

| Section         | Current | Dynamic Source |
|----------------|---------|----------------|
| CurrentlyReading | Mock  | `GET /api/v1/reading/progress` + book details |
| SavedBooksGrid | Mock   | `GET /api/v1/library` + book details |
| ReadingStats   | Mock   | Aggregate from progress |
| InsightsList   | Mock   | Derived from progress / library |

**Auth**: Require login; redirect to `/login` if not authenticated.

### 6.8 Auth Routes

| Route | Dynamic |
|-------|---------|
| `/login` | ✅ Uses API |
| `/register` | Wire to `POST /api/v1/auth/register` (add backend) |
| `/forgot-password` | Future: backend flow |

### 6.9 Admin Routes (new)

| Route | Dynamic Source |
|-------|----------------|
| `/admin` | `GET /api/v1/admin/stats` |
| `/admin/users` | `GET /api/v1/admin/users` |
| `/admin/books` | `GET /api/v1/books` (admin has full access) |
| etc. | Per section above |

---

## 7. Frontend Implementation Order

### Phase 1 — Admin Dashboard (foundation)

1. Admin layout + route guard (redirect non-admin).
2. Admin dashboard page with stats.
3. Admin books list + add/edit book.
4. Admin book detail + chapter list + add/edit chapter.
5. Admin users list + add/edit user.
6. Admin library + reviews (read-only tables).

### Phase 2 — Backend Gaps

1. Add `GET /api/v1/books/search?q=…`.
2. Add user-scoped `GET/POST/DELETE /api/v1/library`.
3. Add `GET/POST/PUT /api/v1/reading/progress`.
4. Add `GET /api/v1/reviews?bookId=…`, `POST`, `DELETE`.

### Phase 3 — Dynamic Public Routes

1. Book detail `/[category]/[slug]` → API.
2. Reader `/read/[bookId]/[chapterId]` → API.
3. Search `/search` → API.
4. Explore trending/new → API with sort params.

### Phase 4 — User-Scoped Dynamic Routes

1. Library `/library` → API (require auth).
2. Home Continue Reading, Recommendations → API.
3. Navbar user menu (avatar, name, logout).

### Phase 5 — Polish

1. Profile page (optional).
2. Register flow.
3. Loading/error states, SEO metadata.

---

## 8. Route Summary

| Route | Auth | Data Source |
|-------|------|-------------|
| `/` | Optional | Progress (user), Books (public) |
| `/explore` | No | Books API |
| `/explore/trending` | No | Books API |
| `/explore/new` | No | Books API |
| `/search` | No | Books Search API |
| `/[category]/[slug]` | No | Book by slug |
| `/read/[bookId]/[chapterId]` | Optional | Chapters API |
| `/library` | Yes | Library + Progress API |
| `/login` | No | Auth API |
| `/register` | No | Auth API (to add) |
| `/admin/*` | Admin | Admin API |

---

## 9. File Structure (Frontend)

```
app/
├── (admin)/                    # Admin route group
│   ├── layout.tsx              # AdminLayout + role guard
│   ├── admin/
│   │   ├── page.tsx            # Dashboard
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── books/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── chapters/
│   │   │           ├── new/page.tsx
│   │   │           └── [cid]/page.tsx
│   │   ├── library/page.tsx
│   │   └── reviews/page.tsx
├── (public)/
│   ├── page.tsx                # Home (dynamic)
│   ├── search/page.tsx         # Dynamic
│   ├── library/page.tsx        # Dynamic, auth required
│   ├── [category]/[slug]/page.tsx  # Dynamic
│   └── ...
├── (reader)/read/[bookId]/[chapterId]/page.tsx  # Dynamic
├── (explore)/explore/...       # Dynamic (partial)
└── (auth)/login|register/...   # Auth
```

---

## 10. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  useAuth() ──► user, token                                      │
│  useBooks(), useBook(slug), useChapters(bookId)                  │
│  useLibrary(), useReadingProgress()  (user-scoped)               │
│  useAdminStats(), useAdminUsers(), ...  (admin)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ JWT, fetch
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
├─────────────────────────────────────────────────────────────────┤
│  /auth/login, /auth/me, /auth/register (future)                  │
│  /books, /books/search, /books/slug/:slug, /books/:id            │
│  /chapters/book/:bookId, /chapters/book/:bookId/:chapterId       │
│  /library (user), /reading/progress (user)                       │
│  /admin/stats, /admin/users, /admin/library, /admin/reviews      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MONGODB                                  │
│  users, books, chapters, library_items, reading_progress, reviews│
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Quick Reference

- **Admin login**: `admin@boipora.com` / `admin123`
- **Admin route guard**: Check `useAuth().user?.role === 'admin'`; redirect to `/` if not.
- **Library/Progress**: Require `useAuth().isAuthenticated`; redirect to `/login` if not.
- **All book/chapter reads**: Public; writes (admin) require JWT + admin role.
