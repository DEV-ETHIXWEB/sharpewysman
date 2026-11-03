import type { NextConfig } from "next";

const wpHost = new URL(process.env.WORDPRESS_URL ?? "https://sharpewysman.com").hostname;

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
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
