import { DEFAULT_SETTINGS, SITE_URL } from "@/lib/site";
import { getSettings } from "@/lib/wp";

export const revalidate = 86400;

/**
 * security.txt (RFC 9116): tells a security researcher who to tell, instead of
 * leaving them to guess or post publicly. The expiry is generated a year ahead of
 * each build, so it can never go stale while the site is being deployed normally.
 */
export async function GET() {
  const settings = await getSettings();
  const contact = settings.email ?? DEFAULT_SETTINGS.email;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");

  const body = [
    ...(contact ? [`Contact: mailto:${contact}`] : []),
    `Contact: ${SITE_URL}/contact`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    "",
    "# Please report security issues privately and give us a reasonable time to fix them",
    "# before disclosing publicly. We do not run a paid bug bounty.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
