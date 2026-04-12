/**
 * Canonical site origin for metadata (Open Graph, Twitter cards, JSON-LD).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://boi-pora.example.com).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
