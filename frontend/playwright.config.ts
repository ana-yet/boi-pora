import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against a locally running stack (not CI):
 *   1. backend:  npm run start:dev   (with a local MongoDB)
 *   2. frontend: npm run dev
 *   3. frontend: npm run test:e2e
 *
 * Admin credentials come from E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 * (the seed admin — see backend/.env.example).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
