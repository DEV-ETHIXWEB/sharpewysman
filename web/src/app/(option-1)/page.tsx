import Image from "next/image";
import Link from "next/link";
import { Hero, OpenRoles } from "@/components/home/Hero";
import { StatsLedger } from "@/components/StatsLedger";
import { ProcessOrbit } from "@/components/ProcessOrbit";
import { Testimonials } from "@/components/Testimonials";
import { FaqList } from "@/components/FaqList";
import { IndustryGrid } from "@/components/IndustryGrid";
import { CtaBand } from "@/components/CtaBand";
import { ArticleCard } from "@/components/ArticleCard";
import { Marquee } from "@/components/motion/Marquee";
import { Arrow, JsonLd, SectionHeading, TickList, maskWords } from "@/components/ui";
import { ServiceMark } from "@/components/ServiceMark";
import { candidateProcess, employerProcess, services } from "@/content/company";
import { getArticles, getFaqs, getIndustries, getOpenJobs, getSettings, getTeam, getTestimonials } from "@/lib/wp";
import { buildMetadata, faqLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Accounting & Finance Recruiters in Vancouver | Sharpe Wysman",
  description:
    "Accounting and finance recruitment in Vancouver by designated accountants. Since 2008 we have placed CPAs, tax and audit managers, controllers and CFOs.",
  path: "/",
});

