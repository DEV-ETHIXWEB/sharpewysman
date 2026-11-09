import Image from "next/image";
import Link from "next/link";
import { Arrow, JsonLd, PageHero, SectionHeading, Tick } from "@/components/ui";
import { StatsLedger } from "@/components/StatsLedger";
import { TeamGrid } from "@/components/TeamGrid";
import { CtaBand } from "@/components/CtaBand";
import { values } from "@/content/company";
import { getSettings, getTeam } from "@/lib/wp";
import { breadcrumbLd, buildMetadata, personLd } from "@/lib/seo";
import { FOUNDED_YEAR } from "@/lib/site";

export const metadata = buildMetadata({
  title: "About Us: Our Story & Values",
  description:
    "Founded in 2008 by Chartered Accountant Sukhjit Singh Lalli (PwC London, EY), Sharpe Wysman is a Vancouver recruitment firm built on integrity, expertise and professionalism.",
  path: "/about",
  image: "/images/team-sukhjit-lalli.jpg",
});

export default async function AboutPage() {
  const [team, settings] = await Promise.all([getTeam(), getSettings()]);
  const founder = team[0];
  const [core, culture] = [values.slice(0, 3), values.slice(3)];

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "About", path: "/about" }]), ...(founder ? [personLd(founder, true)] : [])]} />
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Built by an accountant <span className="text-gold">who wanted better recruitment.</span>
          </>
        }
        intro="Sharpe Wysman is a Vancouver-based recruitment, contract staffing and workforce solutions firm. We specialize in mid-level to leadership positions in public practice and industry, and all of our recruiters are designated accountants themselves."
        crumbs={[{ name: "About" }]}
        image="/images/vancouver-skyline.jpg"
      />

      {/* Founder */}
      {founder ? (
        <section id="founder" className="py-12 md:py-16">
          <div className="container-sw grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
            <div data-reveal="clip" className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-[12rem] rounded-b-xl">
              {founder.image ? <Image src={founder.image} alt={`${founder.name}, founder of Sharpe Wysman`} fill sizes="(min-width: 1024px) 35vw, 90vw" className="object-cover" /> : null}
            </div>
            <div>
              <SectionHeading eyebrow="Our founder" title={founder.name} />
              <p className="mt-2 font-mono text-sm uppercase tracking-widest text-muted">{founder.role}</p>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
                {founder.bio.map((p) => (
                  <p key={p.slice(0, 30)}>{p}</p>
                ))}
              </div>
              <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                {[
                  ["London", "Qualified as a Chartered Accountant with PwC"],
                  ["Industry", "Tenure with EY and British Aerospace"],
                  [String(FOUNDED_YEAR), "Founded Sharpe Wysman in Vancouver"],
                  ["Today", "Recruiting accounting and finance leaders"],
                ].map(([k, v], i) => (
                  <li key={k} data-reveal style={{ ["--i" as string]: i }} className="bg-white p-5">
                    <p className="font-mono text-sm font-medium text-maroon">{k}</p>
                    <p className="mt-2 text-sm leading-snug">{v}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {/* Core values */}
      <section className="on-dark bg-ink py-12 text-white md:py-16">
        <div className="container-sw">
          <SectionHeading
            tone="dark"
            eyebrow="What we're all about"
            title="Three cornerstones"
            intro="Sharpe Wysman knows the accounting industry, has a vast network, and excels at recruitment. These principles shape every search."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl bg-line-dark md:grid-cols-3">
            {core.map((v, i) => (
              <article key={v.title} data-reveal data-glow style={{ ["--i" as string]: i }} className="bg-ink-2 p-8 md:p-10">
                <Tick animate delay={0.3 + i * 0.15} className="h-6 w-8 text-gold" />
                <h3 className="mt-6 text-[2.2rem] text-white">{v.title}</h3>
                <p className="mt-4 text-muted-dark">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-12 md:py-16">
        <div className="container-sw grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="How we work together"
              intro="Whether you're a professional advancing your career or an employer improving your hiring strategy, these values guide how we treat you, and each other."
            />
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {culture.map((v, i) => (
                <div key={v.title} data-reveal style={{ ["--i" as string]: i }} className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-display text-2xl">{v.title}</dt>
                  <dd className="text-muted">{v.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:pt-6">
            <StatsLedger stats={settings.stats} />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-line bg-paper-2/60 py-12 md:py-16">
        <div className="container-sw">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Our team" title="Meet the recruiters" />
            <Link href="/team" className="link-arrow shrink-0">
              Full team profiles <Arrow />
            </Link>
          </div>
          <div className="mt-12">
            <TeamGrid team={team} />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
