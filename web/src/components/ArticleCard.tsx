import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  return (
    <article data-reveal style={{ ["--i" as string]: index }} className="group relative flex flex-col">
      {article.image ? (
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-paper-2">
          <Image src={article.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
        </div>
      ) : null}
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-maroon">
        {article.category} · <time dateTime={article.date}>{formatDate(article.date)}</time>
      </p>
      <h3 className="mt-3 text-2xl leading-snug group-hover:text-maroon">
        <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>
      <p className="mt-3 text-muted">{article.excerpt}</p>
    </article>
  );
}