export default async function HomePage() {
  const [jobs, industries, testimonials, faqs, settings, articles, team] = await Promise.all([
    getOpenJobs(),
    getIndustries(),
    getTestimonials(),
    getFaqs(),
    getSettings(),
    getArticles(),
    getTeam(),
  ]);
  const founder = team[0];
  const openByIndustry = jobs.reduce<Record<string, number>>((acc, j) => ({ ...acc, [j.industry]: (acc[j.industry] ?? 0) + 1 }), {});
  const homeFaqs = faqs.slice(0, 5);
  const endorsers = Array.from(new Set(testimonials.map((t) => t.company)));

  return (
    <>
      <JsonLd data={faqLd(homeFaqs)} />
      <Hero totalOpen={jobs.length} />

      {/* Endorsements strip */}
      {endorsers.length ? (
        <section aria-label="Recommended by" className="border-b border-line bg-white">
          <div className="container-sw flex flex-col gap-4 py-7 md:flex-row md:items-center md:gap-10">
            <p className="eyebrow shrink-0 text-muted">Recommended by professionals at</p>
            <Marquee
              label="Firms whose professionals recommend Sharpe Wysman"
              items={endorsers.map((c) => (
                <span key={c} className="font-serif text-xl text-ink/85 md:text-2xl">
                  {c}
                </span>
              ))}
            />
          </div>
        </section>
      ) : null}

      <OpenRoles jobs={jobs.slice(0, 4)} totalOpen={jobs.length} />

      {/* Two audiences */}
      <section className="py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading
            eyebrow="Why Sharpe Wysman"
            title={
              <>
                Always professional. <span className="text-maroon">Never pushy.</span>
              </>
            }
            intro="We care about finding the right fit between employer and candidate. Our recruiters have all worked as accounting professionals, so we understand what you do, what you're aiming for and the challenges you face."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {[
              {
                eyebrow: "For employers",
                title: "Access hard-to-find accounting talent",
                body: "Senior hires, confidential searches and specialist skill sets, screened by people who have done the job themselves.",
                points: ["Pre-qualified shortlists only", "Confidential leadership searches", "Follow-up long after the offer"],
                href: "/employers",
                cta: "How we help employers",
                image: "/images/team-meeting.jpg",
              },
              {
                eyebrow: "For candidates",
                title: "Make your aspirations a reality",
                body: "Roles in public practice and industry, many never advertised, with honest advice at every stage and no pressure to accept.",
                points: ["Free and confidential", "Interview coaching and preparation", "Offer and negotiation support"],
                href: "/candidates",
                cta: "How we help candidates",
                image: "/images/candidate-interview.jpg",
              },
            ].map((c, i) => (
              <article
                key={c.href}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ink/10"
              >
                <div className="relative aspect-[16/8] overflow-hidden">
                  <Image src={c.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="parallax-img object-cover transition duration-700 group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-10">
                  <p className="eyebrow text-maroon">{c.eyebrow}</p>
                  <h3 className="mt-3 text-3xl md:text-[2.25rem]">{c.title}</h3>
                  <p className="mt-4 text-muted">{c.body}</p>
                  <TickList items={c.points} className="mt-6" />
                  <Link href={c.href} className="link-arrow mt-8 self-start after:absolute after:inset-0">
                    {c.cta} <Arrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="on-dark bg-ink py-12 text-white md:py-16">
        <div className="container-sw">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading tone="dark" eyebrow="Client services" title="Three ways to hire with us" />
            <Link href="/employers#services" className="link-arrow text-gold">
              Compare services <Arrow />
            </Link>
          </div>
          <div data-reveal className="mt-14 grid gap-px overflow-hidden rounded-xl bg-line-dark md:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.slug}
                data-glow
                className="rule-hover group flex flex-col bg-ink-2 p-8 transition-colors duration-300 hover:bg-[#2e2d31] md:p-10"
              >
                <ServiceMark slug={s.slug} />
                <h3 className="mt-8 text-[2rem] text-white">{s.title}</h3>
                <p className="mt-4 font-serif text-lg text-gold">{s.lede}</p>
                <p className="mt-4 flex-1 text-muted-dark">{s.body}</p>
                <p className="mt-8 border-t border-white/10 pt-5 font-mono text-xs uppercase tracking-widest text-white/60">Best for: {s.bestFor}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Founder + record */}
      <section className="py-12 md:py-16">
        <div className="container-sw grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div data-reveal>
            <p className="eyebrow text-maroon">Our founder</p>
            <h2 className="mt-4 text-[2.1rem] md:text-5xl">{maskWords("Recruitment with a Chartered Accountant\u2019s standards")}</h2>
            {founder ? (
              <div className="mt-8 flex flex-col gap-5 sm:flex-row">
                {founder.image ? (
                  <Image src={founder.image} alt={founder.name} width={112} height={112} className="h-24 w-24 shrink-0 rounded-full object-cover md:h-28 md:w-28" />
                ) : null}
                <div className="space-y-4 text-muted">
                  {founder.bio.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              </div>
            ) : null}
            <Link href="/about" className="link-arrow mt-8">
              Our story and values <Arrow />
            </Link>
          </div>
          <StatsLedger stats={settings.stats} />
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-line bg-paper-2/60 py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title="A clear process, from first call to first day"
            intro="Whichever side of the hire you're on, you'll always know what happens next."
          />
          <div className="mt-12">
            <ProcessOrbit
              tracks={[
                { id: "employers", label: "For employers", steps: employerProcess },
                { id: "candidates", label: "For candidates", steps: candidateProcess },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-12 md:py-16">
        <div className="container-sw">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Industries we serve"
              title="Deep in accounting. Trusted beyond it."
              intro="Our expertise spans accounting and finance in public practice and industry, plus the specialist teams that work alongside them."
            />
            <Link href="/industries" className="link-arrow shrink-0">
              All industries <Arrow />
            </Link>
          </div>
          <div className="mt-12">
            <IndustryGrid industries={industries} openByIndustry={openByIndustry} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="on-dark bg-ink py-12 text-white md:py-16">
        <div className="container-sw">
          <SectionHeading tone="dark" eyebrow="In their words" title="Don't take our word for it" />
          <div data-reveal className="mt-10">
            <Testimonials items={testimonials} tone="dark" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16">
        <div className="container-sw grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Questions" title="Good questions, straight answers" intro="Honesty is how we work. Here are the questions we hear most." />
            <Link href="/faq" className="link-arrow mt-8">
              All questions <Arrow />
            </Link>
          </div>
          <FaqList faqs={homeFaqs} />
        </div>
      </section>

      {/* Insights */}
      {articles.length ? (
        <section className="border-t border-line bg-white py-12 md:py-16">
          <div className="container-sw">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Insights" title="Advice for accounting careers and hiring" />
              <Link href="/insights" className="link-arrow shrink-0">
                All insights <Arrow />
              </Link>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {articles.slice(0, 3).map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand
        title="Let's talk about your next hire, or your next role."
        body="A short, confidential conversation with a recruiter who understands accounting. No pressure, no obligation."
      />
    </>
  );
}
