import type { NextConfig } from "next";

/**
 * Production builds fail loudly when a required variable is missing, instead of
 * shipping a site whose forms silently don't deliver. (Netlify sets CONTEXT.)
 */
const REQUIRED_IN_PRODUCTION = ["NEXT_PUBLIC_SITE_URL", "WORDPRESS_URL", "WP_FORMS_SECRET", "REVALIDATE_SECRET"];
if (process.env.CONTEXT === "production" && process.env.npm_lifecycle_event === "build") {
  const missing = REQUIRED_IN_PRODUCTION.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}. Set them in Netlify > Site configuration > Environment variables.`);
}

const wpHost = new URL(process.env.WORDPRESS_URL ?? "https://sharpewysman.com").hostname;
const isDev = process.env.NODE_ENV !== "production";
const ga = /^G-[A-Z0-9]{4,16}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "");

/**
 * Content-Security-Policy. Scripts only from this site (plus Google Analytics when configured).
 * 'unsafe-inline' is required by Next.js for its inline bootstrap scripts on statically
 * generated pages; nonces would force every page to render dynamically.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${ga ? " https://www.googletagmanager.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // De-duplicated: wpHost is usually one of the two below, and a repeated source
  // makes the header harder to read when auditing it.
  `img-src 'self' data: blob: ${[...new Set([`https://${wpHost}`, "https://sharpewysman.com", "https://cms.sharpewysman.com"])].join(" ")}${ga ? " https://*.google-analytics.com https://*.googletagmanager.com" : ""}`,
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${ga ? " https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com" : ""}${isDev ? " ws: wss:" : ""}`,
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Only on an HTTPS site (Safari would otherwise try to upgrade plain-HTTP local previews).
  ...((process.env.NEXT_PUBLIC_SITE_URL ?? "https://").startsWith("https:") && !isDev ? ["upgrade-insecure-requests"] : []),
].join("; ");

/** Old WordPress URLs → new routes (301), so existing rankings and links carry over. */
const legacyRedirects: [string, string][] = [
  ["/our-values", "/about"],
  ["/contact-us", "/contact"],
  ["/industries-we-serve", "/industries"],
  ["/accounting", "/industries/accounting"],
  ["/legal", "/industries/legal"],
  ["/information-technology", "/industries/information-technology"],
  ["/human-resources", "/industries/human-resources"],
  ["/engineering", "/industries/engineering"],
  ["/insurance", "/industries"],
  ["/new-home", "/"],
  ["/test", "/"],
  ["/home", "/"],
  ["/sitemap", "/sitemap.xml"],
  ["/hello-world", "/insights"],
  ["/sitemap_index.xml", "/sitemap.xml"],
  ["/page-sitemap.xml", "/sitemap.xml"],
  ["/post-sitemap.xml", "/sitemap.xml"],
  ["/category/:slug*", "/insights"],
  ["/author/:slug*", "/about"],
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: wpHost, pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "sharpewysman.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "cms.sharpewysman.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  async redirects() {
    return legacyRedirects.flatMap(([source, destination]) => [
      { source, destination, permanent: true },
      ...(source.includes(":") || source.endsWith(".xml") ? [] : [{ source: `${source}/`, destination, permanent: true }]),
    ]);
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Review deployments on platform domains must never appear in search results.
      { source: "/:path*", has: [{ type: "host", value: ".*\\.(vercel|netlify)\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      // Large media: cached for a week, refreshed in the background (file names change when the film changes).
      { source: "/video/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }] },
      // API responses carrying form results must never be cached by a CDN.
      { source: "/api/(contact|apply|revalidate)", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
