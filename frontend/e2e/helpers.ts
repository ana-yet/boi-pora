import { expect, request, type APIRequestContext } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL || "http://localhost:4000";
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "admin@boipora.com";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "";

export interface SeededBook {
  id: string;
  slug: string;
  title: string;
  category: string;
}

/** API context authenticated as the seed admin (Bearer token). */
export async function adminApi(): Promise<APIRequestContext> {
  if (!ADMIN_PASSWORD) {
    throw new Error(
      "E2E_ADMIN_PASSWORD is required (the seed admin password)."
    );
  }
  const ctx = await request.newContext({ baseURL: API_URL });
  const res = await ctx.post("/api/v1/auth/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  const { accessToken } = await res.json();
  await ctx.dispose();
  return request.newContext({
    baseURL: API_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

/** Create a published book with one chapter via the admin API. */
export async function seedBook(api: APIRequestContext): Promise<SeededBook> {
  const stamp = Date.now();
  const slug = `e2e-book-${stamp}`;
  const bookRes = await api.post("/api/v1/books", {
    data: {
      title: `E2E Book ${stamp}`,
      slug,
      author: "Playwright",
      category: "fiction",
      description: "Seeded by the e2e suite.",
      status: "published",
    },
  });
  expect(bookRes.ok()).toBeTruthy();
  const book = await bookRes.json();
  const id = book._id ?? book.id;

  const chapterRes = await api.post("/api/v1/chapters", {
    data: {
      bookId: id,
      chapterNumber: 1,
      chapterId: "chapter-1",
      title: "Chapter One",
      content: "# Chapter One\n\nOnce upon a time in an e2e test...",
    },
  });
  expect(chapterRes.ok()).toBeTruthy();

  return { id, slug, title: `E2E Book ${stamp}`, category: "fiction" };
}

export async function deleteBook(api: APIRequestContext, id: string) {
  await api.delete(`/api/v1/books/${id}`);
}

export function uniqueUser() {
  const stamp = Date.now();
  return {
    name: `E2E Reader ${stamp}`,
    email: `e2e-reader-${stamp}@example.com`,
    password: "E2e-test-password-1!",
  };
}
