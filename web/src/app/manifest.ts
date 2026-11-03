import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sharpe Wysman Recruitment Solutions",
    short_name: "Sharpe Wysman",
    description: "Accounting & finance recruitment in Vancouver",
    start_url: "/",
    display: "browser",
    background_color: "#1e1d1f",
    theme_color: "#1e1d1f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
