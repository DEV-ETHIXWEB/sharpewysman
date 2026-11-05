import { JsonLd, PageHero } from "./ui";
import { formatDate } from "./ArticleCard";
import { cleanHtml, dropLeadingTitle } from "@/lib/sanitize";
import { getWpPage } from "@/lib/wp";
import { breadcrumbLd } from "@/lib/seo";
import { legalPages } from "@/content/legal";

export async function LegalPage({ slug, name }: { slug: string; name: string }) {
  const page = (await getWpPage(slug)) ?? legalPages[slug];
  const html = page ? dropLeadingTitle(dropLeadingTitle(cleanHtml(page.html), page.title), name) : "";
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name, path: `/${slug}` }])} />
      <PageHero eyebrow="Legal" title={name} intro={page ? `Last updated ${formatDate(page.modified)}` : undefined} />
      <section className="py-16 md:py-24">
        <div className="container-sw">
          <div className="prose-sw mx-auto max-w-[46rem]" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    </>
  );
}
