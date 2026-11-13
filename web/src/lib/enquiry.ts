import "server-only";
import { NextResponse } from "next/server";
import { getOpenJobs, WP_URL } from "./wp";
import { SITE_URL } from "./site";
import { services } from "@/content/company";

/**
 * Server-side handling for the contact and job application forms.
 * Validates input, applies abuse protection, then forwards the enquiry to
 * WordPress (`POST /wp-json/sw/v1/enquiry`), which stores it privately and
 * emails the team via the site's existing WP Mail SMTP setup.
 *
 * Abuse protection, in layers:
 *  - same-origin check (blocks cross-site form posting)
 *  - honeypot field
 *  - per-IP rate limit here (per server instance) and a persistent one in WordPress
 *  - strict field limits, control characters stripped, resume checked by file signature
 */

const MAX_FILE = 5 * 1024 * 1024;
const MAX_BODY = MAX_FILE + 256 * 1024;
const CV_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
]);
const CV_EXT = /\.(pdf|docx?)$/i;

const FAIL_MSG = "We couldn't send that just now.";

// Per-instance rate limit: 5 submissions / 10 minutes / IP. WordPress enforces a persistent limit too.
const WINDOW = 10 * 60 * 1000;
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

/** Client IP: Netlify's own header first (it cannot be set by the visitor), then standard proxies. */
function clientIp(req: Request) {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  ).slice(0, 64);
}

/** Rejects posts from other websites. Browsers always send Origin on POST from a form or fetch. */
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still subject to every other check
  try {
    const o = new URL(origin).host;
    const allowed = new Set([new URL(SITE_URL).host, req.headers.get("host") ?? "", req.headers.get("x-forwarded-host") ?? ""]);
    return allowed.has(o);
  } catch {
    return false;
  }
}

// Strips control characters (incl. line breaks) from single-line fields; keeps line breaks in long text.
const CTRL_ALL = /[\u0000-\u001f\u007f\u2028\u2029]+/g;
const CTRL_TEXT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g;
const line = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").replace(CTRL_ALL, " ").replace(/\s+/g, " ").trim().slice(0, max);
const text = (fd: FormData, k: string, max = 5000) => String(fd.get(k) ?? "").replace(CTRL_TEXT, "").replace(/\r\n?/g, "\n").trim().slice(0, max);

/** Checks the first bytes of the file, so a renamed executable can't pass as a resume. */
async function looksLikeCv(file: File) {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const hex = Array.from(head, (b) => b.toString(16).padStart(2, "0")).join("");
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return hex.startsWith("25504446"); // %PDF
  if (name.endsWith(".docx")) return hex.startsWith("504b0304"); // ZIP container
  if (name.endsWith(".doc")) return hex.startsWith("d0cf11e0a1b11ae1"); // OLE2
  return false;
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function handleEnquiry(req: Request, kind: "contact" | "apply") {
  if (!sameOrigin(req)) return fail("This form can only be sent from sharpewysman.com.", 403);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return fail("Your resume is larger than 5 MB.", 413);

  const ip = clientIp(req);
  if (rateLimited(ip)) return fail("Too many submissions from your connection. Wait a few minutes and try again.", 429);

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return fail("The form data couldn't be read. Refresh the page and try again.", 400);
  }

  // Honeypot: pretend success so bots don't retry.
  if (line(fd, "website")) return NextResponse.json({ ok: true });

  const topic = line(fd, "topic", 20);
  const data = {
    kind,
    topic: ["hire", "register", "general"].includes(topic) ? topic : "general",
    name: line(fd, "name", 120),
    email: line(fd, "email", 200),
    phone: line(fd, "phone", 40),
    company: line(fd, "company", 160),
    linkedin: line(fd, "linkedin", 300),
    message: text(fd, "message", 5000),
    jobSlug: "",
    jobTitle: "",
    consent: line(fd, "consent") === "yes",
  };

  // Which service the visitor clicked "Enquire" on. Only ever one of our own slugs,
  // and it is prefixed to the message so the team sees it in the notification email.
  const service = services.find((s) => s.slug === line(fd, "service", 60));
  if (service && data.topic === "hire") {
    data.message = `Service of interest: ${service.title}\n\n${data.message}`.slice(0, 5000);
  }

  if (!data.name) return fail("Enter your name.", 422);
  if (!/^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/.test(data.email)) return fail("Enter a valid email address.", 422);
  if (!data.consent) return fail("Confirm you agree to be contacted.", 422);
  if (data.phone && !/^[\d\s()+.\-x]{7,40}$/i.test(data.phone)) return fail("Enter a valid phone number, or leave it blank.", 422);
  if (data.linkedin) {
    const url = /^https?:\/\//i.test(data.linkedin) ? data.linkedin : `https://${data.linkedin}`;
    try {
      const u = new URL(url);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) throw new Error();
      data.linkedin = u.toString();
    } catch {
      return fail("Enter a valid LinkedIn URL, or leave it blank.", 422);
    }
  }

  // Applications must be for a real, open role. The title always comes from our own job data.
  if (kind === "apply") {
    const slug = line(fd, "jobSlug", 200);
    const job = (await getOpenJobs()).find((j) => j.slug === slug);
    if (!job) return fail("This role is no longer open. Browse current roles or register your resume.", 422);
    data.jobSlug = job.slug;
    data.jobTitle = job.title;
  }

  const cv = fd.get("cv");
  const hasCv = cv instanceof File && cv.size > 0;
  if (kind === "apply" && !hasCv) return fail("Attach your resume.", 422);
  if (hasCv) {
    if (cv.size > MAX_FILE) return fail("Your resume is larger than 5 MB.", 413);
    if (!CV_EXT.test(cv.name) || (cv.type && !CV_MIME.has(cv.type)) || !(await looksLikeCv(cv))) {
      return fail("Attach your resume as a PDF or Word document.", 415);
    }
  }

  const secret = process.env.WP_FORMS_SECRET;
  if (!secret) {
    console.error("[enquiry] WP_FORMS_SECRET is not set; cannot forward enquiry to WordPress.");
    return fail(FAIL_MSG, 503);
  }

  const out = new FormData();
  for (const [k, v] of Object.entries(data)) out.set(k, String(v));
  out.set("ip", ip);
  if (hasCv) out.set("cv", cv, cv.name.replace(/[^\w.\- ]+/g, "_").slice(-120));

  try {
    const res = await fetch(`${WP_URL}/wp-json/sw/v1/enquiry`, {
      method: "POST",
      headers: { "X-SW-Secret": secret },
      body: out,
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if (res.status === 429) return fail("Too many submissions from your connection. Wait a few minutes and try again.", 429);
    if (!res.ok) {
      // Status and error code only: never log the visitor's details.
      const body = (await res.json().catch(() => ({}))) as { code?: string };
      console.error(`[enquiry] WordPress responded ${res.status} (${body.code ?? "no code"})`);
      return fail(FAIL_MSG, 502);
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[enquiry] forward failed:", e instanceof Error ? e.name : "unknown");
    return fail(FAIL_MSG, 502);
  }
}
