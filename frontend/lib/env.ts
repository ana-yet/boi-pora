/**
 * Environment variables for client-side use.
 * Only NEXT_PUBLIC_* vars are exposed to the browser.
 */
const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, "");
}
