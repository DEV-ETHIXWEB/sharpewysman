import { SITE, SITE_URL } from "@/lib/site";
import { getArticles } from "@/lib/wp";

export const revalidate = 600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** RSS feed of Insights articles, so readers, search engines and AI assistants pick up new posts. */
export async function GET() {
  const articles = await getArticles();
  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/insights/${a.slug}`;
      return [
        "    <item>",
        `      <title>${esc(a.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(a.date).toUTCString()}</pubDate>`,
        `      <category>${esc(a.category)}</category>`,
        `      <description>${esc(a.excerpt)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} Insights</title>
    <link>${SITE_URL}/insights</link>
    <atom:link href="${SITE_URL}/insights/feed.xml" rel="self" type="application/rss+xml" />
    <description>Advice for accounting careers and hiring in Vancouver.</description>
    <language>en-CA</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" } });
}
