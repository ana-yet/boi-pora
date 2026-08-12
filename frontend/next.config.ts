import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Covers are arbitrary admin-supplied URLs and the app deploys to
    // Cloudflare Workers (no Next image optimizer) — serve sources as-is
    // while keeping next/image lazy-loading and layout benefits.
    unoptimized: true,
  },
};

export default nextConfig;
