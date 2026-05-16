/**
 * Environment variables for client-side use.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const BOOKS_API_URL =
  process.env.NEXT_PUBLIC_GET_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8787";

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, "");
}

export function getBooksApiUrl(): string {
  return BOOKS_API_URL.replace(/\/$/, "");
}