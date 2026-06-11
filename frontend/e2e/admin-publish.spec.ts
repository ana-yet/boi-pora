import { test, expect } from "@playwright/test";
import {
  adminApi,
  deleteBook,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from "./helpers";
import type { APIRequestContext } from "@playwright/test";

/**
 * Draft lifecycle: admin creates a draft via the UI, the draft is invisible
 * publicly, publishing makes it visible.
 */
test.describe("admin draft → publish", () => {
  let api: APIRequestContext;
  let bookId: string | null = null;
  const stamp = Date.now();
  const title = `E2E Draft ${stamp}`;
  const slug = `e2e-draft-${stamp}`;

  test.beforeAll(async () => {
    api = await adminApi();
  });

  test.afterAll(async () => {
    if (api && bookId) await deleteBook(api, bookId);
    await api?.dispose();
  });

  test("draft is hidden until published", async ({ page }) => {
    // Admin login through the UI.
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    await page.waitForURL("/");

    // Create a draft book via the admin UI.
    await page.goto("/admin/books/new");
    await page.getByLabel(/title/i).first().fill(title);
    await page.getByLabel(/slug/i).fill(slug);
    await page.getByLabel(/author/i).first().fill("Playwright Admin");
    await page.getByRole("button", { name: /save|create/i }).first().click();
    await page.waitForURL(/\/admin\/books/);

    // Resolve the created book id via the admin API.
    const adminList = await api.get(
      `/api/v1/admin/books?search=${encodeURIComponent(title)}`
    );
    const listJson = await adminList.json();
    expect(listJson.items.length).toBe(1);
    bookId = listJson.items[0]._id;
    expect(listJson.items[0].status).toBe("draft");

    // Publicly invisible while draft.
    const publicRes = await api.get(`/api/v1/books/slug/${slug}`);
    expect(publicRes.status()).toBe(404);
    await page.goto(`/fiction/${slug}`);
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();

    // Publish via the admin API (same backend path the UI button uses).
    const patch = await api.patch(`/api/v1/books/${bookId}/status`, {
      data: { status: "published" },
    });
    expect(patch.ok()).toBeTruthy();

    // Now publicly visible.
    const publishedRes = await api.get(`/api/v1/books/slug/${slug}`);
    expect(publishedRes.ok()).toBeTruthy();
  });
});
