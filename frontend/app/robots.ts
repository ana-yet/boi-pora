import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/profile",
          "/library",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/read/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
