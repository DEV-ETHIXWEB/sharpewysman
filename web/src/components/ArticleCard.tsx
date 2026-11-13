import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { IconArrowUpRight } from "./icons";

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function ArticleCard({ article, index = 0 }: { article: Article; index?: number }) {
  return (
    <article
      data-reveal
      style={{ ["--i" as string]: index }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl hover:shadow-ink/10"
    >
      {article.image ? (
        <div className="relative aspect-[3/2] overflow-hidden bg-paper-2">
          <Image src={article.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink backdrop-blur">
            {article.category}
          </span>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl leading-snug group-hover:text-accent">
          <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-muted">{article.excerpt}</p>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <time dateTime={article.date} className="font-mono text-xs uppercase tracking-widest text-muted">
            {formatDate(article.date)}
          </time>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-gold transition duration-300 group-hover:scale-110 group-hover:bg-accent">
            <IconArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          </span>
        </div>
      </div>
    </article>
  );
}
