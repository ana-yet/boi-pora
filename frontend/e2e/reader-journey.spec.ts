import { test, expect } from "@playwright/test";
import {
  adminApi,
  seedBook,
  deleteBook,
  uniqueUser,
  type SeededBook,
} from "./helpers";
import type { APIRequestContext } from "@playwright/test";

/**
 * Golden path: register → browse home → open a book → read a chapter →
 * save to library → leave a review.
 */
test.describe("reader journey", () => {
  let api: APIRequestContext;
  let book: SeededBook;

  test.beforeAll(async () => {
    api = await adminApi();
    book = await seedBook(api);
  });

  test.afterAll(async () => {
    if (api && book) await deleteBook(api, book.id);
    await api?.dispose();
  });

  test("register, read, save, review", async ({ page }) => {
    const user = uniqueUser();

    // Register through the UI.
    await page.goto("/register");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email address").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill(user.password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL("/");

    // Browse home.
    await expect(page).toHaveTitle(/Boi Pora/);

    // Open the seeded book.
    await page.goto(`/${book.category}/${book.slug}`);
    await expect(
      page.getByRole("heading", { name: book.title })
    ).toBeVisible();

    // Save to library.
    await page.getByRole("button", { name: /add to library/i }).click();
    await expect(
      page.getByRole("button", { name: /in library/i })
    ).toBeVisible();

    // Read the chapter.
    await page.getByRole("link", { name: /start reading/i }).click();
    await page.waitForURL(/\/read\//);
    await expect(page.getByText("Once upon a time in an e2e test")).toBeVisible();

    // Back to the book page — leave a review.
    await page.goto(`/${book.category}/${book.slug}`);
    const reviewBox = page.getByPlaceholder(/share your thoughts/i);
    await reviewBox.scrollIntoViewIfNeeded();
    // Pick a 5-star rating (first rating widget button group).
    await page
      .locator("form")
      .filter({ hasText: "Write a Review" })
      .locator("button[type='button']")
      .nth(4)
      .click();
    await reviewBox.fill("Excellent automated read!");
    await page.getByRole("button", { name: /submit review/i }).click();
    await expect(page.getByText("Excellent automated read!")).toBeVisible();

    // The saved book appears in the library.
    await page.goto("/library");
    await expect(page.getByText(book.title).first()).toBeVisible();
  });
});
