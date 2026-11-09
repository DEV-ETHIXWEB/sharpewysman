import { JsonLd, PageHero } from "@/components/ui";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { getFaqs } from "@/lib/wp";
import { breadcrumbLd, buildMetadata, faqLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Recruitment FAQ for Employers & Candidates",
  description:
    "Answers to common questions about working with Sharpe Wysman: fees, confidentiality, the roles we recruit for and how quickly we present candidates.",
  path: "/faq",
});

export default async function FaqPage() {
  const faqs = await getFaqs();
  const groups = [
    { id: "general", title: "General" },
    { id: "employer", title: "For employers" },
    { id: "candidate", title: "For candidates" },
  ] as const;
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "FAQ", path: "/faq" }]), faqLd(faqs)]} />
      <PageHero
        eyebrow="Frequently asked questions"
        title={
          <>
            Good questions, <span className="text-gold">straight answers.</span>
          </>
        }
        intro="Can't find what you're looking for? Call us or send a message. We're happy to help."
        crumbs={[{ name: "FAQ" }]}
      />
      <section className="py-16 md:py-24">
        <div className="container-sw space-y-16">
          {groups.map((g) => {
            const list = faqs.filter((f) => f.audience === g.id);
            if (!list.length) return null;
            return (
              <div key={g.id} className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
                <h2 className="text-3xl md:text-4xl">{g.title}</h2>
                <FaqList faqs={list} />
              </div>
            );
          })}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
