import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The branded 1200x630 share card used for jobs, articles and industries:
 * logo, a gold eyebrow, the page's own title, and a footer line.
 */
export async function ogCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  const logo = await readFile(path.join(process.cwd(), "public/images/logo-light.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;
  const fontSize = title.length > 70 ? 54 : title.length > 40 ? 64 : 76;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#1e1d1f", padding: 72, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
          <img src={src} width={350} height={60} alt="" />
          <div style={{ width: 120, height: 6, background: "#fdc705", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, letterSpacing: 4, color: "#fdc705", textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontSize, lineHeight: 1.08, marginTop: 20, fontWeight: 600, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#b4b2b7", borderTop: "2px solid #3d3c40", paddingTop: 24 }}>
          <span>{footer.replace(/\s+/g, " ")}</span>
          <span style={{ color: "#fdc705" }}>sharpewysman.com</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
