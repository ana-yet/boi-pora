/**
 * Environment variables for client-side use.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, "");
}
