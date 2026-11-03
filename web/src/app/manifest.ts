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
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
