import Link from "next/link";
import { Arrow, JsonLd, PageHero, SectionHeading } from "@/option-2/components/ui";
import { TeamGrid } from "@/option-2/components/TeamGrid";
import { TeamSpotlight } from "@/option-2/components/TeamSpotlight";
import { CountUp } from "@/option-2/components/motion/CountUp";
import { IconBriefcase, IconNetwork, IconScales } from "@/option-2/components/icons";
import { CtaBand } from "@/option-2/components/CtaBand";
import { values } from "@/content/company";
import { getSettings, getTeam } from "@/option-2/wp";
import { breadcrumbLd, buildMetadata, personLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us: Our Story & Values",
  description:
    "Founded in 2008 by Chartered Accountant Sukhjit Singh Lalli (PwC London, EY), Sharpe Wysman is a Vancouver recruitment firm built on integrity and expertise.",
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
        image="/video/about-handshake-poster.jpg"
        video="/video/about-handshake-1080.h264.mp4"
        caption="Every hire starts with a conversation."
      >
        <Link href="/contact" className="btn btn-gold">
          Work with us <Arrow />
        </Link>
        <a href={`tel:${settings.phoneHref}`} className="btn btn-ghost-light tabular-nums">
          {settings.phone}
        </a>
      </PageHero>

      {/* Founder */}
      {founder ? (
        <section id="founder" className="py-12 md:py-16">
          <div className="container-sw">
            <SectionHeading align="center" eyebrow="Our founder" title="The person behind Sharpe Wysman" />
            <div className="mx-auto mt-16 max-w-6xl">
              <TeamSpotlight team={[founder]} />
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
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {core.map((v, i) => {
              const icons: Record<string, typeof IconScales> = { Integrity: IconScales, Expertise: IconNetwork, Professionalism: IconBriefcase };
              const Icon = icons[v.title];
              return (
                <article
                  key={v.title}
                  data-reveal
                  data-glow
                  style={{ ["--i" as string]: i }}
                  className="group relative rounded-2xl border border-white/10 bg-ink-2 p-8 transition duration-500 hover:-translate-y-1 hover:border-gold/30 md:p-10"
                >
                  <span className="font-mono text-xs text-muted-dark/60 absolute right-7 top-8 md:right-9 md:top-10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-16 w-16 items-center justify-center text-gold transition duration-500 group-hover:scale-110">
                    {Icon ? <Icon className="h-12 w-12" /> : null}
                  </span>
                  <h3 className="mt-6 text-[2.2rem] text-white">{v.title}</h3>
                  <p className="mt-4 text-muted-dark">{v.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-12 md:py-16">
        <div className="container-sw">
          <SectionHeading
            eyebrow="Who we are"
            title="How we work together"
            intro="Whether you're a professional advancing your career or an employer improving your hiring strategy, these values guide how we treat you, and each other."
          />

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {culture.map((v, i) => (
              <div key={v.title} data-reveal style={{ ["--i" as string]: i }} className="border-t-2 border-ink pt-6">
                <h3 className="font-display text-2xl">{v.title}</h3>
                <p className="mt-3 text-muted">{v.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {settings.stats.map((s, i) => (
              <div
                key={s.label}
                data-reveal
                style={{ ["--i" as string]: i }}
                className="rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5 md:p-7"
              >
                <p className="font-mono text-4xl font-medium tabular-nums tracking-tight text-ink md:text-5xl">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-3 text-sm leading-snug text-muted">{s.label}</p>
                {s.note ? <p className="mt-1 font-mono text-xs text-muted">{s.note}</p> : null}
              </div>
            ))}
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
