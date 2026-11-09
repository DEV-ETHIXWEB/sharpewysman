import { JsonLd, PageHero, Tick } from "@/components/ui";
import { CtaBand } from "@/components/CtaBand";
import { getTestimonials } from "@/lib/wp";
import { breadcrumbLd, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Client & Candidate Testimonials",
  description:
    "What partners, CFOs and finance leaders at firms including MNP, Baker Tilly WM, Rise CPA and Johnsen Archer say about working with Sharpe Wysman.",
  path: "/testimonials",
});

export default async function TestimonialsPage() {
  const items = await getTestimonials();
  const groups = [
    { id: "client", title: "From employers", intro: "Partners and owners who hired through us." },
    { id: "candidate", title: "From candidates", intro: "Professionals we helped into their next role." },
  ] as const;
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Testimonials", path: "/testimonials" }])} />
      <PageHero
        eyebrow="Testimonials"
        title={
          <>
            Don&rsquo;t take <span className="text-gold">our word for it.</span>
          </>
        }
        intro="Every testimonial here comes from a named professional we've worked with."
        crumbs={[{ name: "Testimonials" }]}
      />
      {groups.map((g, gi) => {
        const list = items.filter((t) => t.audience === g.id);
        if (!list.length) return null;
        return (
          <section key={g.id} className={`py-12 md:py-16 ${gi % 2 ? "border-t border-line bg-white" : ""}`}>
            <div className="container-sw">
              <p className="eyebrow text-maroon">{g.intro}</p>
              <h2 className="mt-3 text-4xl md:text-5xl">{g.title}</h2>
              <div className="mt-12 columns-1 gap-6 md:columns-2 lg:columns-3">
                {list.map((t, i) => (
                  <figure key={t.id} data-reveal style={{ ["--i" as string]: i % 3 }} className="mb-6 break-inside-avoid rounded-xl border border-line bg-white p-7 transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5 md:p-8">
                    <Tick animate delay={0.4} className="h-4 w-5 text-maroon" />
                    <blockquote className="mt-5 font-serif text-[1.15rem] leading-relaxed">
                      <p>&ldquo;{t.quote}&rdquo;</p>
                    </blockquote>
                    <figcaption className="mt-6 border-t border-line pt-4">
                      <span className="block font-bold">{t.name}</span>
                      <span className="block text-sm text-muted">
                        {t.role}, {t.company}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        );
      })}
      <CtaBand />
    </>
  );
}
