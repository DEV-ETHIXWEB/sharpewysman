import "server-only";
import { NextResponse } from "next/server";
import { WP_URL } from "./wp";

/**
 * Server-side handling for the contact and job application forms.
 * Validates input, applies basic abuse protection, then forwards the
 * enquiry to WordPress (`POST /wp-json/sw/v1/enquiry`), which stores it
 * privately and emails the team via the site's existing WP Mail SMTP setup.
 */

const MAX_FILE = 5 * 1024 * 1024;
const CV_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const CV_EXT = /\.(pdf|docx?)$/i;

// Simple per-instance rate limit: 5 submissions / 10 minutes / IP.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const str = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function handleEnquiry(req: Request, kind: "contact" | "apply") {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions from your connection. Wait a few minutes." }, { status: 429 });
  }

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "The form data couldn't be read." }, { status: 400 });
  }

  // Honeypot: pretend success so bots don't retry.
  if (str(fd, "website")) return NextResponse.json({ ok: true });

  const data = {
    kind,
    topic: ["hire", "register", "general"].includes(str(fd, "topic")) ? str(fd, "topic") : "general",
    name: str(fd, "name", 120),
    email: str(fd, "email", 200),
    phone: str(fd, "phone", 40),
    company: str(fd, "company", 160),
    linkedin: str(fd, "linkedin", 300),
    message: str(fd, "message", 5000),
    jobSlug: str(fd, "jobSlug", 200),
    jobTitle: str(fd, "jobTitle", 200),
    consent: str(fd, "consent") === "yes",
  };

  if (!data.name) return NextResponse.json({ error: "Enter your name." }, { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  if (!data.consent) return NextResponse.json({ error: "Confirm you agree to be contacted." }, { status: 422 });
  if (data.linkedin && !/^https?:\/\//i.test(data.linkedin)) data.linkedin = `https://${data.linkedin}`;

  const cv = fd.get("cv");
  const hasCv = cv instanceof File && cv.size > 0;
  if (kind === "apply" && !hasCv) return NextResponse.json({ error: "Attach your resume." }, { status: 422 });
  if (hasCv) {
    if (cv.size > MAX_FILE) return NextResponse.json({ error: "Your resume is larger than 5 MB." }, { status: 413 });
    if (!CV_EXT.test(cv.name) || (cv.type && !CV_MIME.has(cv.type))) {
      return NextResponse.json({ error: "Attach your resume as a PDF or Word document." }, { status: 415 });
    }
  }

  const secret = process.env.WP_FORMS_SECRET;
  if (!secret) {
    console.error("[enquiry] WP_FORMS_SECRET is not set; cannot forward enquiry to WordPress.");
    return NextResponse.json({ error: "Our form is temporarily unavailable." }, { status: 503 });
  }

  const out = new FormData();
  for (const [k, v] of Object.entries(data)) out.set(k, String(v));
  out.set("ip", ip);
  if (hasCv) out.set("cv", cv, cv.name.replace(/[^\w.\- ]+/g, "_"));

  try {
    const res = await fetch(`${WP_URL}/wp-json/sw/v1/enquiry`, {
      method: "POST",
      headers: { "X-SW-Secret": secret },
      body: out,
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[enquiry] WordPress responded", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[enquiry] forward failed", e);
    return NextResponse.json({ error: "" }, { status: 502 });
  }
}
