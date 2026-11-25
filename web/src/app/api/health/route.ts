import { NextResponse } from "next/server";
import { WP_URL } from "@/lib/wp";

/**
 * Uptime check for a free monitor (e.g. UptimeRobot, keyword "ok"). 200 means the site
 * is up and WordPress (which receives every enquiry) answers; 503 means enquiries would fail.
 * The WordPress probe is cached for a minute so the endpoint can't be used to load WordPress.
 */
export async function GET() {
  let cms = false;
  try {
    const res = await fetch(`${WP_URL}/wp-json/`, { method: "GET", signal: AbortSignal.timeout(8000), next: { revalidate: 60 } });
    cms = res.ok;
  } catch {
    cms = false;
  }
  return NextResponse.json(
    { status: cms ? "ok" : "degraded", cms: cms ? "up" : "down" },
    { status: cms ? 200 : 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
