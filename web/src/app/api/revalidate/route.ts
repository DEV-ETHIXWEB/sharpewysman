import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Called by WordPress (sharpe-wysman-headless plugin) whenever content is
 * saved, so changes appear on the site within seconds.
 * Body: { "type": "jobs" | "testimonials" | "team" | "industries" | "faqs" | "case-studies" | "posts" | "page" | "settings", "slug"?: string }
 */
const TYPE_TAG: Record<string, string> = {
  jobs: "wp:jobs",
  testimonials: "wp:testimonials",
  team: "wp:team",
  industries: "wp:industries",
  faqs: "wp:faqs",
  "case-studies": "wp:case-studies",
  posts: "wp:posts",
  settings: "wp:settings",
};

function authorised(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const got = req.headers.get("x-sw-secret") ?? "";
  if (!expected || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export async function POST(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { type?: string; slug?: string };
  const tag = body.type === "page" && body.slug ? `wp:page:${body.slug}` : TYPE_TAG[body.type ?? ""] ?? "wp";
  revalidateTag(tag);
  // Listing pages and the sitemap depend on most content types.
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, tag, at: Date.now() });
}
