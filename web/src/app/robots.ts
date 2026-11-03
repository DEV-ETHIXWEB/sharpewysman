import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Non-production deployments (previews, staging) must never be indexed.
  const isPreview =
    (process.env.CONTEXT && process.env.CONTEXT !== "production") || // Netlify deploy previews / branch deploys
    (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production");
  if (isPreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
