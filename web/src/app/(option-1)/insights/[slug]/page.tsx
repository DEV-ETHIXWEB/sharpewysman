import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Arrow, Breadcrumbs, JsonLd } from "@/components/ui";
import { ArticleCard, formatDate } from "@/components/ArticleCard";
import { CtaBand } from "@/components/CtaBand";
import { cleanHtml } from "@/lib/sanitize";
import { getArticle, getArticles } from "@/lib/wp";
import { articleLd, breadcrumbLd, buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return buildMetadata({
    title: a.title,
    description: a.excerpt,
    path: `/insights/${a.slug}`,
    image: a.image,
    type: "article",
    publishedTime: a.date,
    modifiedTime: a.modified ?? a.date,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [a, all] = await Promise.all([getArticle(slug), getArticles()]);
  if (!a) notFound();
  const html = cleanHtml(a.html);
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const more = all.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          articleLd(a),
          breadcrumbLd([
            { name: "Insights", path: "/insights" },
            { name: a.title, path: `/insights/${a.slug}` },
          ]),
        ]}
      />
      <article>
        <header className="on-dark bg-ink text-white">
          <div className="container-sw pb-14 pt-10 md:pb-20 md:pt-14">
            <Breadcrumbs items={[{ name: "Insights", path: "/insights" }, { name: a.title }]} />
            <p className="eyebrow mt-10 text-gold">
              {a.category} · <time dateTime={a.date}>{formatDate(a.date)}</time> · {Math.max(1, Math.round(words / 230))} min read
            </p>
            <h1 className="hero-title mt-4 max-w-4xl text-[2.2rem] md:text-[3.2rem]">{a.title}</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-dark md:text-xl">{a.excerpt}</p>
          </div>
        </header>
        {a.image ? (
          <div className="container-sw -mb-4 mt-10 md:mt-14">
            <div className="relative mx-auto aspect-[21/9] max-w-5xl overflow-hidden rounded-xl">
              <Image src={a.image} alt="" fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" priority />
            </div>
          </div>
        ) : null}
        <div className="container-sw py-14 md:py-20">
          <div className="prose-sw mx-auto max-w-[44rem]" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="mx-auto mt-14 flex max-w-[44rem] flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-sm text-muted">Written by the {a.author} team</p>
            <Link href="/contact" className="link-arrow">
              Talk to a recruiter <Arrow />
            </Link>
          </div>
        </div>
      </article>
      {more.length ? (
        <section className="border-t border-line bg-white py-16 md:py-24">
          <div className="container-sw">
            <h2 className="text-3xl md:text-4xl">More insights</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {more.map((m, i) => (
                <ArticleCard key={m.slug} article={m} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <CtaBand />
    </>
  );
}
