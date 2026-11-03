import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "Sharpe Wysman: accounting and finance recruiters in Vancouver";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await readFile(path.join(process.cwd(), "public/images/logo-light.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1e1d1f", padding: 72, color: "#fff" }}>
        <img src={src} width={460} height={79} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, letterSpacing: 4, color: "#fdc705", textTransform: "uppercase" }}>Accounting & finance recruiters · Vancouver</div>
          <div style={{ fontSize: 76, lineHeight: 1.05, marginTop: 20, fontWeight: 600 }}>Hiring accountants is a job for accountants.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#b4b2b7", borderTop: "2px solid #3d3c40", paddingTop: 24 }}>
          <span>Since 2008 · Founded by a Chartered Accountant</span>
          <span style={{ color: "#fdc705" }}>sharpewysman.com</span>
        </div>
      </div>
    ),
    size,
  );
}
